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
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SeeleEntities = createEnum('Seele')
export const SeeleAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Seele')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
  const {
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_E1,
  } = Source.character('1102')

  const buffedStateDmgBuff = talent(e, 0.80, 0.88)
  const speedBoostStacksMax = e >= 2 ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.25, 4.59)

  // E6: Additional damage equal to 15% of Seele's Ult multiplier
  const e6AdditionalDmgScaling = 0.15 * ultScaling

  const defaults = {
    buffedState: true,
    speedBoostStacks: speedBoostStacksMax,
    e1EnemyHp80CrBoost: false,
    e6UltTargetDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffedState: {
      id: 'buffedState',
      formItem: 'switch',
      text: t('Content.buffedState.text'),
      content: t('Content.buffedState.content', { buffedStateDmgBuff: TsUtils.precisionRound(100 * buffedStateDmgBuff) }),
    },
    speedBoostStacks: {
      id: 'speedBoostStacks',
      formItem: 'slider',
      text: t('Content.speedBoostStacks.text'),
      content: t('Content.speedBoostStacks.content'),
      min: 0,
      max: speedBoostStacksMax,
    },
    e1EnemyHp80CrBoost: {
      id: 'e1EnemyHp80CrBoost',
      formItem: 'switch',
      text: t('Content.e1EnemyHp80CrBoost.text'),
      content: t('Content.e1EnemyHp80CrBoost.content'),
      disabled: e < 1,
    },
    e6UltTargetDebuff: {
      id: 'e6UltTargetDebuff',
      formItem: 'switch',
      text: t('Content.e6UltTargetDebuff.text'),
      content: t('Content.e6UltTargetDebuff.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(SeeleEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SeeleEntities.Seele]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SeeleAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e6Active = e >= 6 && r.e6UltTargetDebuff

      return {
        [SeeleAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(e6Active
              ? [HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(e6AdditionalDmgScaling)
                  .build()]
              : []),
          ],
        },
        [SeeleAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(e6Active
              ? [HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(e6AdditionalDmgScaling)
                  .build()]
              : []),
          ],
        },
        [SeeleAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
            ...(e6Active
              ? [HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(e6AdditionalDmgScaling)
                  .build()]
              : []),
          ],
        },
        [SeeleAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (e >= 1 && r.e1EnemyHp80CrBoost) ? 0.15 : 0, x.source(SOURCE_E1))
      x.buff(StatKey.SPD_P, 0.25 * r.speedBoostStacks, x.source(SOURCE_SKILL))

      x.buff(StatKey.DMG_BOOST, (r.buffedState) ? buffedStateDmgBuff : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.RES_PEN, (r.buffedState) ? 0.20 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // TODO: Seele's E6 should have a teammate effect but its kinda hard to calc
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
