import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const lcRanks = {
    id: '21017',
    skill: 'Like Before You Leave!',
    desc: "Increases the DMG of the wearer's Basic ATK and Skill by #1[i]%. This effect increases by an extra #2[i]% when the wearer's current Energy reaches its max level.",
    params: [
      [0.24, 0.24],
      [0.3, 0.3],
      [0.36, 0.36],
      [0.42, 0.42],
      [0.48, 0.48],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'maxEnergyDmgBoost',
    name: 'maxEnergyDmgBoost',
    formItem: 'switch',
    text: 'Max energy DMG boost',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      maxEnergyDmgBoost: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.BASIC_BOOST += sValues[s]
      x.SKILL_BOOST += sValues[s]
      x.BASIC_BOOST += (r.maxEnergyDmgBoost) ? sValues[s] : 0
      x.SKILL_BOOST += (r.maxEnergyDmgBoost) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
