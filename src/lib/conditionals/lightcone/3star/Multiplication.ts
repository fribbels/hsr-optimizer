import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRanks = {
   *   "id": "20015",
   *   "skill": "Denizens of Abundance",
   *   "desc": "After the wearer uses their Basic ATK, their next action will be Advanced Forward by #1[i]%.",
   *   "params": [
   *     [
   *       0.12
   *     ],
   *     [
   *       0.14
   *     ],
   *     [
   *       0.16
   *     ],
   *     [
   *       0.18
   *     ],
   *     [
   *       0.2
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
   *   id: 'advancedForward',
   *   name: 'advancedForward',
   *   formItem: 'switch',
   *   text: 'Advanced Forward',
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
