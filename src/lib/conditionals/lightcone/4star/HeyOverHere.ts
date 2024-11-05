import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.HeyOverHere')

  const sValues = [0.16, 0.19, 0.22, 0.25, 0.28]

  const defaults = {
    postSkillHealBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postSkillHealBuff: {
      lc: true,
      id: 'postSkillHealBuff',
      formItem: 'switch',
      text: t('Content.postSkillHealBuff.text'),
      content: t('Content.postSkillHealBuff.content', { HealingBoost: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.OHB.buff((r.postSkillHealBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
