import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PerfectTiming')
  const { SOURCE_LC } = Source.lightCone('21014')

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
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.RES],
        chainsTo: [Stats.OHB],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals as Conditionals<typeof content>

          return r.resToHealingBoost
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.RES, Stats.OHB, this, x, action, context, SOURCE_LC,
            (convertibleValue) => Math.min(sMaxValues[s], sValues[s] * convertibleValue),
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.RES, Stats.OHB, this, action, context,
            `min(${sMaxValues[s]}, ${sValues[s]} * convertibleValue)`,
            `${wgslTrue(r.resToHealingBoost)}`,
          )
        },
      },
    ],
  }
}
