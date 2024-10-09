import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { CURRENT_DATA_VERSION, Stats } from 'lib/constants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesCd = [0.18, 0.225, 0.27, 0.315, 0.36]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.NinjaRecordSoundHunt.Content')
    return [
      {
        lc: true,
        id: 'cdBuff',
        name: 'cdBuff',
        formItem: 'switch',
        text: t('cdBuff.text'),
        title: t('cdBuff.title'),
        content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      },
    ]
  })()

  return {
    content: () => content,
    defaults: () => ({
      cdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.cdBuff) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
