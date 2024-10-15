import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Void')
  const sValues = [0.20, 0.25, 0, 30, 0.35, 0.40]
  const content: ContentItem[] = [{
    lc: true,
    id: 'initialEhrBuff',
    name: 'initialEhrBuff',
    formItem: 'switch',
    text: t('Content.initialEhrBuff.text'),
    title: t('Content.initialEhrBuff.title'),
    content: t('Content.initialEhrBuff.content', { EhrBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      initialEhrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.EHR] += (r.initialEhrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
