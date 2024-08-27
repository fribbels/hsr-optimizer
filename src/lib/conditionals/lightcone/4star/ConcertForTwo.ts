import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { precisionRound } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesStackDmg = [0.04, 0.05, 0.06, 0.07, 0.08]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'teammateShieldStacks',
      name: 'teammateShieldStacks',
      formItem: 'slider',
      text: 'Teammate shield DMG stacks',
      title: 'Inspire',
      content: `For every on-field character that has a Shield, the DMG dealt by the wearer increases by ${precisionRound(sValuesStackDmg[s] * 100)}%.`,
      min: 0,
      max: 4,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      teammateShieldStacks: 4,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.teammateShieldStacks) * sValuesStackDmg[s]
    },
    finalizeCalculations: () => {
    },
  }
}
