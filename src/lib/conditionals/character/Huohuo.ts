import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardHpFinalizer, standardHpFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Huohuo.Content')
    return [{
      formItem: 'switch',
      id: 'ultBuff',
      name: 'ultBuff',
      text: t('ultBuff.text'),
      title: t('ultBuff.title'),
      content: t('ultBuff.content', { ultBuffValue: TsUtils.precisionRound(100 * ultBuffValue) }),
    }, {
      formItem: 'switch',
      id: 'skillBuff',
      name: 'skillBuff',
      text: t('skillBuff.text'),
      title: t('skillBuff.title'),
      content: t('skillBuff.content'),
      disabled: e < 1,
    }, {
      formItem: 'switch',
      id: 'e6DmgBuff',
      name: 'e6DmgBuff',
      text: t('e6DmgBuff.text'),
      title: t('e6DmgBuff.title'),
      content: t('e6DmgBuff.content'),
      disabled: e < 6,
    }]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'ultBuff'),
      findContentId(content, 'skillBuff'),
      findContentId(content, 'e6DmgBuff'),
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    teammateDefaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      // Scaling
      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.ATK_P] += (m.ultBuff) ? ultBuffValue : 0
      x[Stats.SPD_P] += (e >= 1 && m.skillBuff) ? 0.12 : 0

      x.ELEMENTAL_DMG += (e >= 6 && m.e6DmgBuff) ? 0.50 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardHpFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardHpFinalizer()
    },
  }
}
