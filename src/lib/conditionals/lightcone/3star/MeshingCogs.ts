import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRanks = {
   *   "id": "20012",
   *   "skill": "Fleet Triumph",
   *   "desc": "After the wearer uses attacks or gets hit, additionally regenerates #1[i] Energy. This effect cannot be repeatedly triggered in a single turn.",
   *   "params": [
   *     [
   *       4
   *     ],
   *     [
   *       5
   *     ],
   *     [
   *       6
   *     ],
   *     [
   *       7
   *     ],
   *     [
   *       8
   *     ]
   *   ],
   *   "properties": [
   *     [],
   *     [],
   *     [],
   *     [],
   *     []
   *   ]
   * };
   * const content = [{
   *   lc: true,
   *   id: 'attackEnergy',
   *   name: 'attackEnergy',
   *   formItem: 'switch',
   *   text: 'Attack Energy',
   *   title: lcRanks.skill,
   *   content: getContentFromLCRanks(s, lcRanks),
   * }];
   */

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
