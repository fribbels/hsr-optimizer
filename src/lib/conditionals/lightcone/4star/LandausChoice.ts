import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24]
  /*
   * const lcRank = {
   *   "id": "21009",
   *   "skill": "Time Fleets Away",
   *   "desc": "The wearer is more likely to be attacked, and DMG taken is reduced by #2[i]%.",
   *   "params": [
   *     [
   *       2,
   *       0.16
   *     ],
   *     [
   *       2,
   *       0.18
   *     ],
   *     [
   *       2,
   *       0.2
   *     ],
   *     [
   *       2,
   *       0.22
   *     ],
   *     [
   *       2,
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
    precomputeEffects: (x/* , request */) => {
      // const r = request.lightConeConditionals

      x.DMG_RED_MULTI *= (1 - sValues[s])
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
