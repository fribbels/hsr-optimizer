import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditionalsController } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.OnlySilenceRemains')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    enemies2CrBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemies2CrBuff: {
      lc: true,
      id: 'enemies2CrBuff',
      formItem: 'switch',
      text: t('Content.enemies2CrBuff.text'),
      content: t('Content.enemies2CrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.CR.buff((r.enemies2CrBuff && context.enemyCount <= 2) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
