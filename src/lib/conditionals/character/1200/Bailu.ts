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
import { ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  MATCH_2P_WEIGHT,
  SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { ScoringMetadata } from 'types/metadata'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const BailuEntities = createEnum('Bailu')
export const BailuAbilities = createEnum('BASIC', 'SKILL_HEAL', 'ULT_HEAL', 'TALENT_HEAL', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bailu')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1211')

  const basicScaling = basic(e, 1.0, 1.1)

  const skillHealScaling = skill(e, 0.117, 0.1248)
  const skillHealFlat = skill(e, 312, 347.1)

  const ultHealScaling = ult(e, 0.135, 0.144)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.054, 0.0576)
  const talentHealFlat = talent(e, 144, 160.2)

  const defaults = {
    healingMaxHpBuff: true,
    talentDmgReductionBuff: true,
    e2UltHealingBuff: true,
    e4SkillHealingDmgBuffStacks: 0,
  }

  const teammateDefaults = {
    healingMaxHpBuff: true,
    talentDmgReductionBuff: true,
    e4SkillHealingDmgBuffStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    healingMaxHpBuff: {
      id: 'healingMaxHpBuff',
      formItem: 'switch',
      text: t('Content.healingMaxHpBuff.text'),
      content: t('Content.healingMaxHpBuff.content'),
    },
    talentDmgReductionBuff: {
      id: 'talentDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.talentDmgReductionBuff.text'),
      content: t('Content.talentDmgReductionBuff.content'),
    },
    e2UltHealingBuff: {
      id: 'e2UltHealingBuff',
      formItem: 'switch',
      text: t('Content.e2UltHealingBuff.text'),
      content: t('Content.e2UltHealingBuff.content'),
      disabled: e < 2,
    },
    e4SkillHealingDmgBuffStacks: {
      id: 'e4SkillHealingDmgBuffStacks',
      formItem: 'slider',
      text: t('Content.e4SkillHealingDmgBuffStacks.text'),
      content: t('Content.e4SkillHealingDmgBuffStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    healingMaxHpBuff: content.healingMaxHpBuff,
    talentDmgReductionBuff: content.talentDmgReductionBuff,
    e4SkillHealingDmgBuffStacks: content.e4SkillHealingDmgBuffStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(BailuEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BailuEntities.Bailu]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(BailuAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [BailuAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [BailuAbilities.SKILL_HEAL]: {
          hits: [
            HitDefinitionBuilder.skillHeal()
              .hpScaling(skillHealScaling)
              .flatHeal(skillHealFlat)
              .build(),
          ],
        },
        [BailuAbilities.ULT_HEAL]: {
          hits: [
            HitDefinitionBuilder.ultHeal()
              .hpScaling(ultHealScaling)
              .flatHeal(ultHealFlat)
              .build(),
          ],
        },
        [BailuAbilities.TALENT_HEAL]: {
          hits: [
            HitDefinitionBuilder.heal()
              .hpScaling(talentHealScaling)
              .flatHeal(talentHealFlat)
              .build(),
          ],
        },
        [BailuAbilities.BREAK]: {
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
      x.buff(StatKey.OHB, (e >= 2 && r.e2UltHealingBuff) ? 0.15 : 0, x.source(SOURCE_E2))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.HP_P, (m.healingMaxHpBuff) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (e >= 4) ? m.e4SkillHealingDmgBuffStacks * 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
      x.multiplicativeComplement(StatKey.DMG_RED, (m.talentDmgReductionBuff) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}


const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0.25,
    [Stats.DEF_P]: 0.25,
    [Stats.HP]: 1,
    [Stats.HP_P]: 1,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0.50,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.OHB,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.HP_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
      Stats.ERR,
    ],
  },
  sets: {
    [Sets.LongevousDisciple]: MATCH_2P_WEIGHT,
    [Sets.SacerdosRelivedOrdeal]: MATCH_2P_WEIGHT,
    [Sets.MessengerTraversingHackerspace]: 1,
    [Sets.PasserbyOfWanderingCloud]: 1,

    ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
    [Sets.GiantTreeOfRaptBrooding]: 1,
  },
  presets: [
    PresetEffects.WARRIOR_SET,
  ],
  sortOption: SortOption.TALENT_HEAL,
  addedColumns: [SortOption.OHB],
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.ULT,
    SortOption.FUA,
    SortOption.DOT,
  ],
}

const display = {
  imageCenter: {
    x: 1050,
    y: 950,
    z: 1.05,
  },
  showcaseColor: '#5f9ce2',
}

export const Bailu: CharacterConfig = {
  id: '1211',
  info: {},
  conditionals,
  scoring,
  display,
}
