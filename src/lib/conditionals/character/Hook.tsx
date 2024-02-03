import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from "lib/conditionals/utils";
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
    text: 'Enhanced skill',
    title: 'Enhanced skill',
    content: `After using Ultimate, the next Skill to be used is Enhanced. Enhanced Skill deals Fire DMG equal to ${precisionRound(skillEnhancedScaling * 100)}% of Hook's ATK to a single enemy and reduced DMG to adjacent enemies.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'targetBurned',
    name: 'targetBurned',
    text: 'Target burned',
    title: 'Target burned',
    content: `When attacking a target afflicted with Burn, deals Additional Fire DMG equal to ${precisionRound(targetBurnedExtraScaling * 100)}% of Hook's ATK.`,
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