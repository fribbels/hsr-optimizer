import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { BETA_UPDATE, Stats } from "lib/constants";
import { findContentId } from "lib/conditionals/utils";

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesVulnerabilityAdditional = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'woefreeState',
      name: 'woefreeState',
      formItem: 'switch',
      text: 'Woefree vulnerability',
      title: 'Woefree vulnerability',
      content: BETA_UPDATE,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'woefreeState'),
    {
      lc: true,
      id: 'additionalVulnerability',
      name: 'additionalVulnerability',
      formItem: 'switch',
      text: 'Additional vulnerability',
      title: 'Additional vulnerability',
      content: BETA_UPDATE,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      woefreeState: true,
    }),
    teammateDefaults: () => ({
      woefreeState: true,
      additionalVulnerability: true,
    }),
    precomputeEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.DMG_TAKEN_MULTI += (m.woefreeState) ? sValuesVulnerability[s] : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x.DMG_TAKEN_MULTI += (t.woefreeState && t.additionalVulnerability) ? sValuesVulnerabilityAdditional[s] : 0
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals
      const x: ComputedStatsObject = c.x

      x.DMG_TAKEN_MULTI += (r.woefreeState && x[Stats.BE] >= 1.50) ? sValuesVulnerabilityAdditional[s] : 0
    },
  }
}
