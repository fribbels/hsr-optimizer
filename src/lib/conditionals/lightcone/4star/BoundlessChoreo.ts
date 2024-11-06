import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BoundlessChoreo')

  const sValuesCd = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    enemyDefReducedSlowed: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyDefReducedSlowed: {
      lc: true,
      id: 'enemyDefReducedSlowed',
      formItem: 'switch',
      text: t('Content.enemyDefReducedSlowed.text'),
      content: t('Content.enemyDefReducedSlowed.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.CD.buff((r.enemyDefReducedSlowed) ? sValuesCd[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
