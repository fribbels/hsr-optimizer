import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { BETA_UPDATE } from 'lib/constants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const content: ContentItem[] = [
    {
      lc: true,
      formItem: 'slider',
      id: 'luminfluxUltStacks',
      name: 'luminfluxUltStacks',
      text: 'Luminflux stacks',
      title: 'Luminflux stacks',
      content: BETA_UPDATE,
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      luminfluxUltStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDefPen(x, ULT_TYPE, r.luminfluxUltStacks * sValuesDefShred[s])
    },
    finalizeCalculations: () => {
    },
  }
}
