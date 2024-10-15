import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Sagacity')
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltAtkBuff',
    name: 'postUltAtkBuff',
    formItem: 'switch',
    text: t('Content.postUltAtkBuff.text'),
    title: t('Content.postUltAtkBuff.title'),
    content: t('Content.postUltAtkBuff.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      postUltAtkBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.ATK_P] += (r.postUltAtkBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
