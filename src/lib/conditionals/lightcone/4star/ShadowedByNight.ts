import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ShadowedByNight')
  const sValuesSpdBuff = [0.08, 0.09, 0.10, 0.11, 0.12]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'spdBuff',
      name: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      title: t('Content.spdBuff.title'),
      content: t('Content.spdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpdBuff[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      spdBuff: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.SPD_P] += (r.spdBuff) ? sValuesSpdBuff[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
