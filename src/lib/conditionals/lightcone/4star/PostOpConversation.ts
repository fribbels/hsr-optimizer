import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PostOpConversation')
  const { SOURCE_LC } = Source.lightCone('21000')

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
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ULT_OHB.buff((r.postUltHealingBoost) ? sValues[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
