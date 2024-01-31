import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basic, ult } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";

import { Eidolon } from "types/Character";

export default(e: Eidolon) => {
  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult Buff',
    title: 'Ult Buff',
    content: `Increases ATK by ${ultBuffValue * 100}% for 2 turn(s) after using Ultimate.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'skillBuff',
    name: 'skillBuff',
    text: 'Skill Buff',
    title: 'Skill Buff',
    content: `E1: Increases SPD by 12% for 2 turn(s) after using Skill.`,
    disabled: e < 1,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e6DmgBuff',
    name: 'e6DmgBuff',
    text: 'E6 DMG Buff',
    title: 'E6 DMG Buff',
    content: `Increases DMG by 50% for 2 turn(s) after using Ultimate.`,
    disabled: e < 6,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.SPD_P] += (e >= 1 && r.skillBuff) ? 0.12 : 0
      x[Stats.ATK_P] += (r.ultBuff) ? ultBuffValue : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      // Boost
      x.ELEMENTAL_DMG += (e >= 6 && r.skillBuff) ? 0.50 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
    }
  }
}