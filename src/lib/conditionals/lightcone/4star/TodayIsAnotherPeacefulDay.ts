import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.002, 0.0025, 0.003, 0.0035, 0.004]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TodayIsAnotherPeacefulDay.Content')
    return [{
      lc: true,
      id: 'maxEnergyStacks',
      name: 'maxEnergyStacks',
      formItem: 'slider',
      text: t('maxEnergyStacks.text'),
      title: t('maxEnergyStacks.title'),
      content: t('maxEnergyStacks.content', { DmgStep: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 160,
    }]
  })()

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
