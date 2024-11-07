import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ASecretVow')

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    enemyHpHigherDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyHpHigherDmgBoost: {
      lc: true,
      id: 'enemyHpHigherDmgBoost',
      formItem: 'switch',
      text: t('Content.enemyHpHigherDmgBoost.text'),
      content: t('Content.enemyHpHigherDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff(sValues[s], Source.NONE)
      x.ELEMENTAL_DMG.buff((r.enemyHpHigherDmgBoost) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
