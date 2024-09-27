import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.IVentureForthToHunt')
  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const content: ContentItem[] = [
    {
      lc: true,
      formItem: 'slider',
      id: 'luminfluxUltStacks',
      name: 'luminfluxUltStacks',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      luminfluxUltStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDefPen(x, ULT_TYPE, r.luminfluxUltStacks * sValuesDefShred[s])
    },
    finalizeCalculations: () => {
    },
  }
}
