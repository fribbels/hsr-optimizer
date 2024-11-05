import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AfterTheCharmonyFall')

  const sValuesSpd = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      content: t('Content.spdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      spdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.SPD_P] += (r.spdBuff) ? sValuesSpd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
