import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.Amber')
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  const content: ContentItem[] = [{
    lc: true,
    id: 'hp50DefBuff',
    name: 'hp50DefBuff',
    formItem: 'switch',
    text: t('Content.hp50DefBuff.text'),
    title: t('Content.hp50DefBuff.title'),
    content: t('Content.hp50DefBuff.content', { DefBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      hp50DefBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.DEF_P] += (r.hp50DefBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
