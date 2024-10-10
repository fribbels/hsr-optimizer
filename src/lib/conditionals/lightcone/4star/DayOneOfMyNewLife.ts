import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.DayOneOfMyNewLife.Content')
    return [{
      lc: true,
      id: 'dmgResBuff',
      name: 'dmgResBuff',
      formItem: 'switch',
      text: t('dmgResBuff.text'),
      title: t('dmgResBuff.title'),
      content: t('dmgResBuff.content', { ResBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      dmgResBuff: true,
    }),
    teammateDefaults: () => ({
      dmgResBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      // TODO: This is technically a DMG RES buff not a DMG Reduction buff
      x.DMG_RED_MULTI *= (m.dmgResBuff) ? (1 - sValues[s]) : 1
    },
    finalizeCalculations: () => {
    },
  }
}
