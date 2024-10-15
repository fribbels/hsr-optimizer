import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WhereaboutsShouldDreamsRest')
  const sValuesVulnerability = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'routedVulnerability',
      name: 'routedVulnerability',
      formItem: 'switch',
      text: t('Content.routedVulnerability.text'),
      title: t('Content.routedVulnerability.title'),
      content: t('Content.routedVulnerability.content', { Vulnerability: sValuesVulnerability[s] * 100 }), // `When the wearer deals Break DMG to an enemy target, inflicts Routed on the enemy, lasting for 2 turn(s).
      // Targets afflicted with Routed receive ${sValuesVulnerability[s] * 100}% increased Break DMG from the wearer, and their SPD is lowered by 20%.
      // Effects of the similar type cannot be stacked.`,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      routedVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.VULNERABILITY += (r.routedVulnerability) ? sValuesVulnerability[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
