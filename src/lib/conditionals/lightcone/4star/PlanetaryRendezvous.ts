import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.PlanetaryRendezvous')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'alliesSameElement',
    name: 'alliesSameElement',
    formItem: 'switch',
    text: t('Content.alliesSameElement.text'),
    title: t('Content.alliesSameElement.title'),
    content: t('Content.alliesSameElement.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      alliesSameElement: true,
    }),
    teammateDefaults: () => ({
      alliesSameElement: true,
    }),
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
