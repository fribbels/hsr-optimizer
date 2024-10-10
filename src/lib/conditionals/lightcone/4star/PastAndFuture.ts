import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.PastAndFuture.Content')
    return [{
      lc: true,
      id: 'postSkillDmgBuff',
      name: 'postSkillDmgBuff',
      formItem: 'switch',
      text: t('postSkillDmgBuff.text'),
      title: t('postSkillDmgBuff.title'),
      content: t('postSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => [],
    teammateContent: () => content,
    defaults: () => ({}),
    teammateDefaults: () => ({
      postSkillDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x.ELEMENTAL_DMG += (t.postSkillDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
