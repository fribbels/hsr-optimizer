import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Loop')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    enemySlowedDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemySlowedDmgBuff: {
      lc: true,
      id: 'enemySlowedDmgBuff',
      formItem: 'switch',
      text: t('Content.enemySlowedDmgBuff.text'),
      content: t('Content.enemySlowedDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((r.enemySlowedDmgBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
