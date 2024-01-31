import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, skillRev, ultRev, precisionRound } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";

import { Eidolon } from "types/Character";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

export default function luka(e: Eidolon) {
  const basicEnhancedHitValue = basicRev(e, 0.20, 0.22);
  const targetUltDebuffDmgTakenValue = ultRev(e, 0.20, 0.216);

  const basicScaling = basicRev(e, 1.00, 1.10);
  const basicEnhancedScaling = basicRev(e, 0.20 * 3 + 0.80, 0.22 * 3 + 0.88);
  const skillScaling = skillRev(e, 1.20, 1.32);
  const ultScaling = ultRev(e, 3.30, 3.564);
  const dotScaling = skillRev(e, 3.38, 3.718);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'basicEnhanced',
    name: 'basicEnhanced',
    text: 'Basic Enhanced',
    title: 'Basic Enhanced: Sky-Shatter Fist',
    content: `Increases DMG by ${precisionRound(basicEnhancedHitValue * 100)}%.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'targetUltDebuffed',
    name: 'targetUltDebuffed',
    text: 'Target Ult Debuffed',
    title: 'Target Ult Debuffed',
    content: `Increases DMG taken by ${precisionRound(targetUltDebuffDmgTakenValue * 100)}% against enemies affected by Ultimate.`,
  }, {
    FormItem: FormSliderWithPopover,
    id: 'basicEnhancedExtraHits',
    name: 'basicEnhancedExtraHits',
    text: 'Basic Enhanced Extra Hits',
    title: 'Basic Enhanced Extra Hits',
    content: `Increases the number of hits of Basic Enhanced.`,
    min: 0,
    max: 3,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e1TargetBleeding',
    name: 'e1TargetBleeding',
    text: 'E1 Target Bleeding',
    title: 'E1 Target Bleeding',
    content: `Increases Elemental DMG by 15% against enemies affected by Bleeding.`,
    disabled: e < 1,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e4TalentStacks',
    name: 'e4TalentStacks',
    text: 'E4 talent stacks',
    title: 'E4 talent stacks',
    content: `Increases ATK by 5% per stack.`,
    min: 0,
    max: 4,
    disabled: e < 4,
  }];
  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      basicEnhanced: true,
      targetUltDebuffed: true,
      e1TargetBleeding: true,
      basicEnhancedExtraHits: 3,
      e4TalentStacks: 4,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (e >= 4) ? r.e4TalentStacks * 0.05 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.BASIC_SCALING += (r.basicEnhanced && r.basicEnhancedExtraHits) * basicEnhancedHitValue
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.DMG_TAKEN_MULTI += (r.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0
      x.ELEMENTAL_DMG += (e >= 1 && r.e1TargetBleeding) ? 0.15 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}