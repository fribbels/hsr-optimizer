import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.HiddenShadow')
  const sValues = [0.60, 0.75, 0.90, 1.05, 1.20]
  const content: ContentItem[] = [{
    lc: true,
    id: 'basicAtkBuff',
    name: 'basicAtkBuff',
    formItem: 'switch',
    text: t('Content.basicAtkBuff.text'),
    title: t('Content.basicAtkBuff.title'),
    content: t('Content.basicAtkBuff.content', { MultiplierBonus: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      basicAtkBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.BASIC_SCALING += (r.basicAtkBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
