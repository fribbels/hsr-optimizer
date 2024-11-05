import i18next from 'i18next'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { CURRENT_DATA_VERSION } from 'lib/constants'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LongRoadLeadsHome')
  const sValuesBreakVulnerability = [0.20, 0.225, 0.25, 0.275, 0.30]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'breakVulnerabilityStacks',
      formItem: 'slider',
      text: 'Break vulnerability stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => Object.values(content),
    teammatecontent: () => Object.values(content),
    defaults: () => ({
      breakVulnerabilityStacks: 2,
    }),
    teammateDefaults: () => ({
      breakVulnerabilityStacks: 2,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.BREAK_VULNERABILITY += m.breakVulnerabilityStacks * sValuesBreakVulnerability[s]
    },
    finalizeCalculations: () => {
    },
  }
}
