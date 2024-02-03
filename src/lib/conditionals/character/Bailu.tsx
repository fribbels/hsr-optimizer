import React from 'react';
import { Stats } from 'lib/constants';
import { baseComputedStatsObject } from 'lib/conditionals/constants';
import { basic, precisionRound, skill, ult } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';

export default (e: Eidolon) => {
  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'healingMaxHpBuff',
    name: 'healingMaxHpBuff',
    text: 'Healing max HP buff',
    title: 'Healing max HP buff',
    content: `When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by ${precisionRound(0.10 * 100)}% for 2 turns.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'talentDmgReductionBuff',
    name: 'talentDmgReductionBuff',
    text: 'Talent DMG reduction buff',
    title: 'Talent DMG reduction buff',
    content: `Characters with Invigoration take ${precisionRound(0.10 * 100)}% less DMG.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2UltHealingBuff',
    name: 'e2UltHealingBuff',
    text: 'E2 ult healing buff',
    title: 'E2 ult healing buff',
    content: `E2: Increases healing by ${precisionRound(0.15 * 100)}% after Ultimate.`,
    disabled: e < 2,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e4SkillHealingDmgBuffStacks',
    name: 'e4SkillHealingDmgBuffStacks',
    text: 'E4 skill healing DMG buff stacks',
    title: 'E4 skill healing DMG buff stacks',
    content: `E4: Every healing provided by Bailu's Skill makes the recipient deal ${precisionRound(0.10 * 100)}% more DMG for 2 turns. This effect can stack up to 3 times.`,
    min: 0,
    max: 3,
    disabled: e < 4,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      healingMaxHpBuff: true,
      talentDmgReductionBuff: true,
      e2UltHealingBuff: true,
      e4SkillHealingDmgBuffStacks: 0,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.HP_P] += (r.healingMaxHpBuff) ? 0.10 : 0
      x[Stats.OHB] += (e >= 2 && r.e2UltHealingBuff) ? 0.15 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.DMG_RED_MULTI *= (r.talentDmgReductionBuff) ? (1 - 0.10) : 1
      x.ALL_DMG_MULTI += (e >= 4) ? r.e4SkillHealingDmgBuffStacks * 0.10 : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += 0
      x.ULT_DMG += 0
      x.FUA_DMG += 0
    }
  }
}