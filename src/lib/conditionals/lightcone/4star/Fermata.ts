import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Fermata')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const defaults = {
    enemyShockWindShear: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyShockWindShear: {
      lc: true,
      id: 'enemyShockWindShear',
      formItem: 'switch',
      text: t('Content.enemyShockWindShear.text'),
      content: t('Content.enemyShockWindShear.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.enemyShockWindShear) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
