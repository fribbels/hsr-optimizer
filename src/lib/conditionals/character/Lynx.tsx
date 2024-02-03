import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, precisionRound, skillRev, ultRev } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";

import { Eidolon } from "types/Character";

export default (e: Eidolon) => {
  const skillHpPercentBuff = skillRev(e, 0.075, 0.08);
  const skillHpFlatBuff = skillRev(e, 200, 223);

  const basicScaling = basicRev(e, 0.50, 0.55);
  const skillScaling = skillRev(e, 0, 0);
  const ultScaling = ultRev(e, 0, 0);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'skillBuff',
    name: 'skillBuff',
    text: 'Skill max HP buff',
    title: 'Skill max HP buff',
    content: `
    Applies "Survival Response" to a single target ally and increases their Max HP by ${precisionRound(skillHpPercentBuff * 100)}% of Lynx's Max HP plus ${precisionRound(skillHpFlatBuff)}.
    ::BR::E4: When "Survival Response" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s).`,
  }]

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      skillBuff: true,
      e4TalentAtkBuff: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.HP_P] += (r.skillBuff) ? skillHpPercentBuff : 0
      x[Stats.HP] += (r.skillBuff) ? skillHpFlatBuff : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost

      return x
    },
    calculateBaseMultis: (c, request) => {
      const r = request.characterConditionals
      const x = c.x

      x[Stats.HP] += (e >= 6 && r.skillBuff) ? 0.06 * x[Stats.HP] : 0
      x[Stats.ATK] += (e >= 4 && r.skillBuff) ? 0.03 * x[Stats.HP] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}
