import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TodayIsAnotherPeacefulDay')
  const sValues = [0.002, 0.0025, 0.003, 0.0035, 0.004]

  const content: ContentItem[] = [{
    lc: true,
    id: 'maxEnergyStacks',
    name: 'maxEnergyStacks',
    formItem: 'slider',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DmgStep: TsUtils.precisionRound(100 * sValues[s]), EnergyLimit: 160 }),
    min: 0,
    max: 160,
  }]

  return {
    content: () => content,
    defaults: () => ({
      maxEnergyStacks: 160,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.maxEnergyStacks * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
