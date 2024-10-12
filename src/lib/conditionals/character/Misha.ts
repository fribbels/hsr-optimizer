import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Misha')
  const { basic, skill, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  let ultStackScaling = ult(e, 0.60, 0.65)
  ultStackScaling += (e >= 4 ? 0.06 : 0)

  const content: ContentItem[] = [{
    formItem: 'slider',
    id: 'ultHitsOnTarget',
    name: 'ultHitsOnTarget',
    text: t('Content.ultHitsOnTarget.text'),
    title: t('Content.ultHitsOnTarget.title'),
    content: t('Content.ultHitsOnTarget.content', { ultStackScaling: TsUtils.precisionRound(100 * ultStackScaling) }),
    min: 1,
    max: 10,
  }, {
    formItem: 'switch',
    id: 'enemyFrozen',
    name: 'enemyFrozen',
    text: t('Content.enemyFrozen.text'),
    title: t('Content.enemyFrozen.title'),
    content: t('Content.enemyFrozen.content'),
  }, {
    formItem: 'switch',
    id: 'e2DefReduction',
    name: 'e2DefReduction',
    text: t('Content.e2DefReduction.text'),
    title: t('Content.e2DefReduction.title'),
    content: t('Content.e2DefReduction.content'),
    disabled: e < 2,
  }, {
    formItem: 'switch',
    id: 'e6UltDmgBoost',
    name: 'e6UltDmgBoost',
    text: t('Content.e6UltDmgBoost.text'),
    title: t('Content.e6UltDmgBoost.title'),
    content: t('Content.e6UltDmgBoost.content'),
    disabled: e < 6,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'e2DefReduction'),
  ]

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
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x.DEF_PEN += (e >= 2 && m.e2DefReduction) ? 0.16 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
