import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { BETA_UPDATE, Stats } from 'lib/constants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.NinjaRecordSoundHunt')
  const sValuesCd = [0.18, 0.225, 0.27, 0.315, 0.36]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'cdBuff',
      name: 'cdBuff',
      formItem: 'switch',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: BETA_UPDATE,
    },
  ]

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
