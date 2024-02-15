import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRank = {
   *   "id": "21031",
   *   "skill": "Raging Waves",
   *   "desc": "Increases the wearer's CRIT Rate by #1[i]%. After a CRIT Hit, there is a #2[i]% fixed chance to dispel 1 buff on the target enemy. This effect can only trigger 1 time per attack.",
   *   "params": [[0.12, 0.16], [0.15, 0.2], [0.18, 0.24], [0.21, 0.28], [0.24, 0.32]],
   *   "properties": [[{"type": "CriticalChanceBase", "value": 0.12}], [{"type": "CriticalChanceBase", "value": 0.15}], [{"type": "CriticalChanceBase", "value": 0.18}], [{"type": "CriticalChanceBase", "value": 0.21}], [{"type": "CriticalChanceBase", "value": 0.24}]]
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
