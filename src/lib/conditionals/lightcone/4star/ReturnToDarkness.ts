import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (/* c, request */) => {
    },
  }
}
