import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
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
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.CD.buff((r.enemyDefReducedSlowed) ? sValuesCd[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
