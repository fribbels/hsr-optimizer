import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesHealing = [0.08, 0.09, 0.1, 0.11, 0.12]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.SomethingIrreplaceable.Content')
    return [{
      lc: true,
      id: 'dmgBuff',
      name: 'dmgBuff',
      formItem: 'switch',
      text: t('dmgBuff.text'),
      title: t('dmgBuff.title'),
      content: t('dmgBuff.content', { Multiplier: TsUtils.precisionRound(100 * sValuesHealing[s]), DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
