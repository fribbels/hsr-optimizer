import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: (x: ComputedStatsArray) => {
      x.DMG_RED_MULTI.multiply(1 - sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
