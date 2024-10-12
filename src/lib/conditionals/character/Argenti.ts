import { Stats } from 'lib/constants'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Argenti')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const talentMaxStacks = (e >= 4) ? 12 : 10

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 1.60, 1.728)
  const ultEnhancedScaling = ult(e, 2.80, 3.024)
  const ultEnhancedExtraHitScaling = ult(e, 0.95, 1.026)
  const talentCrStackValue = talent(e, 0.025, 0.028)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'ultEnhanced',
      name: 'ultEnhanced',
      text: t('Content.ultEnhanced.text'),
      title: t('Content.ultEnhanced.title'),
      content: t('Content.ultEnhanced.content', { ultEnhancedExtraHitScaling: TsUtils.precisionRound(100 * ultEnhancedExtraHitScaling), ultEnhancedScaling: TsUtils.precisionRound(100 * ultEnhancedScaling) }),
    },
    {
      formItem: 'switch',
      id: 'enemyHp50',
      name: 'enemyHp50',
      text: t('Content.enemyHp50.text'),
      title: t('Content.enemyHp50.title'),
      content: t('Content.enemyHp50.content'),
    },
    {
      formItem: 'slider',
      id: 'talentStacks',
      name: 'talentStacks',
      text: t('Content.talentStacks.text'),
      title: t('Content.talentStacks.title'),
      content: t('Content.talentStacks.content', { talentMaxStacks: TsUtils.precisionRound(100 * talentMaxStacks), talentCrStackValue: TsUtils.precisionRound(100 * talentCrStackValue) }),
      min: 0,
      max: talentMaxStacks,
    },
    {
      formItem: 'slider',
      id: 'ultEnhancedExtraHits',
      name: 'ultEnhancedExtraHits',
      text: t('Content.ultEnhancedExtraHits.text'),
      title: t('Content.ultEnhancedExtraHits.title'),
      content: t('Content.ultEnhancedExtraHits.content', { ultEnhancedExtraHitScaling: TsUtils.precisionRound(100 * ultEnhancedExtraHitScaling) }),
      min: 0,
      max: 6,
    },
    {
      formItem: 'switch',
      id: 'e2UltAtkBuff',
      name: 'e2UltAtkBuff',
      text: t('Content.e2UltAtkBuff.text'),
      title: t('Content.e2UltAtkBuff.title'),
      content: t('Content.e2UltAtkBuff.content'),
      disabled: e < 2,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultEnhanced: true,
      talentStacks: talentMaxStacks,
      ultEnhancedExtraHits: 6,
      e2UltAtkBuff: true,
      enemyHp50: true,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Skills
      x[Stats.CR] += (r.talentStacks) * talentCrStackValue

      // Traces

      // Eidolons
      x[Stats.CD] += (e >= 1) ? (r.talentStacks) * 0.04 : 0
      x[Stats.ATK_P] += (e >= 2 && r.e2UltAtkBuff) ? 0.40 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += (r.ultEnhanced) ? ultEnhancedScaling : ultScaling
      x.ULT_SCALING += (r.ultEnhancedExtraHits) * ultEnhancedExtraHitScaling

      // BOOST
      x.ELEMENTAL_DMG += (r.enemyHp50) ? 0.15 : 0
      // Argenti's e6 ult buff is actually a cast type buff, not dmg type but we'll do it like this anyways
      buffAbilityDefPen(x, ULT_TYPE, 0.30, (e >= 6))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += (r.ultEnhanced) ? 60 + 15 * r.ultEnhancedExtraHits : 60

      return x
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
