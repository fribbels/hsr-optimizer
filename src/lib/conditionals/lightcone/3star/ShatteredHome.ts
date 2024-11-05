import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ShatteredHome')

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'enemyHp50Buff',
      formItem: 'switch',
      text: t('Content.enemyHp50Buff.text'),
      content: t('Content.enemyHp50Buff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      enemyHp50Buff: true,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyHp50Buff) ? sValues[s] : 0
    },
    finalizeCalculations: (/* c, request */) => {
    },
  }
}
