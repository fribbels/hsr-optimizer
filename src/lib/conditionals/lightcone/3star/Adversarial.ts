import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Adversarial')
  const sValues = [0.10, 0.12, 0.14, 0.16, 0.18]
  const content: ContentItem[] = [{
    lc: true,
    id: 'defeatedEnemySpdBuff',
    name: 'defeatedEnemySpdBuff',
    formItem: 'switch',
    text: t('Content.defeatedEnemySpdBuff.text'),
    title: t('Content.defeatedEnemySpdBuff.title'),
    content: t('Content.defeatedEnemySpdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      defeatedEnemySpdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.SPD_P] += (r.defeatedEnemySpdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
