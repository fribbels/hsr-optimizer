import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Form } from 'types/Form'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.008, 0.009, 0.01, 0.011, 0.012]
  const sValuesMax = [0.32, 0.36, 0.40, 0.44, 0.48]

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    precomputeEffects: (/* x, request */) => {
    },
    calculateBaseMultis: () => {
    },
    gpuConditionals: [
      {
        id: 'DestinysThreadsForewovenConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.DEF],
        condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          return true
        },
        effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          const stateValue = params.conditionalState[this.id] || 0
          const buffValue = Math.min(sValuesMax[s], Math.floor(x[Stats.DEF] / 100) * sValues[s])

          params.conditionalState[this.id] = buffValue
          x.ELEMENTAL_DMG += buffValue - stateValue
        },
        gpu: function (request: Form, params: OptimizerParams) {
          return conditionalWgslWrapper(this, `
let def = (*p_x).DEF;
let stateValue: f32 = (*p_state).DestinysThreadsForewovenConversionConditional;
let buffValue: f32 = min(${sValuesMax[s]}, floor(def / 100) * ${sValues[s]});

(*p_state).DestinysThreadsForewovenConversionConditional = buffValue;
(*p_x).ELEMENTAL_DMG += buffValue - stateValue;
    `)
        },
      },
    ],
  }
}
