import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.13, 0.14, 0.15, 0.16]
  const lcRanks = {
    id: '21015',
    skill: 'Glance Back',
    desc: "When the wearer hits an enemy and if the hit enemy is not already Ensnared, then there is a chance to Ensnare the hit enemy. Ensnared enemies' DEF decreases by #2[i]% for #3[i] turn(s).",
    params: [
      [0.6, 0.12, 1],
      [0.7, 0.13, 1],
      [0.8, 0.14, 1],
      [0.9, 0.15, 1],
      [1, 0.16, 1],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'targetEnsnared',
    name: 'targetEnsnared',
    formItem: 'switch',
    text: 'Target ensnared',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      targetEnsnared: true,
    }),
    teammateDefaults: () => ({
      targetEnsnared: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.DEF_PEN += (m.targetEnsnared) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
