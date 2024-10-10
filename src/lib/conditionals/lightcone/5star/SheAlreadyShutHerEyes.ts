import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.09, 0.105, 0.12, 0.135, 0.15]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.SheAlreadyShutHerEyes.Content')
    return [{
      lc: true,
      id: 'hpLostDmgBuff',
      name: 'hpLostDmgBuff',
      formItem: 'switch',
      text: t('hpLostDmgBuff.text'),
      title: t('hpLostDmgBuff.title'),
      content: t('hpLostDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

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
