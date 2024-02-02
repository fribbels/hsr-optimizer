import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, skillRev, ultRev } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";

import { Eidolon } from "types/Character";

export default (e: Eidolon) => {
  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 0, 0)
  const ultScaling = ultRev(e, 2.00, 2.16)

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'fieldActive',
    name: 'fieldActive',
    text: 'Field Active',
    title: 'Field Active',
    content: `
      E1: Increases ATK by 20% for 1 turn(s) after using Ultimate.
      ::BR::
      E4: When Luocha's Field is active, enemies become Weakened and deal 12% less DMG.
    `,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e6ResReduction',
    name: 'e6ResReduction',
    text: 'E6 RES Reduction',
    title: 'E6 RES Reduction',
    content: `Decreases target's RES by 20% for 1 turn(s) after using Ultimate.`,
    disabled: e < 6,
  }]

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      fieldActive: true,
      e6ResReduction: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r >= 1 && r.fieldActive) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.RES_PEN += (e >= 6 && r.e6ResReduction) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}
