import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ForTomorrowsJourney')
  const sValuesDmgBoost = [0.18, 0.21, 0.24, 0.27, 0.30]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'ultDmgBuff',
      name: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.ultDmgBuff) ? sValuesDmgBoost[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
