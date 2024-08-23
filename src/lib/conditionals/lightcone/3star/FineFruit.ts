import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    precomputeEffects: (/* x: PrecomputedCharacterConditional, request: Form */) => {
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (/* c, request */) => {
    },
  }
}
