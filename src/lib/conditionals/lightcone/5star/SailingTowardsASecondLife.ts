import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { ConditionalLightConeMap, LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/constants.ts'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesVulnerability = [0.01, 0.0115, 0.013, 0.0145, 0.016]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'vulnerabilityStacks',
      name: 'vulnerabilityStacks',
      formItem: 'slider',
      text: 'Vulnerability stacks',
      title: 'Vulnerability stacks',
      content: 'Vulnerability stacks',
      min: 0,
      max: 6,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      vulnerabilityStacks: 6,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals as ConditionalLightConeMap

      x.DMG_TAKEN_MULTI += r.vulnerabilityStacks * sValuesVulnerability[s]
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
