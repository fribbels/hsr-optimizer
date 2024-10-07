import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.Void')
  const sValues = [0.20, 0.25, 0, 30, 0.35, 0.40]
  const content: ContentItem[] = [{
    lc: true,
    id: 'initialEhrBuff',
    name: 'initialEhrBuff',
    formItem: 'switch',
    text: t('Content.initialEhrBuff.text'),
    title: t('Content.initialEhrBuff.title'),
    content: t('Content.initialEhrBuff.content', { EhrBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      initialEhrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.EHR] += (r.initialEhrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
