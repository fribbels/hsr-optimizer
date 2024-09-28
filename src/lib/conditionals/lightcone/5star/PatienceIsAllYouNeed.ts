import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.PatienceIsAllYouNeed')
  const sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesSpd = [0.048, 0.056, 0.064, 0.072, 0.08]
  const sValuesErode = [0.6, 0.7, 0.8, 0.9, 1]

  const content: ContentItem[] = [{
    lc: true,
    id: 'spdStacks',
    name: 'spdStacks',
    formItem: 'slider',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]) }),
    min: 0,
    max: 3,
  }, {
    lc: true,
    id: 'dotEffect',
    name: 'dotEffect',
    formItem: 'switch',
    text: t('Content.1.text'),
    title: t('Content.1.title'),
    content: t('Content.1.content', { Multiplier: TsUtils.precisionRound(100 * sValuesErode[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      spdStacks: 3,
      dotEffect: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.SPD_P] += r.spdStacks * sValuesSpd[s]
      x.ELEMENTAL_DMG += sValuesDmg[s]
    },
    finalizeCalculations: () => {
    },
  }
}
