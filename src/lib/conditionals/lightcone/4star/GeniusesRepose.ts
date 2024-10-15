import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.GeniusesRepose')
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const content: ContentItem[] = [{
    lc: true,
    id: 'defeatedEnemyCdBuff',
    name: 'defeatedEnemyCdBuff',
    formItem: 'switch',
    text: t('Content.defeatedEnemyCdBuff.text'),
    title: t('Content.defeatedEnemyCdBuff.title'),
    content: t('Content.defeatedEnemyCdBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      defeatedEnemyCdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CD] += (r.defeatedEnemyCdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
