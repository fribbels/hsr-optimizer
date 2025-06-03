import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MayRainbowsRemainInTheSky.Content')
  const { SOURCE_LC } = Source.lightCone('23042')

  const sValuesVulnerability = [0.18, 0.225, 0.27, 0.315, 0.36]

  const defaults = {
    vulnerability: true,
  }

  const teammateDefaults = {
    vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    vulnerability: {
      lc: true,
      id: 'vulnerability',
      formItem: 'switch',
      text: t('vulnerability.text'),
      content: t('vulnerability.content', { Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    vulnerability: content.vulnerability,
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

      x.VULNERABILITY.buffTeam((m.vulnerability) ? sValuesVulnerability[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return ``
    },
  }
}
