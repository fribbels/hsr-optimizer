import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ThoseManySprings')
  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesVulnerabilityEnhanced = [0.14, 0.16, 0.18, 0.20, 0.22]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'unarmoredVulnerability',
      name: 'unarmoredVulnerability',
      formItem: 'switch',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { UnarmoredVulnerability: TsUtils.precisionRound(sValuesVulnerability[s] * 100), CorneredVulnerability: TsUtils.precisionRound(sValuesVulnerabilityEnhanced[s] * 100) }),
    },
    {
      lc: true,
      id: 'corneredVulnerability',
      name: 'corneredVulnerability',
      formItem: 'switch',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content', { UnarmoredVulnerability: TsUtils.precisionRound(sValuesVulnerability[s] * 100), CorneredVulnerability: TsUtils.precisionRound(sValuesVulnerabilityEnhanced[s] * 100) }),
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
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.VULNERABILITY += m.unarmoredVulnerability || m.corneredVulnerability ? sValuesVulnerability[s] : 0
      x.VULNERABILITY += m.corneredVulnerability ? sValuesVulnerabilityEnhanced[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
