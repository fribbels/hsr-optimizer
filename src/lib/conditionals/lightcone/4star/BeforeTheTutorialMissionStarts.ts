import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  // const sValues = [0, 0, 0, 0, 0]

  /*
   * const lcRank = {
   *   "id": "22000",
   *   "skill": "Quick on the Draw",
   *   "desc": "Increases the wearer's Effect Hit Rate by #1[i]%. When the wearer attacks DEF-reduced enemies, regenerates #2[i] Energy.",
   *   "params": [[0.2, 4], [0.25, 5], [0.3, 6], [0.35, 7], [0.4, 8]],
   *   "properties": [[{"type": "StatusProbabilityBase", "value": 0.2}], [{"type": "StatusProbabilityBase", "value": 0.25}], [{"type": "StatusProbabilityBase", "value": 0.3}], [{"type": "StatusProbabilityBase", "value": 0.35}], [{"type": "StatusProbabilityBase", "value": 0.4}]]
   * };
   */

  /*
   * const content = [{
   *   lc: true,
   *   id: 'quickOnTheDraw',
   *   name: 'quickOnTheDraw',
   *   formItem: 'switch',
   *   text: 'Quick on the Draw',
   *   title: lcRank.skill,
   *   content: getContentFromLCRanks(s, lcRank),
   * }];
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
