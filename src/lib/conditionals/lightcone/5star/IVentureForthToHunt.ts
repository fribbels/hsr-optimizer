import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.IVentureForthToHunt.Content')
    return [
      {
        lc: true,
        formItem: 'slider',
        id: 'luminfluxUltStacks',
        name: 'luminfluxUltStacks',
        text: t('luminfluxUltStacks.text'),
        title: t('luminfluxUltStacks.title'),
        content: t('luminfluxUltStacks.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
        min: 0,
        max: 2,
      },
    ]
  })()

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
