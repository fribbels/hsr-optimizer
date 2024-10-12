import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheDayTheCosmosFell')
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  const content: ContentItem[] = [{
    lc: true,
    id: 'cdBuffActive',
    name: 'cdBuffActive',
    formItem: 'switch',
    text: t('Content.cdBuffActive.text'),
    title: t('Content.cdBuffActive.title'),
    content: t('Content.cdBuffActive.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      cdBuffActive: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CD] += (r.cdBuffActive) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
