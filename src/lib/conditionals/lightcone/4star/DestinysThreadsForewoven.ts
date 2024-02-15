import { LightConeConditional } from 'types/LightConeConditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Stats } from 'lib/constants.ts'
import { SuperImpositionLevel } from 'types/LightCone'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.008, 0.009, 0.01, 0.011, 0.012]
  const sValuesMax = [0.32, 0.36, 0.40, 0.44, 0.48]

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (c: PrecomputedCharacterConditional/* , request: Form */) => {
      // const r = request.lightConeConditionals;
      const x = c['x']

      // TODO: Are these divisions ok with floats?
      x.ELEMENTAL_DMG += Math.min(sValuesMax[s], Math.floor(x[Stats.DEF] / 100) * sValues[s])
    },
  }
}
