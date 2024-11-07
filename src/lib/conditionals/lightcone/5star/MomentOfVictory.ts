import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MomentOfVictory')

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    selfAttackedDefBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    selfAttackedDefBuff: {
      lc: true,
      id: 'selfAttackedDefBuff',
      formItem: 'switch',
      text: t('Content.selfAttackedDefBuff.text'),
      content: t('Content.selfAttackedDefBuff.content', { DefBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.DEF_P.buff((r.selfAttackedDefBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
