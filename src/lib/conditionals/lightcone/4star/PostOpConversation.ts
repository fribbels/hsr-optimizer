import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.PostOpConversation')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltHealingBoost',
    name: 'postUltHealingBoost',
    formItem: 'switch',
    text: t('Content.postUltHealingBoost.text'),
    title: t('Content.postUltHealingBoost.title'),
    content: t('Content.postUltHealingBoost.content', { HealingBoost: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      postUltHealingBoost: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.OHB] += (r.postUltHealingBoost) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
