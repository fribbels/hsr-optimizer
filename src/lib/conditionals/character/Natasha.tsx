import React from "react";
// import { Flex } from "antd";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basic, skill, ult } from "lib/conditionals/utils";
// import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
// import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
// import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

// import { Eidolon } from "types/Character";
// import { Form, PrecomputedCharacterConditional } from "types/CharacterConditional";

export default (e) => {
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  return {
    display: () => (
      <br />
    ),
    defaults: () => ({
    }),
    precomputeEffects: () => {
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost

      return x
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.BASIC_DMG += (e >= 6) ? 0.40 * x[Stats.HP] : 0
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}