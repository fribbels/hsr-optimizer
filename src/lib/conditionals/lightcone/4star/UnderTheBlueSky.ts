import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.UnderTheBlueSky.Content')
    return [{
      lc: true,
      id: 'defeatedEnemyCrBuff',
      name: 'defeatedEnemyCrBuff',
      formItem: 'switch',
      text: t('defeatedEnemyCrBuff.text'),
      title: t('defeatedEnemyCrBuff.title'),
      content: t('defeatedEnemyCrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      defeatedEnemyCrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.defeatedEnemyCrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
