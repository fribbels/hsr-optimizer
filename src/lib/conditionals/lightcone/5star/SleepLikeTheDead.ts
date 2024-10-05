import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.SleepLikeTheDead')
  const sValues = [0.36, 0.42, 0.48, 0.54, 0.60]

  const content: ContentItem[] = [{
    lc: true,
    id: 'missedCritCrBuff',
    name: 'missedCritCrBuff',
    formItem: 'switch',
    text: t('Content.missedCritCrBuff.text'),
    title: t('Content.missedCritCrBuff.title'),
    content: t('Content.missedCritCrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      missedCritCrBuff: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.missedCritCrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
