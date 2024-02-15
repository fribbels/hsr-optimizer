import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRank = {
   *   "id": "21004",
   *   "skill": "Old Photo",
   *   "desc": "Increases the wearer's Break Effect by #1[i]%. When the wearer attacks, additionally regenerates #2[i] Energy. This effect cannot be repeatedly triggered in a single turn.",
   *   "params": [
   *     [
   *       0.28,
   *       4
   *     ],
   *     [
   *       0.35,
   *       5
   *     ],
   *     [
   *       0.42,
   *       6
   *     ],
   *     [
   *       0.49,
   *       7
   *     ],
   *     [
   *       0.56,
   *       8
   *     ]
   *   ],
   *   "properties": [
   *     [
   *       {
   *         "type": "BreakDamageAddedRatioBase",
   *         "value": 0.28
   *       }
   *     ],
   *     [
   *       {
   *         "type": "BreakDamageAddedRatioBase",
   *         "value": 0.35
   *       }
   *     ],
   *     [
   *       {
   *         "type": "BreakDamageAddedRatioBase",
   *         "value": 0.42
   *       }
   *     ],
   *     [
   *       {
   *         "type": "BreakDamageAddedRatioBase",
   *         "value": 0.49
   *       }
   *     ],
   *     [
   *       {
   *         "type": "BreakDamageAddedRatioBase",
   *         "value": 0.56
   *       }
   *     ]
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
