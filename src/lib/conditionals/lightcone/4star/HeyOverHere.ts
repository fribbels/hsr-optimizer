import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.16, 0.19, 0.22, 0.25, 0.28]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.HeyOverHere.Content')
    return [{
      lc: true,
      id: 'postSkillHealBuff',
      name: 'postSkillHealBuff',
      formItem: 'switch',
      text: t('postSkillHealBuff.text'),
      title: t('postSkillHealBuff.title'),
      content: t('postSkillHealBuff.content', { HealingBoost: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      postSkillHealBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.OHB] += (r.postSkillHealBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
