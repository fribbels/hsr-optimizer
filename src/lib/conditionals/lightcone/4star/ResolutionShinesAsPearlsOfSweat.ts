import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.12, 0.13, 0.14, 0.15, 0.16]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ResolutionShinesAsPearlsOfSweat.Content')
    return [{
      lc: true,
      id: 'targetEnsnared',
      name: 'targetEnsnared',
      formItem: 'switch',
      text: t('targetEnsnared.text'),
      title: t('targetEnsnared.title'),
      content: t('targetEnsnared.content', { DefShred: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      targetEnsnared: true,
    }),
    teammateDefaults: () => ({
      targetEnsnared: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.DEF_PEN += (m.targetEnsnared) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
