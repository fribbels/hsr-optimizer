import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.GoodNightAndSleepWell')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'debuffStacksDmgIncrease',
    name: 'debuffStacksDmgIncrease',
    formItem: 'slider',
    text: t('Content.debuffStacksDmgIncrease.text'),
    title: t('Content.debuffStacksDmgIncrease.title'),
    content: t('Content.debuffStacksDmgIncrease.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    defaults: () => ({
      debuffStacksDmgIncrease: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.debuffStacksDmgIncrease * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
