import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, precisionRound, skillRev, ultRev } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";
import { Form, PrecomputedCharacterConditional } from "types/CharacterConditional";

const SilverWolf = (e: Eidolon) => {
  const skillResShredValue = skillRev(e, 0.10, 0.105);
  const skillDefShredBufValue = skillRev(e, 0.08, 0.088);
  const ultDefShredValue = ultRev(e, 0.45, 0.468);

  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 1.96, 2.156);
  const ultScaling = ultRev(e, 3.80, 4.104);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'skillResShredDebuff',
    name: 'skillResShredDebuff',
    text: 'Skill RES Shred',
    title: 'Skill: Allow Changes? RES Shred',
    content: `Decreases the target's RES by ${precisionRound(skillResShredValue * 100)}% for 2 turn(s) after using Skill.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'skillDefShredDebuff',
    name: 'skillDefShredDebuff',
    text: 'Skill DEF Shred',
    title: 'Skill: Allow Changes? DEF Reduction',
    content: `Decreases the target's DEF by ${precisionRound(skillDefShredBufValue * 100)}% for 2 turn(s) after using Skill.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'ultDefShredDebuff',
    name: 'ultDefShredDebuff',
    text: 'Ult DEF Shred',
    title: 'Ult: User Banned DEF Reduction',
    content: `Decreases the target's DEF by ${precisionRound(ultDefShredValue * 100)}% for 2 turn(s) after using Ultimate.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'targetDebuffs',
    name: 'targetDebuffs',
    text: 'Target debuffs',
    title: 'Target Debuffs',
    content: `
      E4: Ultimate deals Additional Quantum DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target.
      ::BR::
      E6: Increases Elemental DMG by 20% per debuff on the target, up to 5 debuffs.
    `,
    min: 0,
    max: 5,
    disabled: e < 4,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      skillResShredDebuff: true,
      skillDefShredDebuff: true,
      ultDefShredDebuff: true,
      targetDebuffs: 5,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 4) ? r.targetDebuffs * 0.20 : 0

      // Boost
      x.RES_PEN += (r.skillResShredDebuff) ? skillResShredValue : 0
      x.RES_PEN += (r.skillResShredDebuff && r.targetDebuffs >= 3) ? 0.03 : 0
      x.DEF_SHRED += (r.skillDefShredDebuff) ? skillDefShredBufValue : 0
      x.DEF_SHRED += (r.ultDefShredDebuff) ? ultDefShredValue : 0
      x.ELEMENTAL_DMG += (e >= 6) ? r.targetDebuffs * 0.20 : 0

      return x;
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}

export default SilverWolf;