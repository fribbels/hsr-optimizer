import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.SheAlreadyShutHerEyes')
  const sValues = [0.09, 0.105, 0.12, 0.135, 0.15]
  const content: ContentItem[] = [{
    lc: true,
    id: 'hpLostDmgBuff',
    name: 'hpLostDmgBuff',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      hpLostDmgBuff: true,
    }),
    teammateDefaults: () => ({
      hpLostDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.ELEMENTAL_DMG += (m.hpLostDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
