import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'

const betaUpdate = 'All calculations are subject to change. Last updated v3 05-20-2024.'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesVulnerability = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'routedVulnerability',
      name: 'routedVulnerability',
      formItem: 'switch',
      text: 'Routed vulnerability',
      title: 'Routed vulnerability',
      content: betaUpdate,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      routedVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.DMG_TAKEN_MULTI += (r.routedVulnerability) ? sValuesVulnerability[s] : 0
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (_c: PrecomputedCharacterConditional, _request: Form) => {
    },
  }
}
