import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.OnlySilenceRemains')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'enemies2CrBuff',
      formItem: 'switch',
      text: t('Content.enemies2CrBuff.text'),
      content: t('Content.enemies2CrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      enemies2CrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CR] += (r.enemies2CrBuff && context.enemyCount <= 2) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
