import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, skillRev, ultRev, talentRev, precisionRound } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";

import { Eidolon } from "types/Character";
import { Form, PrecomputedCharacterConditional } from "types/CharacterConditional";

export default (e: Eidolon) => {
  const targetBurnedExtraScaling = talentRev(e, 1.00, 1.10);

  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 2.40, 2.64);
  const skillEnhancedScaling = skillRev(e, 2.80, 3.08);
  const ultScaling = ultRev(e, 4.00, 4.32);
  const dotScaling = skillRev(e, 0.65, 0.715);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'enhancedSkill',
    name: 'enhancedSkill',
    text: 'Enhanced Skill',
    title: 'Enhanced Skill',
    content: `After Ult, Skill DMG increases by ${precisionRound(skillEnhancedScaling * 100)}%.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'targetBurned',
    name: 'targetBurned',
    text: 'Target Burned',
    title: 'Target Burned',
    content: `Increases DMG by ${precisionRound(targetBurnedExtraScaling * 100)}% against enemies affected by Burn.`,
  }];


  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      enhancedSkill: true,
      targetBurned: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += (r.enhancedSkill) ? skillEnhancedScaling : skillScaling
      x.ULT_SCALING += ultScaling
      x.BASIC_SCALING += (r.targetBurned) ? targetBurnedExtraScaling : 0
      x.SKILL_SCALING += (r.targetBurned) ? targetBurnedExtraScaling : 0
      x.ULT_SCALING += (r.targetBurned) ? targetBurnedExtraScaling : 0
      x.DOT_SCALING += dotScaling

      // Boost
      x.SKILL_BOOST += (e >= 1 && r.enhancedSkill) ? 0.20 : 0
      x.ELEMENTAL_DMG += (e >= 6 && r.targetBurned) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    }
  }
}