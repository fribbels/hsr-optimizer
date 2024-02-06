import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basic, precisionRound, ult } from "lib/conditionals/utils";
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
    text: 'Ult buff',
    title: 'Ult buff',
    content: `Increases all allies' ATK by ${precisionRound(ultBuffValue * 100)}% for 2 turns after using Ultimate.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'skillBuff',
    name: 'skillBuff',
    text: 'E1 skill buff',
    title: 'E1 skill buff',
    content: `E1: Increases all allies' SPD by 12% for 2 turns after using Skill.`,
    disabled: e < 1,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e6DmgBuff',
    name: 'e6DmgBuff',
    text: 'E6 DMG buff',
    title: 'E6 DMG buff',
    content: `E6: When healing a target ally, increases the target ally's DMG dealt by 50% for 2 turns.`,
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