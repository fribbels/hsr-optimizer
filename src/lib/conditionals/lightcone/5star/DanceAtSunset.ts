import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { BETA_UPDATE } from 'lib/constants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesFuaDmg = [0.36, 0.42, 0.48, 0.54, 0.60]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'fuaDmgStacks',
      name: 'fuaDmgStacks',
      formItem: 'slider',
      text: 'FUA DMG stacks',
      title: 'FUA DMG stacks',
      content: BETA_UPDATE,
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      fuaDmgStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, r.fuaDmgStacks * sValuesFuaDmg[s])
    },
    finalizeCalculations: () => {
    },
  }
}
