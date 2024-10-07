import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.Cornucopia')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'healingBuff',
    name: 'healingBuff',
    formItem: 'switch',
    text: t('Content.healingBuff.text'),
    title: t('Content.healingBuff.title'),
    content: t('Content.healingBuff.content', { HealingBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      healingBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.OHB] += (r.healingBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
