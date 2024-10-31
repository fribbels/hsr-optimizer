import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SleepLikeTheDead')

  const sValues = [0.36, 0.42, 0.48, 0.54, 0.60]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'missedCritCrBuff',
      formItem: 'switch',
      text: t('Content.missedCritCrBuff.text'),
      content: t('Content.missedCritCrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      missedCritCrBuff: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CR] += (r.missedCritCrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
