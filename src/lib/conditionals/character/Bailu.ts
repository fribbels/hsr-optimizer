import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bailu')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'healingMaxHpBuff',
    name: 'healingMaxHpBuff',
    text: t('Content.healingMaxHpBuff.text'),
    title: t('Content.healingMaxHpBuff.title'),
    content: t('Content.healingMaxHpBuff.content'),
  }, {
    formItem: 'switch',
    id: 'talentDmgReductionBuff',
    name: 'talentDmgReductionBuff',
    text: t('Content.talentDmgReductionBuff.text'),
    title: t('Content.talentDmgReductionBuff.title'),
    content: t('Content.talentDmgReductionBuff.content'),
  }, {
    formItem: 'switch',
    id: 'e2UltHealingBuff',
    name: 'e2UltHealingBuff',
    text: t('Content.e2UltHealingBuff.text'),
    title: t('Content.e2UltHealingBuff.title'),
    content: t('Content.e2UltHealingBuff.content'),
    disabled: e < 2,
  }, {
    formItem: 'slider',
    id: 'e4SkillHealingDmgBuffStacks',
    name: 'e4SkillHealingDmgBuffStacks',
    text: t('Content.e4SkillHealingDmgBuffStacks.text'),
    title: t('Content.e4SkillHealingDmgBuffStacks.title'),
    content: t('Content.e4SkillHealingDmgBuffStacks.content'),
    min: 0,
    max: 3,
    disabled: e < 4,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'healingMaxHpBuff'),
    findContentId(content, 'talentDmgReductionBuff'),
    findContentId(content, 'e4SkillHealingDmgBuffStacks'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      healingMaxHpBuff: true,
      talentDmgReductionBuff: true,
      e2UltHealingBuff: true,
      e4SkillHealingDmgBuffStacks: 0,
    }),
    teammateDefaults: () => ({
      healingMaxHpBuff: true,
      talentDmgReductionBuff: true,
      e4SkillHealingDmgBuffStacks: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.OHB] += (e >= 2 && r.e2UltHealingBuff) ? 0.15 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.HP_P] += (m.healingMaxHpBuff) ? 0.10 : 0

      x.ELEMENTAL_DMG += (e >= 4) ? m.e4SkillHealingDmgBuffStacks * 0.10 : 0
      x.DMG_RED_MULTI *= (m.talentDmgReductionBuff) ? (1 - 0.10) : 1
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
