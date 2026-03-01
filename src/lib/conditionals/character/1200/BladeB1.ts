import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { SortOption } from 'lib/optimization/sortOptions'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  MATCH_2P_WEIGHT,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  DEFAULT_ULT,
  END_BASIC,
  DEFAULT_FUA,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  BLADE_B1,
  TRIBBIE,
  SUNDAY,
  HYACINE,
  IF_TIME_WERE_A_FLOWER,
  A_GROUNDED_ASCENT,
  LONG_MAY_RAINBOWS_ADORN_THE_SKY,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const BladeB1Entities = createEnum('BladeB1')
export const BladeB1Abilities = createEnum('BASIC', 'ULT', 'FUA', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BladeB1.Content')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character(BLADE_B1)

  const enhancedStateDmgBoost = skill(e, 0.40, 0.456)
  const hpPercentLostTotalMax = 0.90

  const basicScaling = basic(e, 0.50, 0.55)
  const basicEnhancedHpScaling = skill(e, 1.30, 1.43)

  const ultHpScaling = ult(e, 1.50, 1.62)
  const ultLostHpScaling = ult(e, 1.20, 1.296)

  const fuaHpScaling = talent(e, 1.30, 1.43)

  const defaults = {
    enhancedStateActive: true,
    hpPercentLostTotal: hpPercentLostTotalMax,
    e1BasicUltMultiBoost: true,
    e2CrBuff: true,
    e4MaxHpIncreaseStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('enhancedStateActive.text'),
      content: t('enhancedStateActive.content', { DmgBuff: TsUtils.precisionRound(100 * enhancedStateDmgBoost) }),
    },
    hpPercentLostTotal: {
      id: 'hpPercentLostTotal',
      formItem: 'slider',
      text: t('hpPercentLostTotal.text'),
      content: t('hpPercentLostTotal.content', {
        UltHpScaling: TsUtils.precisionRound(100 * ultHpScaling),
        HpTallyUltScaling: TsUtils.precisionRound(100 * ultLostHpScaling),
      }),
      min: 0,
      max: hpPercentLostTotalMax,
      percent: true,
    },
    e1BasicUltMultiBoost: {
      id: 'e1BasicUltMultiBoost',
      formItem: 'switch',
      text: t('e1BasicUltMultiBoost.text'),
      content: t('e1BasicUltMultiBoost.content'),
      disabled: e < 1,
    },
    e2CrBuff: {
      id: 'e2CrBuff',
      formItem: 'switch',
      text: t('e2CrBuff.text'),
      content: t('e2CrBuff.content'),
      disabled: e < 2,
    },
    e4MaxHpIncreaseStacks: {
      id: 'e4MaxHpIncreaseStacks',
      formItem: 'slider',
      text: t('e4MaxHpIncreaseStacks.text'),
      content: t('e4MaxHpIncreaseStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(BladeB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BladeB1Entities.BladeB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(BladeB1Abilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate HP scaling values based on conditionals
      const basicHpScaling = r.enhancedStateActive
        ? basicEnhancedHpScaling + ((e >= 1 && r.e1BasicUltMultiBoost) ? 1.50 * r.hpPercentLostTotal : 0)
        : basicScaling

      const ultTotalHpScaling = ultHpScaling
        + ultLostHpScaling * r.hpPercentLostTotal
        + ((e >= 1 && r.e1BasicUltMultiBoost) ? 1.50 * r.hpPercentLostTotal : 0)

      const fuaTotalHpScaling = fuaHpScaling + ((e >= 6) ? 0.50 : 0)

      return {
        [BladeB1Abilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .hpScaling(basicHpScaling)
              .toughnessDmg(r.enhancedStateActive ? 20 : 10)
              .build(),
          ],
        },
        [BladeB1Abilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .hpScaling(ultTotalHpScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [BladeB1Abilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Wind)
              .hpScaling(fuaTotalHpScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [BladeB1Abilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.buff(StatKey.CR, (e >= 2 && r.enhancedStateActive && r.e2CrBuff) ? 0.15 : 0, x.source(SOURCE_E2))
      x.buff(StatKey.HP_P, (e >= 4) ? r.e4MaxHpIncreaseStacks * 0.20 : 0, x.source(SOURCE_E4))

      // Boost
      x.buff(StatKey.DMG_BOOST, r.enhancedStateActive ? enhancedStateDmgBoost : 0, x.source(SOURCE_SKILL))
      x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.HP_P,
    ],
    [Parts.Feet]: [
      Stats.HP_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.Wind_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.HP_P,
    Stats.HP,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_SKILL,
    DEFAULT_ULT,
    END_BASIC,
    DEFAULT_FUA,
    WHOLE_BASIC,
    WHOLE_BASIC,
    DEFAULT_FUA,
    WHOLE_BASIC,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.LongevousDisciple, Sets.LongevousDisciple],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.BoneCollectionsSereneDemesne,
    Sets.InertSalsotto,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: TRIBBIE,
      lightCone: IF_TIME_WERE_A_FLOWER,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: SUNDAY,
      lightCone: A_GROUNDED_ASCENT,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: HYACINE,
      lightCone: LONG_MAY_RAINBOWS_ADORN_THE_SKY,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
}

const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 1,
    [Stats.HP_P]: 1,
    [Stats.SPD]: 1,
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.CD,
      Stats.CR,
      Stats.HP_P,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.HP_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.Wind_DMG,
      Stats.HP_P,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  sets: {
    [Sets.ScholarLostInErudition]: MATCH_2P_WEIGHT,
    [Sets.LongevousDisciple]: 1,
    [Sets.EagleOfTwilightLine]: 1,
    [Sets.MusketeerOfWildWheat]: T2_WEIGHT,

    [Sets.BoneCollectionsSereneDemesne]: 1,
    [Sets.RutilantArena]: 1,
    [Sets.InertSalsotto]: 1,
  },
  presets: [
    PresetEffects.VALOROUS_SET,
    PresetEffects.fnSacerdosSet(1),
  ],
  sortOption: SortOption.BASIC,
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 990,
    y: 800,
    z: 1,
  },
  showcaseColor: '#4d69be',
}

export const BladeB1: CharacterConfig = {
  id: '1205b1',
  info: {},
  conditionals,
  scoring,
  display,
}
