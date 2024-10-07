import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.GeniusesRepose')
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const content: ContentItem[] = [{
    lc: true,
    id: 'defeatedEnemyCdBuff',
    name: 'defeatedEnemyCdBuff',
    formItem: 'switch',
    text: t('Content.defeatedEnemyCdBuff.text'),
    title: t('Content.defeatedEnemyCdBuff.title'),
    content: t('Content.defeatedEnemyCdBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      defeatedEnemyCdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.defeatedEnemyCdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
