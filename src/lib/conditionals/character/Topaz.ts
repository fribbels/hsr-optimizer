import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, calculateAshblazingSet, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

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
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += (r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0
      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += (r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0

      // Boost
      x.ELEMENTAL_DMG += (request.enemyElementalWeak) ? 0.15 : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.FUA_VULNERABILITY += (m.enemyProofOfDebtDebuff) ? proofOfDebtFuaVulnerability : 0
      x.FUA_CD_BOOST += (e >= 1 && m.enemyProofOfDebtDebuff) ? 0.25 * m.e1DebtorStacks : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      const ashblazingFuaData = calculateAshblazingSet(c, request, hitMulti)
      const ashblazingBasicData = calculateAshblazingSet(c, request, basicHitCountMulti)

      x.BASIC_DMG += x.BASIC_SCALING * (x[Stats.ATK] - ashblazingBasicData.ashblazingAtk + ashblazingBasicData.ashblazingMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingFuaData.ashblazingAtk + ashblazingFuaData.ashblazingMulti)
      x.SKILL_DMG = x.FUA_DMG

      /*
       * Copy fua boosts to skill/basic
       * BOOSTS get added, while vulnerability / def pen gets replaced (?)
       */
      x.SKILL_BOOST += x.FUA_BOOST
      x.SKILL_CD_BOOST += x.FUA_CD_BOOST
      x.SKILL_CR_BOOST += x.FUA_CR_BOOST
      x.SKILL_VULNERABILITY = x.FUA_VULNERABILITY
      x.SKILL_DEF_PEN = x.FUA_DEF_PEN
      x.SKILL_RES_PEN = x.FUA_RES_PEN

      x.BASIC_BOOST += x.FUA_BOOST
      x.BASIC_CD_BOOST += x.FUA_CD_BOOST
      x.BASIC_CR_BOOST += x.FUA_CR_BOOST
      x.BASIC_VULNERABILITY = x.FUA_VULNERABILITY
      x.BASIC_DEF_PEN = x.FUA_DEF_PEN
      x.BASIC_RES_PEN = x.FUA_RES_PEN

      // Her ult buff only applies to the skill/fua not basic
      x.FUA_CD_BOOST += (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0
      x.SKILL_CD_BOOST += (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0

      // Her e6 only applies to skill/fua not basic
      x.SKILL_RES_PEN += (e >= 6) ? 0.10 : 0
      x.FUA_RES_PEN += (e >= 6) ? 0.10 : 0
    },
  }
}
