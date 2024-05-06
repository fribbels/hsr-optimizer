import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'

const betaUpdate = 'All calculations are subject to change. Last updated 05-05-2024.'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesVulnerability = [0.15, 0.15, 0.15, 0.15, 0.15] // TODO

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'crushedVulnerability',
      name: 'crushedVulnerability',
      formItem: 'switch',
      text: 'Crushed vulnerability',
      title: 'Crushed vulnerability',
      content: betaUpdate,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      sValuesVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.DMG_TAKEN_MULTI += (r.crushedVulnerability) ? sValuesVulnerability[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (_c: PrecomputedCharacterConditional, _request: Form) => {
    },
  }
}
