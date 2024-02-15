import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional/* , request: Form */) => {
      x.DOT_BOOST += sValues[s]
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
