import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const AshveilEntities = createEnum('Ashveil')
export const AshveilAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Ashveil')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  // const {
  //   SOURCE_BASIC,
  //   SOURCE_SKILL,
  //   SOURCE_ULT,
  //   SOURCE_TALENT,
  //   SOURCE_TECHNIQUE,
  //   SOURCE_TRACE,
  //   SOURCE_MEMO,
  //   SOURCE_E1,
  //   SOURCE_E2,
  //   SOURCE_E4,
  //   SOURCE_E6,
  // } = Source.character(ASHVEIL)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const defaults = {}

  const teammateDefaults = {}

  const content: ContentDefinition<typeof defaults> = {}

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {}

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AshveilEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AshveilEntities.Ashveil]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(AshveilAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [AshveilAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AshveilAbilities.SKILL]: {
          hits: [],
        },
        [AshveilAbilities.ULT]: {
          hits: [],
        },
        [AshveilAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return ''
    },
  }
}
