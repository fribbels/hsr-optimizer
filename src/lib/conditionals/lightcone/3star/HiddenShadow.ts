import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.HiddenShadow')
  const sValues = [0.60, 0.75, 0.90, 1.05, 1.20]
  const content: ContentItem[] = [{
    lc: true,
    id: 'basicAtkBuff',
    name: 'basicAtkBuff',
    formItem: 'switch',
    text: t('Content.basicAtkBuff.text'),
    title: t('Content.basicAtkBuff.title'),
    content: t('Content.basicAtkBuff.content', { MultiplierBonus: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      basicAtkBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.BASIC_SCALING += (r.basicAtkBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
