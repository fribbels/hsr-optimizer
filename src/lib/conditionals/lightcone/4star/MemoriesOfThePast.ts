import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    precomputeEffects: (/* x, request */) => {
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (/* c, request */) => {
    },
  }
}
