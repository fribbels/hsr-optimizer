import React from 'react';
import { Stats } from 'lib/constants';
import { baseComputedStatsObject } from 'lib/conditionals/constants';
import { basic, precisionRound, skill, ult } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { Form } from 'types/Form';


export default (e:Eidolon) => {
  const skillCdBuffScaling = skill(e, 0.24, 0.264);
  const skillCdBuffBase = skill(e, 0.45, 0.486);
  const cipherTalentStackBoost = ult(e, 0.10, 0.108);
  const talentBaseStackBoost = ult(e, 0.06, 0.066);

  const basicScaling = basic(e, 1.00, 1.10);
  const skillScaling = skill(e, 0, 0);
  const ultScaling = ult(e, 0, 0);

  const atkBoostByQuantumAllies = {
    0: 0,
    1: 0.05,
    2: 0.15,
    3: 0.30,
  };

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'skillCdBuff',
    name: 'skillCdBuff',
    text: 'Skill CD buff',
    title: 'Skill CD buff',
    content: `Increases the CRIT DMG of a single ally by ${precisionRound(skillCdBuffScaling * 100)}% of Sparkle's CRIT DMG plus ${precisionRound(skillCdBuffBase * 100)}%, lasting for 1 turn(s).`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'cipherBuff',
    name: 'cipherBuff',
    text: 'Cipher buff',
    title: 'Cipher buff',
    content: `When allies with Cipher trigger the DMG Boost effect provided by Sparkle's Talent, each stack additionally increases its effect by ${precisionRound(cipherTalentStackBoost * 100)}%, lasting for 2 turns.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'talentStacks',
    name: 'talentStacks',
    text: 'Talent DMG stacks',
    title: 'Talent DMG stacks',
    content: `Whenever an ally consumes 1 Skill Point, all allies' DMG increases by ${precisionRound(talentBaseStackBoost * 100)}%. This effect lasts for 2 turn(s) and can stack up to 3 time(s).`,
    min: 0,
    max: 3,
  }, {
    formItem: FormSliderWithPopover,
    id: 'quantumAllies',
    name: 'quantumAllies',
    text: 'Quantum allies',
    title: 'Quantum allies',
    content: `When there are 1/2/3 Quantum allies in your team, Quantum-Type allies' ATK are increased by 5%/15%/30%.`,
    min: 0,
    max: 3,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      skillCdBuff: true,
      cipherBuff: true,
      talentStacks: 3,
      quantumAllies: 3,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.ATK_P] += 0.15 + (atkBoostByQuantumAllies[r.quantumAllies] || 0)
      x[Stats.ATK_P] += (e >= 1 && r.cipherBuff) ? 0.40 : 0

      x.ELEMENTAL_DMG += (r.cipherBuff) ? r.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost) : r.talentStacks * talentBaseStackBoost
      x.DEF_SHRED += (e >= 2) ? 0.08 * r.talentStacks : 0

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x'];

      x[Stats.CD] += (r.skillCdBuff) ? skillCdBuffBase + skillCdBuffScaling * x[Stats.CD] : 0
      x[Stats.CD] += (e >= 6 && r.skillCdBuff) ? 0.30 * x[Stats.CD] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}
