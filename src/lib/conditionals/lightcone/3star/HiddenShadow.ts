import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.HiddenShadow')

  const sValues = [0.60, 0.75, 0.90, 1.05, 1.20]

  const defaults = {
    basicAtkBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicAtkBuff: {
      lc: true,
      id: 'basicAtkBuff',
      formItem: 'switch',
      text: t('Content.basicAtkBuff.text'),
      content: t('Content.basicAtkBuff.content', { MultiplierBonus: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff((r.basicAtkBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
