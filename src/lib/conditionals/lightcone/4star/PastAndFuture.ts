export default (/* s: SuperImpositionLevel */) => {
  /*
   * const sValues = [0, 0, 0, 0, 0];
   * const lcRank = {
   *   "id": "21025",
   *   "skill": "Kites From the Past",
   *   "desc": "When the wearer uses their Skill, the next ally taking action (except the wearer) deals #1[i]% increased DMG for #2[i] turn(s).",
   *   "params": [[0.16, 1], [0.2, 1], [0.24, 1], [0.28, 1], [0.32, 1]],
   *   "properties": [[], [], [], [], []]
   * }
   */

  return {
    content: () => [],
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
