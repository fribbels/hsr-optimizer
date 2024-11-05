import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
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
