import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { LightConeConditionalsController } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'

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
