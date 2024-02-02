import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basic, precisionRound, skill, talent, ult } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";

const Sushang = (e: Eidolon) => {
  const talentSpdBuffValue = talent(e, 0.20, 0.21);
  const ultBuffedAtk = ult(e, 0.30, 0.324);
  const talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10);
  const skillScaling = skill(e, 2.10, 2.31);
  const skillExtraHitScaling = skill(e, 1.00, 1.10);
  const ultScaling = ult(e, 3.20, 3.456);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'ultBuffedState',
    name: 'ultBuffedState',
    text: 'Ult Buffed state',
    title: 'Ult Buffed state',
    content: `Increases ATK by ${precisionRound(ultBuffedAtk * 100)}% for 2 turn(s) after using Ultimate.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2DmgReductionBuff',
    name: 'e2DmgReductionBuff',
    text: 'E2 Dmg Reduction Buff',
    title: 'E2 Dmg Reduction Buff',
    content: `Reduces DMG taken by 20% for 2 turn(s) after using Ultimate.`,
    disabled: e < 2,
  }, {
    formItem: FormSliderWithPopover,
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: 'Skill Extra Hits',
    title: 'Skill Extra Hits',
    content: `Increases the number of hits of the Skill by ${skillExtraHitScaling} times.`,
    min: 0,
    max: 3,
  }, {
    formItem: FormSliderWithPopover,
    id: 'skillTriggerStacks',
    name: 'skillTriggerStacks',
    text: 'Skill Trigger Stacks',
    title: 'Riposte: A4 Trace',
    content: `Increases DMG by 2.5% per stack. Stacks up to 10 times.`,
    min: 0,
    max: 10,
  }, {
    formItem: FormSliderWithPopover,
    id: 'talentSpdBuffStacks',
    name: 'talentSpdBuffStacks',
    text: 'Talent SPD Buff Stacks',
    title: 'Talent SPD Buff Stacks',
    content: `Increases SPD by ${precisionRound(talentSpdBuffValue * 100)}% per stack. Stacks up to ${talentSpdBuffStacksMax} times.`,
    min: 0,
    max: talentSpdBuffStacksMax,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      ultBuffedState: true,
      e2DmgReductionBuff: true,
      skillExtraHits: 3,
      skillTriggerStacks: 10,
      talentSpdBuffStacks: talentSpdBuffStacksMax,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject);

      // Stats
      x[Stats.BE] += (e >= 4) ? 0.40 : 0
      x[Stats.ATK_P] += (r.ultBuffedState) ? ultBuffedAtk : 0
      x[Stats.SPD_P] += (r.talentSpdBuffStacks) * talentSpdBuffValue

      // Scaling
      // Trace only affects stance damage not skill damage - boost this based on proportion of stance : total skill dmg
      const originalSkillScaling = skillScaling
      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0
      const stanceScalingProportion = stanceSkillScaling / (stanceSkillScaling + originalSkillScaling);

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += originalSkillScaling
      x.SKILL_SCALING += stanceSkillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.SKILL_BOOST += r.skillTriggerStacks * 0.025 * stanceScalingProportion
      x.DMG_RED_MULTI *= (e >= 2 && r.e2DmgReductionBuff) ? (1 - 0.20) : 1

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

export default Sushang;