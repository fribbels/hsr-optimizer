import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.PastSelfInTheMirror.Content')
    return [{
      lc: true,
      id: 'postUltDmgBuff',
      name: 'postUltDmgBuff',
      formItem: 'switch',
      text: t('postUltDmgBuff.text'),
      title: t('postUltDmgBuff.title'),
      content: t('postUltDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      postUltDmgBuff: true,
    }),
    teammateDefaults: () => ({
      postUltDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.ELEMENTAL_DMG += (m.postUltDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
