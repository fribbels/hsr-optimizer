import {
  AbilityType,
  SKILL_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const NatashaEntities = createEnum('Natasha')
export const NatashaAbilities = createEnum('BASIC', 'SKILL_HEAL', 'ULT_HEAL', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Natasha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_TRACE,
  } = Source.character('1105')

  const basicScaling = basic(e, 1.00, 1.10)

  const ultHealScaling = ult(e, 0.138, 0.1472)
  const ultHealFlat = ult(e, 368, 409.4)

  const skillHealScaling = skill(e, 0.105, 0.112)
  const skillHealFlat = skill(e, 280, 311.5)

  // E6: Basic attack gains HP scaling
  const e6BasicHpScaling = e >= 6 ? 0.40 : 0

  const defaults = {
  }

  const content: ContentDefinition<typeof defaults> = {
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(NatashaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [NatashaEntities.Natasha]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(NatashaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [NatashaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .hpScaling(e6BasicHpScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [NatashaAbilities.SKILL_HEAL]: {
          hits: [
            HitDefinitionBuilder.skillHeal()
              .hpScaling(skillHealScaling)
              .flatHeal(skillHealFlat)
              .build(),
          ],
        },
        [NatashaAbilities.ULT_HEAL]: {
          hits: [
            HitDefinitionBuilder.ultHeal()
              .hpScaling(ultHealScaling)
              .flatHeal(ultHealFlat)
              .build(),
          ],
        },
        [NatashaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.buff(StatKey.OHB, 0.10, x.source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
