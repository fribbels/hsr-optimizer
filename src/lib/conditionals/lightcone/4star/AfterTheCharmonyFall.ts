import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.AfterTheCharmonyFall')
  const sValuesSpd = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'spdBuff',
      name: 'spdBuff',
      formItem: 'switch',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      spdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.SPD_P] += (r.spdBuff) ? sValuesSpd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
