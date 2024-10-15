import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.HeyOverHere')
  const sValues = [0.16, 0.19, 0.22, 0.25, 0.28]
  const content: ContentItem[] = [{
    lc: true,
    id: 'postSkillHealBuff',
    name: 'postSkillHealBuff',
    formItem: 'switch',
    text: t('Content.postSkillHealBuff.text'),
    title: t('Content.postSkillHealBuff.title'),
    content: t('Content.postSkillHealBuff.content', { HealingBoost: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      postSkillHealBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.OHB] += (r.postSkillHealBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
