import React from "react";
import { Stats } from "lib/constants";
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from "lib/conditionals/constants";
import { basic, calculateAshblazingSet, precisionRound, skill, talent, ult } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";
import { Form, PrecomputedCharacterConditional } from "types/CharacterConditional";

const Qingque = (e: Eidolon) => {
  const skillStackDmg = skill(e, 0.38, 0.408);
  const talentAtkBuff = talent(e, 0.72, 0.792);

  const basicScaling = basic(e, 1.00, 1.10);
  const basicEnhancedScaling = basic(e, 2.40, 2.64);
  const skillScaling = skill(e, 0, 0);
  const ultScaling = ult(e, 2.00, 2.16);

  const hitMultiByTargetsBlast = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1)  // 0.12
  };

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'basicEnhanced',
    name: 'basicEnhanced',
    text: 'Basic enhanced',
    title: 'Basic enhanced',
    content: `Increases ATK by ${precisionRound(talentAtkBuff * 100)}% and SPD by 10%.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'basicEnhancedSpdBuff',
    name: 'basicEnhancedSpdBuff',
    text: 'Basic enhanced SPD buff',
    title: 'Basic enhanced SPD buff',
    content: `Increases SPD by 10%.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'skillDmgIncreaseStacks',
    name: 'skillDmgIncreaseStacks',
    text: 'Skill DMG stacks',
    title: 'Skill DMG stacks',
    content: `Increases DMG by ${precisionRound(skillStackDmg * 100)}% per stack. Stacks up to 4 times.`,
    min: 0,
    max: 4,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      basicEnhanced: true,
      basicEnhancedSpdBuff: true,
      skillDmgIncreaseStacks: 4,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject);

      // Stats
      x[Stats.ATK_P] += (r.basicEnhanced) ? talentAtkBuff : 0
      x[Stats.SPD_P] += (r.basicEnhancedSpdBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += (e >= 4) ? x.BASIC_SCALING : 0

      // Boost
      x.ELEMENTAL_DMG += r.skillDmgIncreaseStacks * skillStackDmg
      x.ULT_BOOST += (e >= 1) ? 0.10 : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals;
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK];
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK];
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK];

      if (r.basicEnhanced) {
        const hitMulti = hitMultiByTargetsBlast[request.enemyCount];
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti);
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti);
      } else {
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMultiSingle);
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti);
      }
    }
  }
};
export default Qingque;