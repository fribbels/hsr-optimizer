import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { Form } from 'types/Form'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.PerfectTiming')
  const sValues = [0.33, 0.36, 0.39, 0.42, 0.45]
  const sMaxValues = [0.15, 0.18, 0.21, 0.24, 0.27]
  const content: ContentItem[] = [{
    lc: true,
    id: 'resToHealingBoost',
    name: 'resToHealingBoost',
    formItem: 'switch',
    text: t('Content.resToHealingBoost.text'),
    title: t('Content.resToHealingBoost.title'),
    content: t('Content.resToHealingBoost.content', { Scaling: TsUtils.precisionRound(100 * sValues[s]), Limit: TsUtils.precisionRound(100 * sMaxValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      resToHealingBoost: true,
    }),
    precomputeEffects: () => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request) => {
    },
    dynamicConditionals: [
      {
        id: 'PerfectTimingConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.RES],
        condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          const r = request.lightConeConditionals

          return r.resToHealingBoost
        },
        effect: (x: ComputedStatsObject, request: Form, params: OptimizerParams) => {
          const boost = Math.min(sMaxValues[s], sValues[s] * x[Stats.RES])
          buffStat(x, request, params, Stats.OHB, boost)
        },
        gpu: function () {
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
