import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
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
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.BASIC_SCALING.buff((r.basicAtkBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
