import { BREAK_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SailingTowardsASecondLife')

  const sValuesSpdBuff = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDefShred = [0.20, 0.23, 0.26, 0.29, 0.32]

  const defaults = {
    breakDmgDefShred: true,
    spdBuffConditional: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakDmgDefShred: {
      lc: true,
      id: 'breakDmgDefShred',
      formItem: 'switch',
      text: t('Content.breakDmgDefShred.text'),
      content: t('Content.breakDmgDefShred.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
    },
    spdBuffConditional: {
      lc: true,
      id: 'spdBuffConditional',
      formItem: 'switch',
      text: t('Content.spdBuffConditional.text'),
      content: t('Content.spdBuffConditional.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpdBuff[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals
      buffAbilityDefPen(x, BREAK_TYPE, (r.breakDmgDefShred) ? sValuesDefShred[s] : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    dynamicConditionals: [
      {
        id: 'SailingTowardsASecondLifeConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.BE],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r: Conditionals<typeof content> = action.lightConeConditionals

          return r.spdBuffConditional && x.a[Key.BE] >= 1.50
        },
        effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
          x.SPD.buffDynamic((sValuesSpdBuff[s]) * context.baseSPD, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return conditionalWgslWrapper(this, `
if (
  (*p_state).SailingTowardsASecondLifeConditional == 0.0 &&
  (*p_x).BE >= 1.50
) {
  (*p_state).SailingTowardsASecondLifeConditional = 1.0;
  buffDynamicSPD_P(${sValuesSpdBuff[s]}, p_x, p_state);
}
    `)
        },
      },
    ],
  }
}
