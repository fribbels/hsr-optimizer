import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, BASIC_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet, findContentId } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityCd, buffAbilityResPen, buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Topaz')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

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

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'enemyProofOfDebtDebuff',
    name: 'enemyProofOfDebtDebuff',
    text: t('Content.enemyProofOfDebtDebuff.text'),
    title: t('Content.enemyProofOfDebtDebuff.title'),
    content: t('Content.enemyProofOfDebtDebuff.content', { proofOfDebtFuaVulnerability: TsUtils.precisionRound(100 * proofOfDebtFuaVulnerability) }),
  }, {
    formItem: 'switch',
    id: 'numbyEnhancedState',
    name: 'numbyEnhancedState',
    text: t('Content.numbyEnhancedState.text'),
    title: t('Content.numbyEnhancedState.title'),
    content: t('Content.numbyEnhancedState.content', { enhancedStateFuaCdBoost: TsUtils.precisionRound(100 * enhancedStateFuaCdBoost), enhancedStateFuaScalingBoost: TsUtils.precisionRound(100 * enhancedStateFuaScalingBoost) }),
  }, {
    formItem: 'slider',
    id: 'e1DebtorStacks',
    name: 'e1DebtorStacks',
    text: t('Content.e1DebtorStacks.text'),
    title: t('Content.e1DebtorStacks.title'),
    content: t('Content.e1DebtorStacks.content'),
    min: 0,
    max: 2,
    disabled: e < 1,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'enemyProofOfDebtDebuff'),
    findContentId(content, 'e1DebtorStacks'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      enemyProofOfDebtDebuff: true,
      numbyEnhancedState: true,
      e1DebtorStacks: 2,
    }),
    teammateDefaults: () => ({
      enemyProofOfDebtDebuff: true,
      e1DebtorStacks: 2,
    }),
    initializeConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG_TYPE = BASIC_TYPE | FUA_TYPE
      x.SKILL_DMG_TYPE = SKILL_TYPE | FUA_TYPE
      x.SUMMONS = 1
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      buffAbilityCd(x, SKILL_TYPE | FUA_TYPE, enhancedStateFuaCdBoost, (r.numbyEnhancedState))
      buffAbilityResPen(x, SKILL_TYPE | FUA_TYPE, 0.10, (e >= 6))

      // Numby buffs only applies to the skill/fua not basic, we deduct it from basic
      buffAbilityCd(x, BASIC_TYPE, -enhancedStateFuaCdBoost, (r.numbyEnhancedState))
      buffAbilityResPen(x, BASIC_TYPE, -0.10, (e >= 6))

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += (r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0
      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += (r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0

      // Boost
      x.ELEMENTAL_DMG += (context.enemyElementalWeak) ? 0.15 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      buffAbilityVulnerability(x, FUA_TYPE, proofOfDebtFuaVulnerability, (m.enemyProofOfDebtDebuff))
      buffAbilityCd(x, FUA_TYPE, 0.25 * m.e1DebtorStacks, (e >= 1 && m.enemyProofOfDebtDebuff))
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      const basicAshblazingAtk = calculateAshblazingSet(x, action, context, basicHitCountMulti)
      const fuaAshblazingAtk = calculateAshblazingSet(x, action, context, hitMulti)
      x.BASIC_DMG += x.BASIC_SCALING * (x[Stats.ATK] + basicAshblazingAtk)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] + fuaAshblazingAtk)
      x.SKILL_DMG = x.FUA_DMG
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti

      return `
x.BASIC_DMG += x.BASIC_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${basicHitCountMulti}));
x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${hitMulti}));
x.SKILL_DMG = x.FUA_DMG;
    `
    },
  }
}
