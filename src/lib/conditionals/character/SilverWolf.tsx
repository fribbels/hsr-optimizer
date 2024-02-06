import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, precisionRound, skillRev, ultRev } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";
import { PrecomputedCharacterConditional } from "types/CharacterConditional";
import { Form } from 'types/Form';

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
    text: 'Skill RES shred',
    title: 'Skill: Allow Changes? RES Shred',
    content: `Decreases the target's All-Type RES of the enemy by ${precisionRound(skillResShredValue * 100)}% for 2 turn(s).
    ::BR::If there are 3 or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%.`,
  }, {
    // TODO: should be talent
    formItem: FormSwitchWithPopover,
    id: 'skillDefShredDebuff',
    name: 'skillDefShredDebuff',
    text: 'Bug DEF shred',
    title: 'Talent: Awaiting System Response... DEF shred',
    content: `Silver Wolf's bug reduces the target's DEF by ${precisionRound(skillDefShredBufValue * 100)}% for 3 turn(s).`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'ultDefShredDebuff',
    name: 'ultDefShredDebuff',
    text: 'Ult DEF shred',
    title: 'Ult: User Banned DEF shred',
    content: `Decreases the target's DEF by ${precisionRound(ultDefShredValue * 100)}% for 3 turn(s).`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'targetDebuffs',
    name: 'targetDebuffs',
    text: 'Target debuffs',
    title: 'Target debuffs',
    content: `
      If there are 3 or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%.
      ::BR::
      E4: After using her Ultimate to attack enemies, deals Additional Quantum DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of 5 time(s) during each use of her Ultimate.
      ::BR::
      E6: For every debuff the target enemy has, the DMG dealt by Silver Wolf increases by 20%, up to a limit of 100%.
    `,
    min: 0,
    max: 5,
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