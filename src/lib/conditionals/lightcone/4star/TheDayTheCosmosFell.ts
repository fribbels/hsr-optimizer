import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TheDayTheCosmosFell')
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  const content: ContentItem[] = [{
    lc: true,
    id: 'cdBuffActive',
    name: 'cdBuffActive',
    formItem: 'switch',
    text: t('Content.cdBuffActive.text'),
    title: t('Content.cdBuffActive.title'),
    content: t('Content.cdBuffActive.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      cdBuffActive: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.cdBuffActive) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
