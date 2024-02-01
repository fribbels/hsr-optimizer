import React from 'react';
import { Stats } from 'lib/constants';
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from 'lib/conditionals/constants';
import { basic, skill, talent, ult } from 'lib/conditionals/utils';
import { calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';

const Topaz = (e: Eidolon) => {
  const proofOfDebtFuaVulnerability = skill(e, 0.50, 0.55)
  const enhancedStateFuaScalingBoost = ult(e, 1.50, 1.65)
  const enhancedStateFuaCdBoost = ult(e, 0.25, 0.275)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const fuaScaling = talent(e, 1.50, 1.65)

  const fuaEnhancedHitCount = ult(e, 2, 3);

  // 0.06
  const basicHitCountMulti = ASHBLAZING_ATK_STACK *
    (1 * 1 / 1)

  // 0.18
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK *
    (1 * 1 / 7 + 2 * 1 / 7 + 3 * 1 / 7 + 4 * 1 / 7 + 5 * 1 / 7 + 6 * 1 / 7 + 7 * 1 / 7)

  // 0.252
  const fuaEnhancedHitCountMulti = ASHBLAZING_ATK_STACK *
    (1 * 1 / 10 + 2 * 1 / 10 + 3 * 1 / 10 + 4 * 1 / 10 + 5 * 1 / 10 + 6 * 1 / 10 + 7 * 1 / 10 + 8 * 3 / 10)


  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'enemyProofOfDebtDebuff',
    name: 'enemyProofOfDebtDebuff',
    text: 'Enemy proof of debt debuff',
    title: 'Proof of Debt',
    content: `Increases DMG by ${precisionRound(proofOfDebtFuaVulnerability * 100)}% against enemies affected by Proof of Debt.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'numbyEnhancedState',
    name: 'numbyEnhancedState',
    text: 'Numby enhanced state',
    title: 'Turn a Profit!: Ult Enhanced State',
    content: `Numby enters the Windfall Bonanza! state and its DMG multiplier increases by ${precisionRound(enhancedStateFuaScalingBoost * 100)}% and CRIT DMG increases by ${precisionRound(enhancedStateFuaCdBoost * 100)}%. Also, when enemies with Proof of Debt are hit by an ally's Basic ATK, Skill, or Ultimate, Numby's action is Advanced Forward by 50%. Numby exits the Windfall Bonanza! state after using ${fuaEnhancedHitCount} attacks.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e1DebtorStacks',
    name: 'e1DebtorStacks',
    text: 'E1 Debtor stacks',
    title: `Increases Crit DMG`,
    content: `Increases Crit DMG by ${precisionRound(enhancedStateFuaCdBoost * 100)}%, stacks up to 2 times.`,
    min: 0,
    max: 2,
    disabled: e < 1,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      enemyProofOfDebtDebuff: true,
      numbyEnhancedState: true,
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
      x.FUA_VULNERABILITY += (r.enemyProofOfDebtDebuff) ? proofOfDebtFuaVulnerability : 0
      x.ELEMENTAL_DMG += (request.enemyElementalWeak) ? 0.15 : 0
      x.FUA_CD_BOOST += (e >= 1) ? 0.25 * r.e1DebtorStacks : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x'];

      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      const ashblazingFuaData = calculateAshblazingSet(c, request, hitMulti)
      const ashblazingBasicData = calculateAshblazingSet(c, request, basicHitCountMulti)


      x.BASIC_DMG += x.BASIC_SCALING * (x[Stats.ATK] - ashblazingBasicData.ashblazingAtk + ashblazingBasicData.ashblazingMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingFuaData.ashblazingAtk + ashblazingFuaData.ashblazingMulti)
      x.SKILL_DMG = x.FUA_DMG

      // Copy fua boosts to skill/basic
      // BOOSTS get added, while vulnerability / def pen gets replaced (?)
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
    }
  }
}
export default Topaz;