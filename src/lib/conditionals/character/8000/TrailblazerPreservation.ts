import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
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
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { ScoringMetadata } from 'types/metadata'

import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const TrailblazerPreservationEntities = createEnum('TrailblazerPreservation')
export const TrailblazerPreservationAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ULT,
  AbilityKind.TALENT_SHIELD,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerPreservation')
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
  } = Source.character(TrailblazerPreservationStelle.id)

  const skillDamageReductionValue = skill(e, 0.50, 0.52)

  const basicAtkScaling = basic(e, 1.00, 1.10)
  const basicDefScaling = (e >= 1) ? 0.25 : 0
  const basicEnhancedAtkScaling = basic(e, 1.35, 1.463)
  const basicEnhancedDefScaling = (e >= 1) ? 0.50 : 0
  const ultAtkScaling = ult(e, 1.00, 1.10)
  const ultDefScaling = ult(e, 1.50, 1.65)

  const talentShieldScaling = talent(e, 0.06, 0.064)
  const talentShieldFlat = talent(e, 80, 89)

  const defaults = {
    enhancedBasic: true,
    skillActive: true,
    shieldActive: true,
    e6DefStacks: 3,
  }

  const teammateDefaults = {
    skillActive: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { basicEnhancedAtkScaling: TsUtils.precisionRound(100 * basicEnhancedAtkScaling) }),
    },
    skillActive: {
      id: 'skillActive',
      formItem: 'switch',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', { skillDamageReductionValue: TsUtils.precisionRound(100 * skillDamageReductionValue) }),
    },
    shieldActive: {
      id: 'shieldActive',
      formItem: 'switch',
      text: t('Content.shieldActive.text'),
      content: t('Content.shieldActive.content'),
    },
    e6DefStacks: {
      id: 'e6DefStacks',
      formItem: 'slider',
      text: t('Content.e6DefStacks.text'),
      content: t('Content.e6DefStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillActive: content.skillActive,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(TrailblazerPreservationEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TrailblazerPreservationEntities.TrailblazerPreservation]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...TrailblazerPreservationAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const basicAtk = r.enhancedBasic ? basicEnhancedAtkScaling : basicAtkScaling
      const basicDef = r.enhancedBasic ? basicEnhancedDefScaling : basicDefScaling
      const basicToughness = r.enhancedBasic ? 20 : 10

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicAtk)
              .defScaling(basicDef)
              .toughnessDmg(basicToughness)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultAtkScaling)
              .defScaling(ultDefScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.TALENT_SHIELD]: {
          hits: [
            HitDefinitionBuilder.shield()
              .defScaling(talentShieldScaling)
              .flatShield(talentShieldFlat)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: DEF% stacks
      x.buff(StatKey.DEF_P, (e >= 6) ? r.e6DefStacks * 0.10 : 0, x.source(SOURCE_E6))

      // Trace: ATK% when shield active
      x.buff(StatKey.ATK_P, (r.shieldActive) ? 0.15 : 0, x.source(SOURCE_TRACE))

      // Skill: Damage reduction (self only)
      x.multiplicativeComplement(StatKey.DMG_RED, (r.skillActive) ? skillDamageReductionValue : 0, x.source(SOURCE_SKILL))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace: 15% damage reduction for all allies
      x.multiplicativeComplement(StatKey.DMG_RED, (m.skillActive) ? 0.15 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 1,
    [Stats.DEF_P]: 1,
    [Stats.HP]: 0.25,
    [Stats.HP_P]: 0.25,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0.75,
    [Stats.RES]: 0.5,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.DEF_P,
    ],
    [Parts.Feet]: [
      Stats.DEF_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.DEF_P,
    ],
    [Parts.LinkRope]: [
      Stats.DEF_P,
      Stats.ERR,
    ],
  },
  presets: [],
  sortOption: SortOption.TALENT_SHIELD,
  addedColumns: [],
  hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
})

const displayCaelus = {
  imageCenter: {
    x: 980,
    y: 1024,
    z: 1.05,
  },
  showcaseColor: '#756d96',
}

const displayStelle = {
  imageCenter: {
    x: 1050,
    y: 1024,
    z: 1.05,
  },
  showcaseColor: '#756d96',
}

export const TrailblazerPreservationCaelus: CharacterConfig = {
  id: '8003',
  display: displayCaelus,
  conditionals,
  get scoring() {
    return scoring()
  },
}

export const TrailblazerPreservationStelle: CharacterConfig = {
  id: '8004',
  display: displayStelle,
  conditionals,
  get scoring() {
    return scoring()
  },
}
