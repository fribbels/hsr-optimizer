import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type SuperImpositionLevel } from 'types/lightCone'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PerfectTiming')
  const { SOURCE_LC } = Source.lightCone(PerfectTiming.id)

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
        Scaling: precisionRound(100 * sValues[s]),
        Limit: precisionRound(100 * sMaxValues[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    dynamicConditionals: [
      {
        id: 'PerfectTimingConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.RES],
        chainsTo: [Stats.OHB],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals as Conditionals<typeof content>

          return r.resToHealingBoost
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.RES,
            Stats.OHB,
            this,
            x,
            action,
            context,
            SOURCE_LC,
            (convertibleValue) => Math.min(sMaxValues[s], sValues[s] * convertibleValue),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.RES,
            Stats.OHB,
            this,
            action,
            context,
            `min(${sMaxValues[s]}, ${sValues[s]} * convertibleValue)`,
            `${wgslTrue(r.resToHealingBoost)}`,
          )
        },
      },
    ],
  }
}

export const PerfectTiming: LightConeConfig = {
  id: '21014',
  conditionals,
}
