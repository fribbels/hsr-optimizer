import { ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE, FUA_DMG_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { ashblazingWgsl } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, calculateAshblazingSet, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, buffAbilityResPen, buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Topaz')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1112')

  const proofOfDebtFuaVulnerability = skill(e, 0.50, 0.55)
  const enhancedStateFuaScalingBoost = ult(e, 1.50, 1.65)
  const enhancedStateFuaCdBoost = ult(e, 0.25, 0.275)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const fuaScaling = talent(e, 1.50, 1.65)

  // 0.06
  const basicHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 1)

  // 0.18
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 7 + 2 * 1 / 7 + 3 * 1 / 7 + 4 * 1 / 7 + 5 * 1 / 7 + 6 * 1 / 7 + 7 * 1 / 7)

  // 0.252
  const fuaEnhancedHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 10 + 2 * 1 / 10 + 3 * 1 / 10 + 4 * 1 / 10 + 5 * 1 / 10 + 6 * 1 / 10 + 7 * 1 / 10 + 8 * 3 / 10)

  const defaults = {
    enemyProofOfDebtDebuff: true,
    numbyEnhancedState: true,
    e1DebtorStacks: 2,
  }

  const teammateDefaults = {
    enemyProofOfDebtDebuff: true,
    e1DebtorStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyProofOfDebtDebuff: {
      id: 'enemyProofOfDebtDebuff',
      formItem: 'switch',
      text: t('Content.enemyProofOfDebtDebuff.text'),
      content: t('Content.enemyProofOfDebtDebuff.content', { proofOfDebtFuaVulnerability: TsUtils.precisionRound(100 * proofOfDebtFuaVulnerability) }),
    },
    numbyEnhancedState: {
      id: 'numbyEnhancedState',
      formItem: 'switch',
      text: t('Content.numbyEnhancedState.text'),
      content: t('Content.numbyEnhancedState.content', {
        enhancedStateFuaCdBoost: TsUtils.precisionRound(100 * enhancedStateFuaCdBoost),
        enhancedStateFuaScalingBoost: TsUtils.precisionRound(100 * enhancedStateFuaScalingBoost),
      }),
    },
    e1DebtorStacks: {
      id: 'e1DebtorStacks',
      formItem: 'slider',
      text: t('Content.e1DebtorStacks.text'),
      content: t('Content.e1DebtorStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyProofOfDebtDebuff: content.enemyProofOfDebtDebuff,
    e1DebtorStacks: content.e1DebtorStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG_TYPE.set(BASIC_DMG_TYPE | FUA_DMG_TYPE, SOURCE_TRACE)
      x.SKILL_DMG_TYPE.set(SKILL_DMG_TYPE | FUA_DMG_TYPE, SOURCE_SKILL)
      x.SUMMONS.set(1, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      buffAbilityCd(x, SKILL_DMG_TYPE | FUA_DMG_TYPE, (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0, SOURCE_ULT)
      buffAbilityResPen(x, SKILL_DMG_TYPE | FUA_DMG_TYPE, (e >= 6) ? 0.10 : 0, SOURCE_E6)

      // Numby buffs only applies to the skill/fua not basic, we deduct it from basic
      buffAbilityCd(x, BASIC_DMG_TYPE, (r.numbyEnhancedState) ? -enhancedStateFuaCdBoost : 0, SOURCE_ULT)
      buffAbilityResPen(x, BASIC_DMG_TYPE, (e >= 6) ? -0.10 : 0, SOURCE_E6)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_SCALING.buff((r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0, SOURCE_ULT)
      x.FUA_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_SCALING.buff((r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0, SOURCE_ULT)

      // Boost
      x.ELEMENTAL_DMG.buff((context.enemyElementalWeak) ? 0.15 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(30, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(60, SOURCE_SKILL)
      x.FUA_TOUGHNESS_DMG.buff(60, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, FUA_DMG_TYPE, (m.enemyProofOfDebtDebuff) ? proofOfDebtFuaVulnerability : 0, SOURCE_SKILL, Target.TEAM)
      buffAbilityCd(x, FUA_DMG_TYPE, (e >= 1 && m.enemyProofOfDebtDebuff) ? 0.25 * m.e1DebtorStacks : 0, SOURCE_E1, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      const basicAshblazingAtk = calculateAshblazingSet(x, action, context, basicHitCountMulti)
      const fuaAshblazingAtk = calculateAshblazingSet(x, action, context, hitMulti)
      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * (x.a[Key.ATK] + basicAshblazingAtk), Source.NONE)
      x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * (x.a[Key.ATK] + fuaAshblazingAtk), Source.NONE)
      x.SKILL_DMG.set(x.a[Key.FUA_DMG], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti

      return `
x.BASIC_DMG += x.BASIC_SCALING * (x.ATK + ${ashblazingWgsl(basicHitCountMulti)});
x.FUA_DMG += x.FUA_SCALING * (x.ATK + ${ashblazingWgsl(hitMulti)});
x.SKILL_DMG = x.FUA_DMG;
    `
    },
  }
}
