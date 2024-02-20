import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const lcRanks = {
    id: '21006',
    skill: 'The Maiden in the Painting',
    desc: 'If the current HP of the target enemy is below or equal to #2[i]%, increases DMG dealt by follow-up attacks by an extra #3[i]%.',
    params: [
      [0.24, 0.5, 0.24],
      [0.3, 0.5, 0.3],
      [0.36, 0.5, 0.36],
      [0.42, 0.5, 0.42],
      [0.48, 0.5, 0.48],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHp50FuaBuff',
    name: 'enemyHp50FuaBuff',
    formItem: 'switch',
    text: 'Enemy HP < 50% fua buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enemyHp50FuaBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.FUA_BOOST += sValues[s]
      x.FUA_BOOST += (r.enemyHp50FuaBuff) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
