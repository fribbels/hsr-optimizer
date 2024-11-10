import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PerfectTiming')

  const sValues = [0.33, 0.36, 0.39, 0.42, 0.45]
  const sMaxValues = [0.15, 0.18, 0.21, 0.24, 0.27]

  const defaults = {
    resToHealingBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    resToHealingBoost: {
      lc: true,
      id: 'resToHealingBoost',
      formItem: 'switch',
      text: t('Content.resToHealingBoost.text'),
      content: t('Content.resToHealingBoost.content', {
        Scaling: TsUtils.precisionRound(100 * sValues[s]),
        Limit: TsUtils.precisionRound(100 * sMaxValues[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: () => {
    },
    finalizeCalculations: (x: ComputedStatsArray, request) => {
    },
    dynamicConditionals: [
      {
        id: 'PerfectTimingConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.RES],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals as Conditionals<typeof content>

          return r.resToHealingBoost
        },
        effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
          const boost = Math.min(sMaxValues[s], sValues[s] * x.a[Key.RES])
          x.OHB.buffDynamic(boost, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return conditionalWgslWrapper(this, `
if (
  (*p_state).PerfectTimingConditional == 0.0
) {
  (*p_state).PerfectTimingConditional = 1.0;
  
  let boost = min(${sMaxValues[s]}, ${sValues[s]} * x.RES);
  buffDynamicOHB(boost, p_x, p_state);
}
    `)
        },
      },
    ],
  }
}
