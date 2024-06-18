import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { BETA_UPDATE } from 'lib/constants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesVulnerabilityEnhanced = [0.18, 0.21, 0.24, 0.27, 0.30]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'unarmoredVulnerability',
      name: 'unarmoredVulnerability',
      formItem: 'switch',
      text: 'Unarmored vulnerability',
      title: 'Unarmored vulnerability',
      content: BETA_UPDATE,
    },
    {
      lc: true,
      id: 'corneredVulnerability',
      name: 'corneredVulnerability',
      formItem: 'switch',
      text: 'Cornered vulnerability',
      title: 'Cornered vulnerability',
      content: BETA_UPDATE,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      unarmoredVulnerability: true,
      corneredVulnerability: true,
    }),
    teammateDefaults: () => ({
      unarmoredVulnerability: true,
      corneredVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.DMG_TAKEN_MULTI += m.unarmoredVulnerability ? sValuesVulnerability[s] : 0
      x.DMG_TAKEN_MULTI += m.corneredVulnerability ? sValuesVulnerabilityEnhanced[s] : 0
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (_c: PrecomputedCharacterConditional, _request: Form) => {
    },
  }
}
