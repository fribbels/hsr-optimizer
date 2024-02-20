import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({
      name: true,
    }),
    precomputeEffects: (/* x: PrecomputedCharacterConditional, request: Form */) => { },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
