import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

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
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.woefreeState) ? sValuesVulnerability[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (t.woefreeState && t.additionalVulnerability) ? sValuesVulnerabilityAdditional[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.VULNERABILITY, (r.woefreeState && x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX) >= 1.50) ? sValuesVulnerabilityAdditional[s] : 0, x.source(SOURCE_LC))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.woefreeState)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BE, action.config)} >= 1.50) {
  ${buff.action(AKey.VULNERABILITY, sValuesVulnerabilityAdditional[s]).wgsl(action)}
}
      `
    },
  }
}
