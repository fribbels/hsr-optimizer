import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { BETA_UPDATE, Stats } from 'lib/constants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCd = [0.18, 0.225, 0.27, 0.315, 0.36]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'cdBuff',
      name: 'cdBuff',
      formItem: 'switch',
      text: 'CD buff',
      title: 'CD buff',
      content: BETA_UPDATE,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      cdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.cdBuff) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
