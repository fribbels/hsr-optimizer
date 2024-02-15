import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  const lcRanks = {
    id: '20003',
    skill: 'Stasis',
    desc: "If the wearer's current HP is lower than #2[i]%, increases their DEF by a further #3[i]%.",
    params: [
      [0.16, 0.5, 0.16],
      [0.2, 0.5, 0.2],
      [0.24, 0.5, 0.24],
      [0.28, 0.5, 0.28],
      [0.32, 0.5, 0.32],
    ],
    properties: [
      [{ type: 'DefenceAddedRatio', value: 0.16 }],
      [{ type: 'DefenceAddedRatio', value: 0.2 }],
      [{ type: 'DefenceAddedRatio', value: 0.24 }],
      [{ type: 'DefenceAddedRatio', value: 0.28 }],
      [{ type: 'DefenceAddedRatio', value: 0.32 }]],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'hp50DefBuff',
    name: 'hp50DefBuff',
    formItem: 'switch',
    text: 'HP < 50% DEF buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      hp50DefBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.DEF_P] += (r.hp50DefBuff) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
