import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRank = {
   *   "id": "21018",
   *   "skill": "Cannot Stop It!",
   *   "desc": "When the wearer uses their Ultimate, all allies' actions are Advanced Forward by #1[i]%.",
   *   "params": [
   *     [
   *       0.16
   *     ],
   *     [
   *       0.18
   *     ],
   *     [
   *       0.2
   *     ],
   *     [
   *       0.22
   *     ],
   *     [
   *       0.24
   *     ]
   *   ],
   *   "properties": [
   *     [],
   *     [],
   *     [],
   *     [],
   *     []
   *   ]
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
