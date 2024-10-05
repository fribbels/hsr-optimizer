import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { findContentId } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ScentAloneStaysTrue')
  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesVulnerabilityAdditional = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'woefreeState',
      name: 'woefreeState',
      formItem: 'switch',
      text: t('Content.woefreeState.text'),
      title: t('Content.woefreeState.title'),
      content: t('Content.woefreeState.content', { Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]), AdditionalVulnerability: TsUtils.precisionRound(100 * sValuesVulnerabilityAdditional[s]) }),
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'woefreeState'),
    {
      lc: true,
      id: 'additionalVulnerability',
      name: 'additionalVulnerability',
      formItem: 'switch',
      text: t('TeammateContent.additionalVulnerability.text'),
      title: t('TeammateContent.additionalVulnerability.title'),
      content: t('TeammateContent.additionalVulnerability.content', { Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]), AdditionalVulnerability: TsUtils.precisionRound(100 * sValuesVulnerabilityAdditional[s]) }),
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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.VULNERABILITY += (m.woefreeState) ? sValuesVulnerability[s] : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x.VULNERABILITY += (t.woefreeState && t.additionalVulnerability) ? sValuesVulnerabilityAdditional[s] : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.VULNERABILITY += (r.woefreeState && x[Stats.BE] >= 1.50) ? sValuesVulnerabilityAdditional[s] : 0
    },
    gpuFinalizeCalculations: (request: Form) => {
      const r = request.lightConeConditionals

      return `
if (${wgslTrue(r.woefreeState)} && x.BE >= 1.50) {
  x.VULNERABILITY += ${sValuesVulnerabilityAdditional[s]};
}
      `
    },
  }
}
