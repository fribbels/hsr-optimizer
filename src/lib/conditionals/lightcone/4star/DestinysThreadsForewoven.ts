import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const sValues = [0.008, 0.009, 0.01, 0.011, 0.012]
  const sValuesMax = [0.32, 0.36, 0.40, 0.44, 0.48]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: () => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.ELEMENTAL_DMG.buff(Math.min(sValuesMax[s], Math.floor(x.a[Key.DEF] / 100) * sValues[s]), Source.NONE)
    },
    gpuFinalizeCalculations: () => {
      return `
x.ELEMENTAL_DMG += min(${sValuesMax[s]}, floor(x.DEF / 100) * ${sValues[s]});
      `
    },
  }
}
