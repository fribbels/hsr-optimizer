import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Cornucopia')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'healingBuff',
      formItem: 'switch',
      text: t('Content.healingBuff.text'),
      content: t('Content.healingBuff.content', { HealingBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      healingBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.SKILL_OHB += (r.healingBuff) ? sValues[s] : 0
      x.ULT_OHB += (r.healingBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
