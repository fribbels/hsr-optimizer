import { LightConeConditional } from 'types/LightConeConditionals'

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  /*
   * const sValues = [0, 0, 0, 0, 0]
   * const lcRanks = {
   *   "id": "20017",
   *   "skill": "IPC",
   *   "desc": "When the wearer Breaks an enemy's Weakness, the wearer restores HP by #1[i]% of their Max HP.",
   *   "params": [[0.12], [0.14], [0.16], [0.18], [0.2]],
   *   "properties": [[], [], [], [], []]
   * };
   * const content = [{
   *   lc: true,
   *   id: 'weaknessHeal',
   *   name: 'weaknessHeal',
   *   formItem: 'switch',
   *   text: 'Weakness heal',
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
