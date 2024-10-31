import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Arrows')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'critBuff',
      formItem: 'switch',
      text: t('Content.critBuff.text'),
      content: t('Content.critBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      critBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CR] += (r.critBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
