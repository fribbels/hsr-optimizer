import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.IndeliblePromise')
  const sValues = [0.15, 0.1875, 0.225, 0.2625, 0.3]
  const content: ContentItem[] = [{
    lc: true,
    id: 'crBuff',
    name: 'crBuff',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { BreakBuff: TsUtils.precisionRound(100 * (0.21 + 0.7 * s)), CritBuff: TsUtils.precisionRound(100 * sValues[s]), Duration: 2 }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      crBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.crBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
