import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesCd = [0.16, 0.20, 0.24, 0.28, 0.32]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.PoisedToBloom.Content')
    return [
      {
        lc: true,
        id: 'cdBuff',
        name: 'cdBuff',
        formItem: 'switch',
        text: t('cdBuff.text'),
        title: t('cdBuff.title'),
        content: t('cdBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
      },
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      cdBuff: true,
    }),
    teammateDefaults: () => ({
      cdBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.CD] += (m.cdBuff) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
