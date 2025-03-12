import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone('21039')

  const sValues = [0.008, 0.009, 0.01, 0.011, 0.012]
  const sValuesMax = [0.32, 0.36, 0.40, 0.44, 0.48]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: () => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.ELEMENTAL_DMG.buff(Math.min(sValuesMax[s], Math.floor(x.a[Key.DEF] / 100) * sValues[s]), SOURCE_LC)
    },
    gpuFinalizeCalculations: () => {
      return `
x.ELEMENTAL_DMG += min(${sValuesMax[s]}, floor(x.DEF / 100) * ${sValues[s]});
      `
    },
  }
}
