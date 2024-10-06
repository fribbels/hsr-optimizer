import { Stats } from 'lib/constants'
import { ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.TrailblazerDestruction')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const talentAtkScalingValue = talent(e, 0.20, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.25, 1.375)
  const ultScaling = ult(e, 4.5, 4.80)
  const ultEnhancedScaling = ult(e, 2.70, 2.88)
  const ultEnhancedScaling2 = ult(e, 1.62, 1.728)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'enhancedUlt',
    name: 'Enhanced Ult',
    text: t('Content.enhancedUlt.text'),
    title: t('Content.enhancedUlt.title'),
    content: t('Content.enhancedUlt.content', { ultScaling: TsUtils.precisionRound(100 * ultScaling), ultEnhancedScaling: TsUtils.precisionRound(100 * ultEnhancedScaling), ultEnhancedScaling2: TsUtils.precisionRound(100 * ultEnhancedScaling2) }),
  }, {
    formItem: 'slider',
    id: 'talentStacks',
    name: 'Talent stacks',
    text: t('Content.talentStacks.text'),
    title: t('Content.talentStacks.title'),
    content: t('Content.talentStacks.content', { talentAtkScalingValue: TsUtils.precisionRound(100 * talentAtkScalingValue) }),
    min: 0,
    max: 2,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enhancedUlt: true,
      talentStacks: 2,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.ATK_P] += r.talentStacks * talentAtkScalingValue
      x[Stats.DEF_P] += r.talentStacks * 0.10
      x[Stats.CR] += (x.ENEMY_WEAKNESS_BROKEN) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += (r.enhancedUlt) ? ultEnhancedScaling : ultScaling

      // Boost
      buffAbilityDmg(x, SKILL_TYPE, 0.25)
      buffAbilityDmg(x, ULT_TYPE, 0.25, (r.enhancedUlt))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += (r.enhancedUlt) ? 60 : 90

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
