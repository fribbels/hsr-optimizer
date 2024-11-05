import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BoundlessChoreo')

  const sValuesCd = [0.24, 0.30, 0.36, 0.42, 0.48]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'enemyDefReducedSlowed',
      formItem: 'switch',
      text: t('Content.enemyDefReducedSlowed.text'),
      content: t('Content.enemyDefReducedSlowed.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      enemyDefReducedSlowed: true,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x[Stats.CD] += (r.enemyDefReducedSlowed) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
