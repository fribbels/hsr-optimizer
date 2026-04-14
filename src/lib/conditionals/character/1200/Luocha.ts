import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import { type ScoringMetadata } from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
export const LuochaEntities = createEnum('Luocha')
export const LuochaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ULT,
  AbilityKind.SKILL_HEAL,
  AbilityKind.TALENT_HEAL,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luocha')
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

    actionDeclaration: () => [...LuochaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AbilityKind.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Imaginary)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [AbilityKind.ULT]: {
        hits: [
          HitDefinitionBuilder.standardUlt()
            .damageElement(ElementTag.Imaginary)
            .atkScaling(ultScaling)
            .toughnessDmg(20)
            .build(),
        ],
      },
      [AbilityKind.SKILL_HEAL]: {
        hits: [
          HitDefinitionBuilder.skillHeal()
            .atkScaling(skillHealScaling)
            .flatHeal(skillHealFlat)
            .build(),
        ],
      },
      [AbilityKind.TALENT_HEAL]: {
        hits: [
          HitDefinitionBuilder.talentHeal()
            .atkScaling(talentHealScaling)
            .flatHeal(talentHealFlat)
            .build(),
        ],
      },
      [AbilityKind.BREAK]: {
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

const scoring = (): ScoringMetadata => ({
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
  presets: [
    PresetEffects.WASTELANDER_SET,
    PresetEffects.WARRIOR_SET,
  ],
  sortOption: SortOption.SPD,
  addedColumns: [SortOption.OHB],
  hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
})

const display = {
  imageCenter: {
    x: 1059,
    y: 921,
    z: 1.2,
  },
  spineCenter: {
    x: 1069,
    y: 981,
    z: 1.35,
  },
  showcaseColor: '#7499fb',
}

export const Luocha: CharacterConfig = {
  id: '1203',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
