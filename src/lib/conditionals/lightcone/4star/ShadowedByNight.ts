import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { BETA_UPDATE, Stats } from 'lib/constants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesSpdBuff = [0.08, 0.09, 0.10, 0.11, 0.12]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'spdBuff',
      name: 'spdBuff',
      formItem: 'switch',
      text: 'SPD buff',
      title: 'SPD buff',
      content: BETA_UPDATE,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      spdBuff: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.SPD_P] += (r.spdBuff) ? sValuesSpdBuff[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
