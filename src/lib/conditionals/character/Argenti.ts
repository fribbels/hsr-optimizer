import { ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
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

  const defaults = {
    ultEnhanced: true,
    talentStacks: talentMaxStacks,
    ultEnhancedExtraHits: 6,
    e2UltAtkBuff: true,
    enemyHp50: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultEnhanced: {
      formItem: 'switch',
      id: 'ultEnhanced',
      text: t('Content.ultEnhanced.text'),
      content: t('Content.ultEnhanced.content', {
        ultEnhancedExtraHitScaling: TsUtils.precisionRound(100 * ultEnhancedExtraHitScaling),
        ultEnhancedScaling: TsUtils.precisionRound(100 * ultEnhancedScaling),
      }),
    },
    enemyHp50: {
      formItem: 'switch',
      id: 'enemyHp50',
      text: t('Content.enemyHp50.text'),
      content: t('Content.enemyHp50.content'),
    },
    talentStacks: {
      formItem: 'slider',
      id: 'talentStacks',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', {
        talentMaxStacks: TsUtils.precisionRound(100 * talentMaxStacks),
        talentCrStackValue: TsUtils.precisionRound(100 * talentCrStackValue),
      }),
      min: 0,
      max: talentMaxStacks,
    },
    ultEnhancedExtraHits: {
      formItem: 'slider',
      id: 'ultEnhancedExtraHits',
      text: t('Content.ultEnhancedExtraHits.text'),
      content: t('Content.ultEnhancedExtraHits.content', { ultEnhancedExtraHitScaling: TsUtils.precisionRound(100 * ultEnhancedExtraHitScaling) }),
      min: 0,
      max: 6,
    },
    e2UltAtkBuff: {
      formItem: 'switch',
      id: 'e2UltAtkBuff',
      text: t('Content.e2UltAtkBuff.text'),
      content: t('Content.e2UltAtkBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      // Skills
      x.CR.buff((r.talentStacks) * talentCrStackValue, Source.NONE)

      // Traces

      // Eidolons
      x.CD.buff((e >= 1) ? (r.talentStacks) * 0.04 : 0, Source.NONE)
      x.ATK_P.buff((e >= 2 && r.e2UltAtkBuff) ? 0.40 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff((r.ultEnhanced) ? ultEnhancedScaling : ultScaling, Source.NONE)
      x.ULT_SCALING.buff((r.ultEnhancedExtraHits) * ultEnhancedExtraHitScaling, Source.NONE)

      // BOOST
      x.ELEMENTAL_DMG.buff((r.enemyHp50) ? 0.15 : 0, Source.NONE)
      // Argenti's e6 ult buff is actually a cast type buff, not dmg type but we'll do it like this anyways
      buffAbilityDefPen(x, ULT_TYPE, (e >= 6) ? 0.30 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff((r.ultEnhanced) ? 60 + 15 * r.ultEnhancedExtraHits : 60, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
