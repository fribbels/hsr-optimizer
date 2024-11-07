import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Adversarial')

  const sValues = [0.10, 0.12, 0.14, 0.16, 0.18]

  const defaults = {
    defeatedEnemySpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defeatedEnemySpdBuff: {
      lc: true,
      id: 'defeatedEnemySpdBuff',
      formItem: 'switch',
      text: t('Content.defeatedEnemySpdBuff.text'),
      content: t('Content.defeatedEnemySpdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.SPD_P.buff((r.defeatedEnemySpdBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
