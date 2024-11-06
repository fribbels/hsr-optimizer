import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PostOpConversation')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    postUltHealingBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postUltHealingBoost: {
      lc: true,
      id: 'postUltHealingBoost',
      formItem: 'switch',
      text: t('Content.postUltHealingBoost.text'),
      content: t('Content.postUltHealingBoost.content', { HealingBoost: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ULT_OHB.buff((r.postUltHealingBoost) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
