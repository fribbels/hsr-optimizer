import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRanks = {
   *   "id": "20013",
   *   "skill": "Epiphany",
   *   "desc": "After the wearer uses their Skill, additionally regenerates #1[i] Energy. This effect cannot be repeatedly triggered in a single turn.",
   *   "params": [
   *     [
   *       8
   *     ],
   *     [
   *       9
   *     ],
   *     [
   *       10
   *     ],
   *     [
   *       11
   *     ],
   *     [
   *       12
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
   *   id: 'skillEnergy',
   *   name: 'skillEnergy',
   *   formItem: 'switch',
   *   text: 'Skill Energy',
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
