import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { precisionRound } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCd = [0.24, 0.30, 0.36, 0.42, 0.48]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'enemyDefReducedSlowed',
      name: 'enemyDefReducedSlowed',
      formItem: 'switch',
      text: 'Enemy DEF reduced / slowed',
      title: 'Enemy DEF reduced / slowed',
      content: `The wearer deals ${precisionRound(sValuesCd[s] * 100)}% more CRIT DMG to enemies that are currently Slowed or have reduced DEF.`,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      enemyDefReducedSlowed: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.enemyDefReducedSlowed) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
