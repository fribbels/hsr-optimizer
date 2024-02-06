import React from "react";
import { Stats } from "lib/constants";
import { Eidolon } from "types/Character";
import { Form } from "types/Form";

import { basic, precisionRound, skill, ult } from "../utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { baseComputedStatsObject } from "../constants";
import { Unknown } from "types/Common";

const RuanMei = (e: Eidolon) => {
  const fieldResPenValue = ult(e, 0.25, 0.27)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'ultFieldActive',
    name:'ultFieldActive',
    text: 'Ult field active',
    title: 'Ult field active',
    content: `While inside the field, all allies' All-Type RES PEN increases by ${precisionRound(fieldResPenValue * 100)}%.
    ::BR::
    E1: While the Ultimate's field is deployed, the DMG dealt by all allies ignores 20% of the target's DEF.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e4BeBuff',
    name:'e4BeBuff',
    text: 'E4 break effect buff',
    title: 'E4 break effect buff',
    content: 'E4: When an enemy target\'s Weakness is Broken, Ruan Mei\'s Break Effect increases by 100% for 3 turn(s).',
    disabled: (e < 4),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      ultFieldActive: true,
      e4BeBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.BE] += 0.20
      x[Stats.BE] += (e >= 4 && r.e4BeBuff) ? 1.00 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.RES_PEN += (r.ultFieldActive) ? fieldResPenValue : 0
      x.DEF_SHRED += (e >= 1 && r.ultFieldActive) ? 0.20 : 0
      x[Stats.ATK_P] += (e >= 2 && request.enemyWeaknessBroken) ? 0.40 : 0

      return x
    },
    calculateBaseMultis: (c: Unknown) => {
      const x = c['x'];

      const beOver = precisionRound((x[Stats.BE] * 100 - 120) / 10)
      x.ELEMENTAL_DMG += Math.floor(Math.max(0, beOver)) * 0.06

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

export default RuanMei;