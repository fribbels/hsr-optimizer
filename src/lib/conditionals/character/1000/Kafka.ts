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
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const KafkaEntities = createEnum('Kafka')
export const KafkaAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Kafka')
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
  } = Source.character('1005')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 0.80, 0.864)
  const fuaScaling = talent(e, 1.40, 1.596)
  const dotScaling = ult(e, 2.90, 3.183)
  const e6DotScaling = 1.56

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.15 + 2 * 0.15 + 3 * 0.15 + 4 * 0.15 + 5 * 0.15 + 6 * 0.25)

  const defaults = {
    e1DotDmgReceivedDebuff: true,
    e2TeamDotBoost: true,
  }

  const teammateDefaults = {
    e1DotDmgReceivedDebuff: true,
    e2TeamDotBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    e1DotDmgReceivedDebuff: {
      id: 'e1DotDmgReceivedDebuff',
      formItem: 'switch',
      text: t('Content.e1DotDmgReceivedDebuff.text'),
      content: t('Content.e1DotDmgReceivedDebuff.content'),
      disabled: e < 1,
    },
    e2TeamDotBoost: {
      id: 'e2TeamDotBoost',
      formItem: 'switch',
      text: t('Content.e2TeamDotBoost.text'),
      content: t('Content.e2TeamDotBoost.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e1DotDmgReceivedDebuff: content.e1DotDmgReceivedDebuff,
    e2TeamDotBoost: content.e2TeamDotBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(KafkaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [KafkaEntities.Kafka]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(KafkaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [KafkaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [KafkaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [KafkaAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [KafkaAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Lightning)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [KafkaAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.30)
              .damageElement(ElementTag.Lightning)
              .atkScaling(dotScaling + (e >= 6 ? e6DotScaling : 0))
              .build(),
          ],
        },
        [KafkaAbilities.BREAK]: {
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
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (e >= 1 && m.e1DotDmgReceivedDebuff) ? 0.30 : 0, x.damageType(DamageTag.DOT).targets(TargetTag.FullTeam).source(SOURCE_E1))
      x.buff(StatKey.DMG_BOOST, (e >= 2 && m.e2TeamDotBoost) ? 0.25 : 0, x.damageType(DamageTag.DOT).targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMulti, action)
    },
  }
}
