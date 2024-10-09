import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  let ultStackScaling = ult(e, 0.60, 0.65)
  ultStackScaling += (e >= 4 ? 0.06 : 0)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Misha.Content')
    return [{
      formItem: 'slider',
      id: 'ultHitsOnTarget',
      name: 'ultHitsOnTarget',
      text: t('ultHitsOnTarget.text'),
      title: t('ultHitsOnTarget.title'),
      content: t('ultHitsOnTarget.content', { ultStackScaling: TsUtils.precisionRound(100 * ultStackScaling) }),
      min: 1,
      max: 10,
    }, {
      formItem: 'switch',
      id: 'enemyFrozen',
      name: 'enemyFrozen',
      text: t('enemyFrozen.text'),
      title: t('enemyFrozen.title'),
      content: t('enemyFrozen.content'),
    }, {
      formItem: 'switch',
      id: 'e2DefReduction',
      name: 'e2DefReduction',
      text: t('e2DefReduction.text'),
      title: t('e2DefReduction.title'),
      content: t('e2DefReduction.content'),
      disabled: e < 2,
    }, {
      formItem: 'switch',
      id: 'e6UltDmgBoost',
      name: 'e6UltDmgBoost',
      text: t('e6UltDmgBoost.text'),
      title: t('e6UltDmgBoost.title'),
      content: t('e6UltDmgBoost.content'),
      disabled: e < 6,
    }]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'e2DefReduction'),
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      ultHitsOnTarget: 10,
      enemyFrozen: true,
      e2DefReduction: true,
      e6UltDmgBoost: true,
    }),
    teammateDefaults: () => ({
      e2DefReduction: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.CD] += (r.enemyFrozen) ? 0.30 : 0

      x.ELEMENTAL_DMG += (e >= 6 && r.e6UltDmgBoost) ? 0.30 : 0

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultStackScaling * (r.ultHitsOnTarget)

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 30 + 15 * (r.ultHitsOnTarget - 1)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.DEF_PEN += (e >= 2 && m.e2DefReduction) ? 0.16 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
