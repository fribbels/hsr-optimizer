import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { BETA_UPDATE, Stats } from 'lib/constants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCd = [0.16, 0.20, 0.24, 0.28, 0.32]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'cdBuff',
      name: 'cdBuff',
      formItem: 'switch',
      text: 'Double path CD buff',
      title: 'Double path CD buff',
      content: BETA_UPDATE,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      cdBuff: true,
    }),
    teammateDefaults: () => ({
      cdBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.CD] += (m.cdBuff) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
