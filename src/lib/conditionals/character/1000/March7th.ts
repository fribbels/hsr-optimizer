import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const March7thEntities = createEnum('March7th')
export const March7thAbilities = createEnum('BASIC', 'ULT', 'FUA', 'SKILL_SHIELD', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
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
  } = Source.character('1001')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 1.50, 1.62)
  const fuaScaling = talent(e, 1.00, 1.10)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const skillShieldScaling = skill(e, 0.57, 0.608)
  const skillShieldFlat = skill(e, 760, 845.5)

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA, AbilityType.DOT],
    content: () => [],
    defaults: () => ({}),

    entityDeclaration: () => Object.values(March7thEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [March7thEntities.March7th]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(March7thAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      // E4: FUA gains DEF scaling
      const fuaDefScaling = (e >= 4) ? 0.30 : 0

      return {
        [March7thAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [March7thAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [March7thAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Ice)
              .atkScaling(fuaScaling)
              .defScaling(fuaDefScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [March7thAbilities.SKILL_SHIELD]: {
          hits: [
            HitDefinitionBuilder.skillShield()
              .defScaling(skillShieldScaling)
              .flatShield(skillShieldFlat)
              .build(),
          ],
        },
        [March7thAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkContainer(hitMulti, action),
  }
}
