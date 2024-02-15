import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'

import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.16, 0.19, 0.22, 0.25, 0.28]
  const lcRank = {
    id: '22001',
    skill: "I'm Not Afraid!",
    desc: 'When the wearer uses their Skill, increases Outgoing Healing by #2[i]%, lasting for #3[i] turn(s).',
    params: [
      [0.08, 0.16, 2],
      [0.09, 0.19, 2],
      [0.1, 0.22, 2],
      [0.11, 0.25, 2],
      [0.12, 0.28, 2],
    ],
    properties: [
      [{ type: 'HPAddedRatio', value: 0.08 }],
      [{ type: 'HPAddedRatio', value: 0.09 }],
      [{ type: 'HPAddedRatio', value: 0.1 }],
      [{ type: 'HPAddedRatio', value: 0.11 }],
      [{ type: 'HPAddedRatio', value: 0.12 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'postSkillHealBuff',
    name: 'postSkillHealBuff',
    formItem: 'switch',
    text: 'Post skill heal buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      postSkillHealBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.OHB] += (r.postSkillHealBuff) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
