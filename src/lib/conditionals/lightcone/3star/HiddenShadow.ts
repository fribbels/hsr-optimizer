import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.60, 0.75, 0.90, 1.05, 1.20]
  const lcRanks = {
    id: '20018',
    skill: 'Mechanism',
    desc: "After using Skill, the wearer's next Basic ATK deals Additional DMG equal to #1[i]% of ATK to the target enemy.",
    params: [[0.6], [0.75], [0.9], [1.05], [1.2]],
    properties: [[], [], [], [], []],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'basicAtkBuff', // TODO: this isnt a basicAtkBuff its more like basicAtkExtraDmgProc?
    name: 'basicAtkBuff',
    formItem: 'switch',
    text: 'Basic ATK extra DMG',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      basicAtkBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.BASIC_SCALING += (r.basicAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
