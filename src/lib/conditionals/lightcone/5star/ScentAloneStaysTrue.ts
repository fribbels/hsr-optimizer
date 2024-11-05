import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Conditionals, findContentId } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ScentAloneStaysTrue')

  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesVulnerabilityAdditional = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'woefreeState',
      formItem: 'switch',
      text: t('Content.woefreeState.text'),
      content: t('Content.woefreeState.content', {
        Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]),
        AdditionalVulnerability: TsUtils.precisionRound(100 * sValuesVulnerabilityAdditional[s]),
      }),
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'woefreeState'),
    {
      lc: true,
      id: 'additionalVulnerability',
      formItem: 'switch',
      text: t('TeammateContent.additionalVulnerability.text'),
      content: t('TeammateContent.additionalVulnerability.content', {
        Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]),
        AdditionalVulnerability: TsUtils.precisionRound(100 * sValuesVulnerabilityAdditional[s]),
      }),
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      woefreeState: true,
    }),
    teammateDefaults: () => ({
      woefreeState: true,
      additionalVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.VULNERABILITY += (m.woefreeState) ? sValuesVulnerability[s] : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.VULNERABILITY += (t.woefreeState && t.additionalVulnerability) ? sValuesVulnerabilityAdditional[s] : 0
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.VULNERABILITY += (r.woefreeState && x[Stats.BE] >= 1.50) ? sValuesVulnerabilityAdditional[s] : 0
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      return `
if (${wgslTrue(r.woefreeState)} && x.BE >= 1.50) {
  x.VULNERABILITY += ${sValuesVulnerabilityAdditional[s]};
}
      `
    },
  }
}
