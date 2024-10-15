import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AfterTheCharmonyFall')
  const sValuesSpd = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'spdBuff',
      name: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      title: t('Content.spdBuff.title'),
      content: t('Content.spdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      spdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.SPD_P] += (r.spdBuff) ? sValuesSpd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
