import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BoundlessChoreo')
  const sValuesCd = [0.24, 0.30, 0.36, 0.42, 0.48]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'enemyDefReducedSlowed',
      name: 'enemyDefReducedSlowed',
      formItem: 'switch',
      text: t('Content.enemyDefReducedSlowed.text'),
      title: t('Content.enemyDefReducedSlowed.title'),
      content: t('Content.enemyDefReducedSlowed.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      enemyDefReducedSlowed: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CD] += (r.enemyDefReducedSlowed) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
