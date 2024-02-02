import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basic, precisionRound, skill, ult } from "lib/conditionals/utils";
import { Eidolon } from "types/Character";

import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { Form } from "types/CharacterConditional";


const Tingyun = (e: Eidolon) => {
  const skillAtkBoostMax = skill(e, 0.25, 0.27);
  const ultDmgBoost = ult(e, 0.50, 0.56);
  const skillAtkBoostScaling = skill(e, 0.50, 0.55) + ((e >= 4) ? 0.20 : 0);
  // const talentScaling = talent(e, 0.60, 0.66) + ((e >= 4) ? 0.20 : 0);

  const basicScaling = basic(e, 1.00, 1.10);
  const skillScaling = skill(e, 0, 0);
  const ultScaling = ult(e, 0, 0);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'benedictionBuff',
    name: 'benedictionBuff',
    text: 'Benediction Buff',
    title: 'Benediction Buff',
    content: `Grants a single ally with Benediction to increase their ATK by ${precisionRound(skillAtkBoostScaling * 100)}%, up to ${precisionRound(skillAtkBoostMax * 100)}% of Tingyun's current ATK.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'skillSpdBuff',
    name: 'skillSpdBuff',
    text: 'Skill SPD Buff',
    title: 'Skill SPD Buff',
    content: `Tingyun's SPD increases by 20% for 1 turn after using Skill.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'ultSpdBuff',
    name: 'ultSpdBuff',
    text: 'Ult SPD Buff',
    title: 'Ult SPD Buff',
    content: `After using their Ultimate, the ally with Benediction gains a 20% increase in SPD for 1 turn.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'ultDmgBuff',
    name: 'ultDmgBuff',
    text: 'Ult DMG Buff',
    title: 'Ult DMG Buff',
    content: `Regenerates 50 Energy for a single ally and increases the target's DMG by ${precisionRound(ultDmgBoost)}% for 2 turn(s).`,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      benedictionBuff: false,
      skillSpdBuff: false,
      ultSpdBuff: false,
      ultDmgBuff: false,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals;
      const x = Object.assign({}, baseComputedStatsObject);

      // Stats
      x[Stats.SPD_P] += (e >= 1 && r.ultSpdBuff) ? 0.20 : 0
      x[Stats.SPD_P] += (r.skillSpdBuff) ? 0.20 : 0
      x[Stats.ATK_P] += (r.benedictionBuff) ? skillAtkBoostMax : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.BASIC_BOOST += 0.40
      x.ELEMENTAL_DMG += (r.ultDmgBuff) ? ultDmgBoost : 0

      return x;
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}
export default Tingyun;