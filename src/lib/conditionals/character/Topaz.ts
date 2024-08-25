import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, BASIC_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet, findContentId, precisionRound } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityCd, buffAbilityResPen, buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'

export default (e: Eidolon): CharacterConditional => {
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
    text: 'Proof of Debt debuff',
    title: 'Proof of Debt',
    content: `Inflicts a single target enemy with a Proof of Debt status, increasing the DMG it takes from follow-up attacks by ${precisionRound(proofOfDebtFuaVulnerability * 100)}%.`,
  }, {
    formItem: 'switch',
    id: 'numbyEnhancedState',
    name: 'numbyEnhancedState',
    text: 'Numby enhanced state',
    title: 'Turn a Profit!: Ult Enhanced State',
    content: `Numby enters the Windfall Bonanza! state and its DMG multiplier increases by ${precisionRound(enhancedStateFuaScalingBoost * 100)}% and CRIT DMG increases by ${precisionRound(enhancedStateFuaCdBoost * 100)}%.`,
  }, {
    formItem: 'slider',
    id: 'e1DebtorStacks',
    name: 'e1DebtorStacks',
    text: 'E1 Debtor stacks',
    title: `E1 Increases Crit DMG`,
    content: `E1: When enemies afflicted with Proof of Debt receive follow-up attacks, they will enter the Debtor state. This can take effect only once within a single action. The Debtor state increases the CRIT DMG of follow-up attacks inflicted on the target enemies by 25%, stacking up to 2 time(s). When Proof of Debt is removed, the Debtor state is also removed.`,
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
    initializeConfigurations: (x: ComputedStatsObject, request: Form) => {
      x.BASIC_DMG_TYPE = BASIC_TYPE | FUA_TYPE
      x.SKILL_DMG_TYPE = SKILL_TYPE | FUA_TYPE
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

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
      x.ELEMENTAL_DMG += (request.enemyElementalWeak) ? 0.15 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, FUA_TYPE, proofOfDebtFuaVulnerability, (m.enemyProofOfDebtDebuff))
      buffAbilityCd(x, FUA_TYPE, 0.25 * m.e1DebtorStacks, (e >= 1 && m.enemyProofOfDebtDebuff))
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      const basicAshblazingAtk = calculateAshblazingSet(x, request, basicHitCountMulti)
      const fuaAshblazingAtk = calculateAshblazingSet(x, request, hitMulti)
      x.BASIC_DMG += x.BASIC_SCALING * (x[Stats.ATK] + basicAshblazingAtk)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] + fuaAshblazingAtk)
      x.SKILL_DMG = x.FUA_DMG
    },
    gpuFinalizeCalculations: (request: Form) => {
      const r = request.characterConditionals
      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti

      return `
x.BASIC_DMG += x.BASIC_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${basicHitCountMulti}));
x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${hitMulti}));
x.SKILL_DMG = x.FUA_DMG;
    `
    },
  }
}
