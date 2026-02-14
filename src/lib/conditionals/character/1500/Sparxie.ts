import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SPARXIE } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export const SparxieEntities = createEnum('Sparxie')
export const SparxieAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
//   const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sparxie')
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
  } = Source.character(SPARXIE)

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

    entityDeclaration: () => Object.values(SparxieEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SparxieEntities.Sparxie]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SparxieAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [SparxieAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [SparxieAbilities.SKILL]: {
          hits: [],
        },
        [SparxieAbilities.ULT]: {
          hits: [],
        },
        [SparxieAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
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
