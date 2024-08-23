import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.36, 0.42, 0.48, 0.54, 0.60]

  const lcRank: LightConeRawRank = {
    id: '23012',
    skill: 'Sweet Dreams',
    desc: "When the wearer's Basic ATK or Skill does not result in a CRIT Hit, increases their CRIT Rate by #2[i]% for #3[i] turn(s). This effect can only trigger once every #4[i] turn(s).",
    params: [
      [0.3, 0.36, 1, 3],
      [0.35, 0.42, 1, 3],
      [0.4, 0.48, 1, 3],
      [0.45, 0.54, 1, 3],
      [0.5, 0.6, 1, 3],
    ],
    properties: [
      [{ type: 'CriticalDamageBase', value: 0.3 }],
      [{ type: 'CriticalDamageBase', value: 0.35 }],
      [{ type: 'CriticalDamageBase', value: 0.4 }],
      [{ type: 'CriticalDamageBase', value: 0.45 }],
      [{ type: 'CriticalDamageBase', value: 0.5 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'missedCritCrBuff',
    name: 'missedCritCrBuff',
    formItem: 'switch',
    text: 'Missed crit CR buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    defaults: () => ({
      missedCritCrBuff: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.missedCritCrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
