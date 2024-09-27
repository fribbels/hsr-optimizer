import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ResolutionShinesAsPearlsOfSweat')
  const sValues = [0.12, 0.13, 0.14, 0.15, 0.16]
  const content: ContentItem[] = [{
    lc: true,
    id: 'targetEnsnared',
    name: 'targetEnsnared',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DefShred: TsUtils.precisionRound(100 * sValues[s]), Duration: 1 }),
  }]

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
