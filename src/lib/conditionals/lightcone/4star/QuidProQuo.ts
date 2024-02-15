import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRank = {
   *   "id": "21021",
   *   "skill": "Enjoy With Rapture",
   *   "desc": "At the start of the wearer's turn, regenerates #2[i] Energy for a randomly chosen ally (excluding the wearer) whose current Energy is lower than #1[i]%.",
   *   "params": [
   *     [
   *       0.5,
   *       8
   *     ],
   *     [
   *       0.5,
   *       10
   *     ],
   *     [
   *       0.5,
   *       12
   *     ],
   *     [
   *       0.5,
   *       14
   *     ],
   *     [
   *       0.5,
   *       16
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
