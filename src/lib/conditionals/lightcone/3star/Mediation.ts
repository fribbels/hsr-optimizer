import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [12, 14, 16, 18, 20]
  const lcRanks = {
    id: '20019',
    skill: 'Family',
    desc: 'Upon entering battle, increases SPD of all allies by #1[i] points for #2[i] turn(s).',
    params: [[12, 1], [14, 1], [16, 1], [18, 1], [20, 1]],
    properties: [[], [], [], [], []],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'initialSpdBuff',
    name: 'initialSpdBuff',
    formItem: 'switch',
    text: 'Initial SPD buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      initialSpdBuff: true,
    }),
    teammateDefaults: () => ({
      initialSpdBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.SPD] += (m.initialSpdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
