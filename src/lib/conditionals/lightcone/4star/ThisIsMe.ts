import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThisIsMe')
  const sValues = [0.6, 0.75, 0.9, 1.05, 1.2]
  const content: ContentItem[] = [{
    lc: true,
    id: 'defScalingUltDmg',
    name: 'defScalingUltDmg',
    formItem: 'switch',
    text: t('Content.defScalingUltDmg.text'),
    title: t('Content.defScalingUltDmg.title'),
    content: t('Content.defScalingUltDmg.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
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
