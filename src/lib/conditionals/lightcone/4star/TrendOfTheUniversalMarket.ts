import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRank = {
   *   "id": "21016",
   *   "skill": "A New Round of Shuffling",
   *   "desc": "Increases the wearer's DEF by #1[i]%. When the wearer is attacked, there is a #2[i]% base chance to Burn the enemy. For each turn, the wearer deals DoT that is equal to #3[i]% of the wearer's DEF for #4[i] turn(s).",
   *   "params": [
   *     [
   *       0.16,
   *       1,
   *       0.4,
   *       2
   *     ],
   *     [
   *       0.2,
   *       1.05,
   *       0.5,
   *       2
   *     ],
   *     [
   *       0.24,
   *       1.1,
   *       0.6,
   *       2
   *     ],
   *     [
   *       0.28,
   *       1.15,
   *       0.7,
   *       2
   *     ],
   *     [
   *       0.32,
   *       1.2,
   *       0.8,
   *       2
   *     ]
   *   ],
   *   "properties": [
   *     [
   *       {
   *         "type": "DefenceAddedRatio",
   *         "value": 0.16
   *       }
   *     ],
   *     [
   *       {
   *         "type": "DefenceAddedRatio",
   *         "value": 0.2
   *       }
   *     ],
   *     [
   *       {
   *         "type": "DefenceAddedRatio",
   *         "value": 0.24
   *       }
   *     ],
   *     [
   *       {
   *         "type": "DefenceAddedRatio",
   *         "value": 0.28
   *       }
   *     ],
   *     [
   *       {
   *         "type": "DefenceAddedRatio",
   *         "value": 0.32
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
