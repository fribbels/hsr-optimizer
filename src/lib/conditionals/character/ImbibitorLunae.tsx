import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, skillRev, ultRev, talentRev, precisionRound } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";
import { Form, PrecomputedCharacterConditional } from "types/CharacterConditional";


export default(e: Eidolon) => {
  const righteousHeartStackMax = (e >= 1) ? 10 : 6
  const outroarStackCdValue = skillRev(e, 0.12, 0.132)
  const righteousHeartDmgValue = talentRev(e, 0.10, 0.11)

  const basicScaling = basicRev(e, 1.00, 1.10)
  const basicEnhanced1Scaling = basicRev(e, 2.60, 2.86)
  const basicEnhanced2Scaling = basicRev(e, 3.80, 4.18)
  const basicEnhanced3Scaling = basicRev(e, 5.00, 5.50)
  const skillScaling = skillRev(e, 0, 0)
  const ultScaling = ultRev(e, 3.00, 3.24)

  const content = [{
    formItem: FormSliderWithPopover,
    id: 'basicEnhanced',
    name: 'basicEnhanced',
    text: 'Basic enhanced',
    title: 'Basic enhanced',
    content: `
      Increases DMG by ${precisionRound(basicEnhanced1Scaling * 100)}% at 1 stack, ${precisionRound(basicEnhanced2Scaling * 100)}% at 2 stacks, and ${precisionRound(basicEnhanced3Scaling * 100)}% at 3 stacks.`,
    min: 0,
    max: 3,
  },{
    formItem: FormSliderWithPopover,
    id: 'skillOutroarStacks',
    name: 'skillOutroarStacks',
    text: 'Outroar Stacks',
    title: 'Outroar Stacks',
    content: `Increases DMG by ${precisionRound(outroarStackCdValue * 100)}% per stack.`,
    min: 0,
    max: 4,
  }, {
    formItem: FormSliderWithPopover,
    id: 'talentRighteousHeartStacks',
    name: 'talentRighteousHeartStacks',
    text: 'Righteous Heart Stacks',
    title: 'Righteous Heart Stacks',
    content: `Increases Elemental DMG by ${precisionRound(righteousHeartDmgValue * 100)}% per stack.`,
    disabled: e < 1,
    min: 0,
    max: righteousHeartStackMax,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e6ResPenStacks',
    name: 'e6ResPenStacks',
    text: 'E6 RES PEN Stacks',
    title: 'E6 RES PEN Stacks',
    content: `Decreases target's RES by 20% per stack.`,
    min: 0,
    max: 3,
    disabled: e < 6,
  }];



  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      basicEnhancements: 3,
      skillOutroarStacks: 4,
      talentRighteousHeartStacks: righteousHeartStackMax,
      e6ResPenStacks: 3,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CD] += (request.enemyElementalWeak) ? 0.24 : 0
      x[Stats.CD] += r.skillOutroarStacks * outroarStackCdValue

      // Scaling
      x.BASIC_SCALING += {
        0: basicScaling,
        1: basicEnhanced1Scaling,
        2: basicEnhanced2Scaling,
        3: basicEnhanced3Scaling,
      }[r.basicEnhancements]
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += r.talentRighteousHeartStacks * righteousHeartDmgValue
      x.BASIC_RES_PEN += (e >= 6 && r.basicEnhancements == 3) ? 0.20 * r.e6ResPenStacks : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}