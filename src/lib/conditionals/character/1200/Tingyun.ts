import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { SortOption } from 'lib/optimization/sortOptions'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  SPREAD_RELICS_2P_ATK_WEIGHTS,
  SPREAD_RELICS_2P_SPEED_WEIGHTS,
} from 'lib/scoring/scoringConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { ScoringMetadata } from 'types/metadata'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const TingyunEntities = createEnum('Tingyun')
export const TingyunAbilities = createEnum('BASIC', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Tingyun')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1202')

  const skillAtkBoostMax = skill(e, 0.25, 0.27)
  const ultDmgBoost = ult(e, 0.50, 0.56)
  const skillAtkBoostScaling = skill(e, 0.50, 0.55)
  const skillLightningDmgBoostScaling = skill(e, 0.40, 0.44) + ((e >= 4) ? 0.20 : 0)
  const talentScaling = talent(e, 0.60, 0.66) + ((e >= 4) ? 0.20 : 0)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    benedictionBuff: false,
    skillSpdBuff: false,
    ultSpdBuff: false,
    ultDmgBuff: false,
  }

  const teammateDefaults = {
    benedictionBuff: true,
    ultSpdBuff: false,
    ultDmgBuff: true,
    teammateAtkBuffValue: skillAtkBoostScaling,
  }

  const content: ContentDefinition<typeof defaults> = {
    benedictionBuff: {
      id: 'benedictionBuff',
      formItem: 'switch',
      text: t('Content.benedictionBuff.text'),
      content: t('Content.benedictionBuff.content', {
        skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling),
        skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax),
        skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling),
      }),
    },
    skillSpdBuff: {
      id: 'skillSpdBuff',
      formItem: 'switch',
      text: t('Content.skillSpdBuff.text'),
      content: t('Content.skillSpdBuff.content'),
    },
    ultDmgBuff: {
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', { ultDmgBoost: TsUtils.precisionRound(100 * ultDmgBoost) }),
    },
    ultSpdBuff: {
      id: 'ultSpdBuff',
      formItem: 'switch',
      text: t('Content.ultSpdBuff.text'),
      content: t('Content.ultSpdBuff.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    benedictionBuff: content.benedictionBuff,
    teammateAtkBuffValue: {
      id: 'teammateAtkBuffValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateAtkBuffValue.text'),
      content: t('TeammateContent.teammateAtkBuffValue.content', {
        skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling),
        skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax),
        skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling),
      }),
      min: 0,
      max: skillAtkBoostScaling,
      percent: true,
    },
    ultDmgBuff: content.ultDmgBuff,
    ultSpdBuff: content.ultSpdBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(TingyunEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TingyunEntities.Tingyun]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(TingyunAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [TingyunAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(
              (r.benedictionBuff)
                ? [
                    HitDefinitionBuilder.standardAdditional()
                      .damageElement(ElementTag.Lightning)
                      .atkScaling(skillLightningDmgBoostScaling + talentScaling)
                      .build(),
                  ]
                : []
            ),
          ],
        },
        [TingyunAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.buff(StatKey.SPD_P, (r.skillSpdBuff) ? 0.20 : 0, x.source(SOURCE_TRACE))

      // Boost
      x.buff(StatKey.DMG_BOOST, 0.40, x.damageType(DamageTag.BASIC).source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.SPD_P, (e >= 1 && m.ultSpdBuff) ? 0.20 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E1))
      x.buff(StatKey.DMG_BOOST, (m.ultDmgBuff) ? ultDmgBoost : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_ULT))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ATK_P, (t.benedictionBuff) ? t.teammateAtkBuffValue : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_SKILL))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'TingyunAtkConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.benedictionBuff
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_TRACE, (convertibleValue) => convertibleValue * skillAtkBoostMax)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.ATK,
            this,
            action,
            context,
            `${skillAtkBoostMax} * convertibleValue`,
            `${wgslTrue(r.benedictionBuff)}`,
          )
        },
      },
    ],
  }
}


const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0.75,
    [Stats.ATK_P]: 0.75,
    [Stats.DEF]: 0.25,
    [Stats.DEF_P]: 0.25,
    [Stats.HP]: 0.25,
    [Stats.HP_P]: 0.25,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0.25,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
      Stats.HP_P,
      Stats.DEF_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.DEF_P,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
    ...SPREAD_RELICS_2P_ATK_WEIGHTS,
    [Sets.SacerdosRelivedOrdeal]: 1,
    [Sets.MessengerTraversingHackerspace]: 1,
    [Sets.MusketeerOfWildWheat]: 1,

    ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  },
  presets: [],
  sortOption: SortOption.SPD,
  hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
}

const display = {
  imageCenter: {
    x: 1024,
    y: 950,
    z: 1,
  },
  showcaseColor: '#f4b5d4',
}

export const Tingyun: CharacterConfig = {
  id: '1202',
  info: {},
  conditionals,
  scoring,
  display,
}