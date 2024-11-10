import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
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
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.DEF_P.buff((r.selfAttackedDefBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
