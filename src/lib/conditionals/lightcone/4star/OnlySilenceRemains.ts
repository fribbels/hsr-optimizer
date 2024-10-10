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
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.OnlySilenceRemains.Content')
    return [{
      lc: true,
      id: 'enemies2CrBuff',
      name: 'enemies2CrBuff',
      formItem: 'switch',
      text: t('enemies2CrBuff.text'),
      title: t('enemies2CrBuff.title'),
      content: t('enemies2CrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      enemies2CrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.enemies2CrBuff && request.enemyCount <= 2) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
