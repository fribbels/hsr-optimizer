import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0.10, 0.125, 0.15, 0.175, 0.20]
   * const lcRank = {
   *   "id": "21007",
   *   "skill": "Cure and Repair",
   *   "desc": "Increases the wearer's Outgoing Healing by #1[i]%. When using Skill, regenerates #2[f1] Energy for all allies.",
   *   "params": [
   *     [
   *       0.1,
   *       2
   *     ],
   *     [
   *       0.125,
   *       2.5
   *     ],
   *     [
   *       0.15,
   *       3
   *     ],
   *     [
   *       0.175,
   *       3.5
   *     ],
   *     [
   *       0.2,
   *       4
   *     ]
   *   ],
   *   "properties": [
   *     [
   *       {
   *         "type": "HealRatioBase",
   *         "value": 0.1
   *       }
   *     ],
   *     [
   *       {
   *         "type": "HealRatioBase",
   *         "value": 0.125
   *       }
   *     ],
   *     [
   *       {
   *         "type": "HealRatioBase",
   *         "value": 0.15
   *       }
   *     ],
   *     [
   *       {
   *         "type": "HealRatioBase",
   *         "value": 0.175
   *       }
   *     ],
   *     [
   *       {
   *         "type": "HealRatioBase",
   *         "value": 0.2
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
