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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WhereaboutsShouldDreamsRest')
  const { SOURCE_LC } = Source.lightCone('23025')

  const sValuesVulnerability = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    routedVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    routedVulnerability: {
      lc: true,
      id: 'routedVulnerability',
      formItem: 'switch',
      text: t('Content.routedVulnerability.text'),
      content: t('Content.routedVulnerability.content', { Vulnerability: sValuesVulnerability[s] * 100 }), // `When the wearer deals Break DMG to an enemy target, inflicts Routed on the enemy, lasting for 2 turn(s).
      // Targets afflicted with Routed receive ${sValuesVulnerability[s] * 100}% increased Break DMG from the wearer, and their SPD is lowered by 20%.
      // Effects of the similar type cannot be stacked.`,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.VULNERABILITY.buff((r.routedVulnerability) ? sValuesVulnerability[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
