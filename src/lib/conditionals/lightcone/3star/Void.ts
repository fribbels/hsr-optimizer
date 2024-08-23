import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.20, 0.25, 0, 30, 0.35, 0.40]
  const lcRanks = {
    id: '20004',
    skill: 'Fallen',
    desc: "At the start of the battle, the wearer's Effect Hit Rate increases by #1[i]% for #2[i] turn(s).",
    params: [
      [0.2, 3],
      [0.25, 3],
      [0.3, 3],
      [0.35, 3],
      [0.4, 3],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'initialEhrBuff',
    name: 'initialEhrBuff',
    formItem: 'switch',
    text: 'Initial EHR buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      initialEhrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.EHR] += (r.initialEhrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
