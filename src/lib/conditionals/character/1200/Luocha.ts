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
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  SPREAD_RELICS_2P_ATK_WEIGHTS,
  SPREAD_RELICS_2P_SPEED_WEIGHTS,
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

export const LuochaEntities = createEnum('Luocha')
export const LuochaAbilities = createEnum('BASIC', 'ULT', 'SKILL_HEAL', 'TALENT_HEAL', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luocha')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1203')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)

  const skillHealScaling = skill(e, 0.60, 0.64)
  const skillHealFlat = skill(e, 800, 890)

  const talentHealScaling = talent(e, 0.18, 0.192)
  const talentHealFlat = talent(e, 240, 267)

  const defaults = {
    fieldActive: true,
    e6ResReduction: true,
  }

  const teammateDefaults = {
    fieldActive: true,
    e6ResReduction: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    fieldActive: {
      id: 'fieldActive',
      formItem: 'switch',
      text: t('Content.fieldActive.text'),
      content: t('Content.fieldActive.content'),
      // disabled: e < 1, Not disabling this one since technically the field can be active at E0
    },
    e6ResReduction: {
      id: 'e6ResReduction',
      formItem: 'switch',
      text: t('Content.e6ResReduction.text'),
      content: t('Content.e6ResReduction.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    fieldActive: content.fieldActive,
    e6ResReduction: content.e6ResReduction,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(LuochaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [LuochaEntities.Luocha]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(LuochaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [LuochaAbilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Imaginary)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [LuochaAbilities.ULT]: {
        hits: [
          HitDefinitionBuilder.standardUlt()
            .damageElement(ElementTag.Imaginary)
            .atkScaling(ultScaling)
            .toughnessDmg(20)
            .build(),
        ],
      },
      [LuochaAbilities.SKILL_HEAL]: {
        hits: [
          HitDefinitionBuilder.skillHeal()
            .atkScaling(skillHealScaling)
            .flatHeal(skillHealFlat)
            .build(),
        ],
      },
      [LuochaAbilities.TALENT_HEAL]: {
        hits: [
          HitDefinitionBuilder.talentHeal()
            .atkScaling(talentHealScaling)
            .flatHeal(talentHealFlat)
            .build(),
        ],
      },
      [LuochaAbilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ATK_P, (e >= 1 && m.fieldActive) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
      x.buff(StatKey.RES_PEN, (e >= 6 && m.e6ResReduction) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}


const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 1,
    [Stats.ATK_P]: 1,
    [Stats.DEF]: 0.25,
    [Stats.DEF_P]: 0.25,
    [Stats.HP]: 0.25,
    [Stats.HP_P]: 0.25,
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
      Stats.HP_P,
      Stats.DEF_P,
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.HP_P,
      Stats.DEF_P,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
    ...SPREAD_RELICS_2P_ATK_WEIGHTS,
    [Sets.PasserbyOfWanderingCloud]: 1,
    [Sets.MusketeerOfWildWheat]: 1,

    ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  },
  presets: [
    PresetEffects.WASTELANDER_SET,
    PresetEffects.WARRIOR_SET,
  ],
  sortOption: SortOption.SPD,
  addedColumns: [SortOption.OHB],
  hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
}

const display = {
  imageCenter: {
    x: 1024,
    y: 975,
    z: 1.05,
  },
  showcaseColor: '#8ce2f4',
}

export const Luocha: CharacterConfig = {
  id: '1203',
  info: {},
  conditionals,
  scoring,
  display,
}
