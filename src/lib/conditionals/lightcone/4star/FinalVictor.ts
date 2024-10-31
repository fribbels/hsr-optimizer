import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FinalVictor')

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'goodFortuneStacks',
      formItem: 'slider',
      text: t('Content.goodFortuneStacks.text'),
      content: t('Content.goodFortuneStacks.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 4,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      goodFortuneStacks: 4,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CD] += r.goodFortuneStacks * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
