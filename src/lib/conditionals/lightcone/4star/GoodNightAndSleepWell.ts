import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.GoodNightAndSleepWell')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'debuffStacksDmgIncrease',
    name: 'debuffStacksDmgIncrease',
    formItem: 'slider',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]), StackLimit: 3 }),
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
