import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.48, 0.60, 0.72, 0.84, 0.96]
  const lcRank = {
    id: '21029',
    skill: 'A Discourse in Arms',
    desc: "After the wearer uses Basic ATK or Skill, deals Additional DMG equal to #1[i]% of the wearer's ATK to a random enemy that has been attacked.",
    params: [
      [0.48],
      [0.60],
      [0.72],
      [0.84],
      [0.96],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'extraDmgProc',
    name: 'extraDmgProc',
    formItem: 'switch',
    text: 'Additional DMG proc',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      extraDmgProc: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.BASIC_SCALING += (r.extraDmgProc) ? sValues[s] : 0
      x.SKILL_SCALING += (r.extraDmgProc) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
