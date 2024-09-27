import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { findContentId } from 'lib/conditionals/conditionalUtils'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.InherentlyUnjustDestiny')
  const sValuesCd = [0.40, 0.46, 0.52, 0.58, 0.64]
  const sValuesVulnerability = [0.10, 0.115, 0.13, 0.145, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'shieldCdBuff',
      name: 'shieldCdBuff',
      formItem: 'switch',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
    {
      lc: true,
      id: 'targetVulnerability',
      name: 'targetVulnerability',
      formItem: 'switch',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content', { Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]) }),
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetVulnerability'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      shieldCdBuff: true,
      targetVulnerability: true,
    }),
    teammateDefaults: () => ({
      targetVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.shieldCdBuff) ? sValuesCd[s] : 0
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.VULNERABILITY += (m.targetVulnerability) ? sValuesVulnerability[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
