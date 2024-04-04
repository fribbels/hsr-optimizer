import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.024, 0.028, 0.032, 0.036, 0.04]

  const lcRank: LightConeRawRank = {
    id: '23017',
    skill: 'Deep, Deep Breaths',
    desc: "When the wearer provides healing for an ally, increases the healed ally's ATK by #3[f1]%. This effect can stack up to #4[i] times and lasts for #5[i] turn(s).",
    params: [
      [0.12, 0.1, 0.024, 5, 2],
      [0.14, 0.11, 0.028, 5, 2],
      [0.16, 0.12, 0.032, 5, 2],
      [0.18, 0.13, 0.036, 5, 2],
      [0.2, 0.14, 0.04, 5, 2],
    ],
    properties: [
      [{ type: 'SPRatioBase', value: 0.12 }],
      [{ type: 'SPRatioBase', value: 0.14 }],
      [{ type: 'SPRatioBase', value: 0.16 }],
      [{ type: 'SPRatioBase', value: 0.18 }],
      [{ type: 'SPRatioBase', value: 0.2 }],
    ],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBuffStacks',
    name: 'atkBuffStacks',
    formItem: 'slider',
    text: 'ATK buff stacks',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
    min: 0,
    max: 5,
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      atkBuffStacks: 5,
    }),
    teammateDefaults: () => ({
      atkBuffStacks: 5,
    }),
    precomputeEffects: (_x: PrecomputedCharacterConditional, _request: Form) => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.ATK_P] += m.atkBuffStacks * sValues[s]
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
