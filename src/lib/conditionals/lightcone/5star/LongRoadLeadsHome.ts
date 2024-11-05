import i18next from 'i18next'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LongRoadLeadsHome')
  const sValuesBreakVulnerability = [0.20, 0.225, 0.25, 0.275, 0.30]

  const defaults = {
    breakVulnerabilityStacks: 2,
  }

  const teammateDefaults = {
    breakVulnerabilityStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakVulnerabilityStacks: {
      lc: true,
      formItem: 'slider',
      id: 'breakVulnerabilityStacks',
      text: 'Break vulnerability stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 2,
    },
  }

  const teammateContent = {
    breakVulnerabilityStacks: content.breakVulnerabilityStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.BREAK_VULNERABILITY.buff(m.breakVulnerabilityStacks * sValuesBreakVulnerability[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
