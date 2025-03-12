import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone('21009')

  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: (x: ComputedStatsArray) => {
      x.DMG_RED_MULTI.multiply(1 - sValues[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
