import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Guinaifen')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const talentDebuffDmgIncreaseValue = talent(e, 0.07, 0.076)
  const talentDebuffMax = (e >= 6) ? 4 : 3

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 1.20, 1.296)
  const dotScaling = skill(e, 2.182, 2.40)

  const content: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'talentDebuffStacks',
      name: 'talentDebuffStacks',
      text: t('Content.talentDebuffStacks.text'),
      title: t('Content.talentDebuffStacks.title'),
      content: t('Content.talentDebuffStacks.content', { talentDebuffDmgIncreaseValue: TsUtils.precisionRound(talentDebuffDmgIncreaseValue), talentDebuffMax }),
      min: 0,
      max: talentDebuffMax,
    },
    {
      formItem: 'switch',
      id: 'enemyBurned',
      name: 'enemyBurned',
      text: t('Content.enemyBurned.text'),
      title: t('Content.enemyBurned.title'),
      content: t('Content.enemyBurned.content'),
    },
    {
      formItem: 'switch',
      id: 'skillDot',
      name: 'skillDot',
      text: t('Content.skillDot.text'),
      title: t('Content.skillDot.title'),
      content: t('Content.skillDot.content'),
    },
    {
      formItem: 'switch',
      id: 'e1EffectResShred',
      name: 'e1EffectResShred',
      text: t('Content.e1EffectResShred.text'),
      title: t('Content.e1EffectResShred.title'),
      content: t('Content.e1EffectResShred.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2BurnMultiBoost',
      name: 'e2BurnMultiBoost',
      text: t('Content.e2BurnMultiBoost.text'),
      title: t('Content.e2BurnMultiBoost.title'),
      content: t('Content.e2BurnMultiBoost.content'),
      disabled: e < 2,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'talentDebuffStacks'),
    findContentId(content, 'e1EffectResShred'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      talentDebuffStacks: talentDebuffMax,
      enemyBurned: true,
      skillDot: true,
      e1EffectResShred: true,
      e2BurnMultiBoost: true,
    }),
    teammateDefaults: () => ({
      talentDebuffStacks: talentDebuffMax,
      e1EffectResShred: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling
      x.DOT_SCALING += (e >= 2 && r.e2BurnMultiBoost) ? 0.40 : 0

      // Boost
      x.ELEMENTAL_DMG += (r.enemyBurned) ? 0.20 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      x.DOT_CHANCE = r.skillDot ? 1.00 : 0.80

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x.VULNERABILITY += m.talentDebuffStacks * talentDebuffDmgIncreaseValue
      x.EFFECT_RES_PEN += m.e1EffectResShred ? 0.10 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
