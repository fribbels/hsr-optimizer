import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesVulnerability = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'routedVulnerability',
      name: 'routedVulnerability',
      formItem: 'switch',
      text: 'Routed vulnerability',
      title: 'Routed vulnerability',
      content: `When the wearer deals Break DMG to an enemy target, inflicts Routed on the enemy, lasting for 2 turn(s). 
      Targets afflicted with Routed receive ${sValuesVulnerability[s] * 100}% increased Break DMG from the wearer, and their SPD is lowered by 20%. 
      Effects of the similar type cannot be stacked.`,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      routedVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.VULNERABILITY += (r.routedVulnerability) ? sValuesVulnerability[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
