import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24]

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    precomputeEffects: (x/* , request */) => {
      x.DMG_RED_MULTI *= (1 - sValues[s])
    },
    finalizeCalculations: (/* c, request */) => {
    },
  }
}
