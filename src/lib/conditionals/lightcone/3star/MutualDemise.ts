import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.MutualDemise.Content')
    return [{
      lc: true,
      id: 'selfHp80CrBuff',
      name: 'selfHp80CrBuff',
      formItem: 'switch',
      text: t('selfHp80CrBuff.text'),
      title: t('selfHp80CrBuff.title'),
      content: t('selfHp80CrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      selfHp80CrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.selfHp80CrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
