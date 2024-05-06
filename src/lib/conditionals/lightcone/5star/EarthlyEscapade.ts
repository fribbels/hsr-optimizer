import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCr = [0.10, 0.11, 0.12, 0.13, 0.14]
  const sValuesCd = [0.28, 0.35, 0.42, 0.49, 0.56]
  const lcRanks = {
    id: '23021',
    skill: 'Capriciousness',
    desc: "At the start of the battle, the wearer gains Mask, lasting for #6[i] turn(s). While the wearer has Mask, the wearer's allies have their CRIT Rate increased by #5[i]% and their CRIT DMG increased by #2[i]%. For every 1 Skill Point the wearer recovers (including Skill Points that exceed the limit), they gain 1 stack of Radiant Flame. And when the wearer has #4[i] stacks of Radiant Flame, all the stacks are removed, and they gain Mask for #3[i] turn(s).",
    params: [
      [0.32, 0.28, 4, 4, 0.1, 3],
      [0.39, 0.35, 4, 4, 0.11, 3],
      [0.46, 0.42, 4, 4, 0.12, 3],
      [0.53, 0.49, 4, 4, 0.13, 3],
      [0.6, 0.56, 4, 4, 0.14, 3],
    ],
    properties: [
      [{ type: 'CriticalDamageBase', value: 0.32 }],
      [{ type: 'CriticalDamageBase', value: 0.39 }],
      [{ type: 'CriticalDamageBase', value: 0.46 }],
      [{ type: 'CriticalDamageBase', value: 0.53 }],
      [{ type: 'CriticalDamageBase', value: 0.6 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'maskActive',
    name: 'maskActive',
    formItem: 'switch',
    text: 'Mask active',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
    }),
    teammateDefaults: () => ({
      maskActive: true,
    }),
    precomputeEffects: (_x: PrecomputedCharacterConditional, _request: Form) => {
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x[Stats.CR] += (t.maskActive) ? sValuesCr[s] : 0
      x[Stats.CD] += (t.maskActive) ? sValuesCd[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
