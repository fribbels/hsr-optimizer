import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRank = {
   *   "id": "21028",
   *   "skill": "Tiny Light",
   *   "desc": "Increases the wearer's Max HP by #1[i]%. When using Basic ATK or Skill, restores all allies' HP by an amount equal to #2[f1]% of their respective Max HP.",
   *   "params": [[0.16, 0.02], [0.2, 0.025], [0.24, 0.03], [0.28, 0.035], [0.32, 0.04]],
   *   "properties": [[{"type": "HPAddedRatio", "value": 0.16}], [{"type": "HPAddedRatio", "value": 0.2}], [{"type": "HPAddedRatio", "value": 0.24}], [{"type": "HPAddedRatio", "value": 0.28}], [{"type": "HPAddedRatio", "value": 0.32}]]
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
