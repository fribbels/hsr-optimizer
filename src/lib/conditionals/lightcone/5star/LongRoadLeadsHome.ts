import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LongRoadLeadsHome')
  const { SOURCE_LC } = Source.lightCone('23035')

  const sValuesBreakVulnerability = [0.18, 0.21, 0.24, 0.27, 0.30]

  const defaults = {
    breakVulnerabilityStacks: 2,
  }

  const teammateDefaults = {
    breakVulnerabilityStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakVulnerabilityStacks: {
      lc: true,
      id: 'breakVulnerabilityStacks',
      formItem: 'slider',
      text: t('Content.breakVulnerabilityStacks.text'),
      content: t('Content.breakVulnerabilityStacks.content', { breakVulnerability: TsUtils.precisionRound(100 * sValuesBreakVulnerability[s]) }),
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
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.BREAK_VULNERABILITY.buffTeam(m.breakVulnerabilityStacks * sValuesBreakVulnerability[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
