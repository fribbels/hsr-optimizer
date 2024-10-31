import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Loop')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'enemySlowedDmgBuff',
      formItem: 'switch',
      text: t('Content.enemySlowedDmgBuff.text'),
      content: t('Content.enemySlowedDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      enemySlowedDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemySlowedDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
