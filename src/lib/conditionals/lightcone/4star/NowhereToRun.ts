import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRank = {
   *   "id": "21033",
   *   "skill": "Desperate Times",
   *   "desc": "Increases the wearer's ATK by #1[i]%. Whenever the wearer defeats an enemy, they restore HP equal to #2[i]% of their ATK.",
   *   "params": [[0.24, 0.12], [0.3, 0.15], [0.36, 0.18], [0.42, 0.21], [0.48, 0.24]],
   *   "properties": [[{"type": "AttackAddedRatio", "value": 0.24}], [{"type": "AttackAddedRatio", "value": 0.3}], [{"type": "AttackAddedRatio", "value": 0.36}], [{"type": "AttackAddedRatio", "value": 0.42}], [{"type": "AttackAddedRatio", "value": 0.48}]]
   * }
   */

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
