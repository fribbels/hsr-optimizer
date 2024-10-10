import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.6, 0.75, 0.9, 1.05, 1.2]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ThisIsMe.Content')
    return [{
      lc: true,
      id: 'defScalingUltDmg',
      name: 'defScalingUltDmg',
      formItem: 'switch',
      text: t('defScalingUltDmg.text'),
      title: t('defScalingUltDmg.title'),
      content: t('defScalingUltDmg.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      defScalingUltDmg: false,
    }),
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
      // TODO: NOT IMPLEMENTED
    },
  }
}
