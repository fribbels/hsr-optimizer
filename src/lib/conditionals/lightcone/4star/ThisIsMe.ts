import { ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'

import { SuperImpositionLevel } from 'types/lightCone'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThisIsMe')

  const sValues = [0.6, 0.75, 0.9, 1.05, 1.2]

  const defaults = {
    defScalingUltDmg: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    defScalingUltDmg: {
      lc: true,
      id: 'defScalingUltDmg',
      formItem: 'switch',
      text: t('Content.defScalingUltDmg.text'),
      content: t('Content.defScalingUltDmg.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
      // TODO: NOT IMPLEMENTED
    },
  }
}
