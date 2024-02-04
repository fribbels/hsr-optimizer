import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";
import { Form, PrecomputedCharacterConditional } from "types/CharacterConditional";

const Seele = (e: Eidolon) => {
  const buffedStateDmgBuff = talentRev(e, 0.80, 0.88);
  const speedBoostStacksMax = (e >= 2 ? 2 : 1);

  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 2.20, 2.42);
  const ultScaling = ultRev(e, 4.25, 4.59);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'buffedState',
    name: 'buffedState',
    text: 'Buffed State',
    title: 'Buffed State',
    content: `
      Enters the buffed state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the buffed state, the DMG of Seele's attacks increases by ${precisionRound(buffedStateDmgBuff * 100)}% for 1 turn(s).
      ::BR::
      While Seele is in the buffed state, her Quantum RES PEN increases by 20%.
    `,
  }, {
    formItem: FormSliderWithPopover,
    id: 'speedBoostStacks',
    name: 'speedBoostStacks',
    text: 'Speed boost stacks',
    title: 'Speed boost stacks',
    content: `Increases SPD by 25% per stack. Stacks up to ${precisionRound(speedBoostStacksMax)} time(s).`,
    min: 0,
    max: speedBoostStacksMax,
  
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e6UltTargetDebuff',
    name: 'e6UltTargetDebuff',
    text: 'E6 Ult Debuff',
    title: 'E6 Shattering Shambles',
    content: `E6: After Seele uses her Ultimate, inflict the target enemy with Butterfly Flurry for 1 turn(s). 
    Enemies suffering from Butterfly Flurry will take Additional Quantum DMG equal to 15% of Seele's Ultimate DMG every time they are attacked.`,
    disabled: e < 6,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      buffedState: true,
      speedBoostStacks: speedBoostStacksMax,
      e6UltTargetDebuff: true
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals;
      const x = Object.assign({}, baseComputedStatsObject);

      // Stats
      x[Stats.CR] += (e >= 1 && request.enemyHpPercent <= 0.80) ? 0.15 : 0;
      x[Stats.SPD_P] += 0.25 * r.speedBoostStacks;

      // Scaling
      x.BASIC_SCALING += basicScaling;
      x.SKILL_SCALING += skillScaling;
      x.ULT_SCALING += ultScaling;

      // Boost
      x.ELEMENTAL_DMG += (r.buffedState) ? buffedStateDmgBuff : 0;
      x.RES_PEN += (r.buffedState) ? 0.20 : 0;

      return x;
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals;
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK];
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK];
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK];

      x.BASIC_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0;
      x.SKILL_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0;
      x.ULT_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0;
    }
  }
};
export default Seele;