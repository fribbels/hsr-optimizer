import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ScentAloneStaysTrue')
  const { SOURCE_LC } = Source.lightCone('23032')

  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesVulnerabilityAdditional = [0.08, 0.10, 0.12, 0.14, 0.16]

  const defaults = {
    woefreeState: true,
  }

  const teammateDefaults = {
    woefreeState: true,
    additionalVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    woefreeState: {
      lc: true,
      id: 'woefreeState',
      formItem: 'switch',
      text: t('Content.woefreeState.text'),
      content: t('Content.woefreeState.content', {
        Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]),
        AdditionalVulnerability: TsUtils.precisionRound(100 * sValuesVulnerabilityAdditional[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    woefreeState: content.woefreeState,
    additionalVulnerability: {
      lc: true,
      id: 'additionalVulnerability',
      formItem: 'switch',
      text: t('TeammateContent.additionalVulnerability.text'),
      content: t('TeammateContent.additionalVulnerability.content', {
        Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]),
        AdditionalVulnerability: TsUtils.precisionRound(100 * sValuesVulnerabilityAdditional[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((m.woefreeState) ? sValuesVulnerability[s] : 0, SOURCE_LC)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((t.woefreeState && t.additionalVulnerability) ? sValuesVulnerabilityAdditional[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.VULNERABILITY.buff((r.woefreeState && x.a[Key.BE] >= 1.50) ? sValuesVulnerabilityAdditional[s] : 0, SOURCE_LC)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.woefreeState)} && x.BE >= 1.50) {
  x.VULNERABILITY += ${sValuesVulnerabilityAdditional[s]};
}
      `
    },
  }
}
