import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const lcRanks = {
    id: '21011',
    skill: 'Departure',
    desc: 'After entering battle, if an ally deals the same DMG Type as the wearer, DMG dealt increases by #1[i]%.',
    params: [[0.12], [0.15], [0.18], [0.21], [0.24]],
    properties: [[], [], [], [], []],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'alliesSameElement',
    name: 'alliesSameElement',
    formItem: 'switch',
    text: 'Same element ally DMG boost',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      alliesSameElement: true,
    }),
    teammateDefaults: () => ({
      alliesSameElement: true,
    }),
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
