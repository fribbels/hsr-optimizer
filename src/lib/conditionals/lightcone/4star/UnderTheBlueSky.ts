import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.UnderTheBlueSky')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'defeatedEnemyCrBuff',
    name: 'defeatedEnemyCrBuff',
    formItem: 'switch',
    text: t('Content.defeatedEnemyCrBuff.text'),
    title: t('Content.defeatedEnemyCrBuff.title'),
    content: t('Content.defeatedEnemyCrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      defeatedEnemyCrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CR] += (r.defeatedEnemyCrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
