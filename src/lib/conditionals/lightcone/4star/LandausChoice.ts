import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject) => {
      x.DMG_RED_MULTI *= (1 - sValues[s])
    },
    finalizeCalculations: () => {
    },
  }
}
