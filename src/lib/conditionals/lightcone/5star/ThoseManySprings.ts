import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThoseManySprings')

  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesVulnerabilityEnhanced = [0.14, 0.16, 0.18, 0.20, 0.22]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'unarmoredVulnerability',
      formItem: 'switch',
      text: t('Content.unarmoredVulnerability.text'),
      content: t('Content.unarmoredVulnerability.content', {
        UnarmoredVulnerability: TsUtils.precisionRound(sValuesVulnerability[s] * 100),
        CorneredVulnerability: TsUtils.precisionRound(sValuesVulnerabilityEnhanced[s] * 100),
      }),
    },
    {
      lc: true,
      id: 'corneredVulnerability',
      formItem: 'switch',
      text: t('Content.corneredVulnerability.text'),
      content: t('Content.corneredVulnerability.content', {
        UnarmoredVulnerability: TsUtils.precisionRound(sValuesVulnerability[s] * 100),
        CorneredVulnerability: TsUtils.precisionRound(sValuesVulnerabilityEnhanced[s] * 100),
      }),
    },
  ]

  return {
    content: () => Object.values(content),
    teammatecontent: () => Object.values(content),
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
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.VULNERABILITY += m.unarmoredVulnerability || m.corneredVulnerability ? sValuesVulnerability[s] : 0
      x.VULNERABILITY += m.corneredVulnerability ? sValuesVulnerabilityEnhanced[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
