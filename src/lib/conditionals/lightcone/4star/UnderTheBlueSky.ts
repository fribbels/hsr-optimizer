import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.UnderTheBlueSky')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    defeatedEnemyCrBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defeatedEnemyCrBuff: {
      lc: true,
      id: 'defeatedEnemyCrBuff',
      formItem: 'switch',
      text: t('Content.defeatedEnemyCrBuff.text'),
      content: t('Content.defeatedEnemyCrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.CR.buff((r.defeatedEnemyCrBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
