import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Amber')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'hp50DefBuff',
      formItem: 'switch',
      text: t('Content.hp50DefBuff.text'),
      content: t('Content.hp50DefBuff.content', { DefBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      hp50DefBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.DEF_P] += (r.hp50DefBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
