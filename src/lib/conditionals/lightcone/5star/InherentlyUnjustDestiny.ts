import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { findContentId } from 'lib/conditionals/conditionalUtils'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InherentlyUnjustDestiny')
  const sValuesCd = [0.40, 0.46, 0.52, 0.58, 0.64]
  const sValuesVulnerability = [0.10, 0.115, 0.13, 0.145, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'shieldCdBuff',
      name: 'shieldCdBuff',
      formItem: 'switch',
      text: t('Content.shieldCdBuff.text'),
      title: t('Content.shieldCdBuff.title'),
      content: t('Content.shieldCdBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
    {
      lc: true,
      id: 'targetVulnerability',
      name: 'targetVulnerability',
      formItem: 'switch',
      text: t('Content.targetVulnerability.text'),
      title: t('Content.targetVulnerability.title'),
      content: t('Content.targetVulnerability.content', { Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]) }),
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
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CD] += (r.shieldCdBuff) ? sValuesCd[s] : 0
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.VULNERABILITY += (m.targetVulnerability) ? sValuesVulnerability[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
