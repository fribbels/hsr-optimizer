import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'

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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, sValues[s])
      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, sValues[s], (r.maxEnergyDmgBoost))
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
