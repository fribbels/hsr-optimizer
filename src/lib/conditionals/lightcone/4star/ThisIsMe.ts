import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ThisIsMe')
  const sValues = [0.6, 0.75, 0.9, 1.05, 1.2]
  const content: ContentItem[] = [{
    lc: true,
    id: 'defScalingUltDmg',
    name: 'defScalingUltDmg',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

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
