import React from "react"
import { Stats } from "lib/constants"
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, skillRev, ultRev } from "lib/conditionals/utils";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";

const TrailblazerPreservation = (e) => {
  const skillDamageReductionValue = skillRev(e, 0.50, 0.52);

  const basicAtkScaling = basicRev(e, 1.00, 1.10);
  const basicDefScaling = (e >= 1) ? 0.25 : 0
  const basicEnhancedAtkScaling = basicRev(e, 1.35, 1.463);
  const basicEnhancedDefScaling = (e >= 1) ? 0.50 : 0
  const skillScaling = skillRev(e, 0, 0);
  const ultAtkScaling = ultRev(e, 1.00, 1.10);
  const ultDefScaling = ultRev(e, 1.50, 1.65);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'enhancedBasic',
    name: 'enhancedBasic',
    text: 'Enhanced basic',
    title: `Enhanced basic: Increases ATK by ${basicEnhancedAtkScaling * 100}% and DEF by ${basicEnhancedDefScaling * 100}%`,
    content: `Enhances the Basic ATK of all allies, increasing their ATK by ${basicEnhancedAtkScaling * 100}% and DEF by ${basicEnhancedDefScaling * 100}% for 2 turn(s).`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'skillActive',
    name: 'skillActive',
    text: 'Skill active',
    title: `Skill active: Reduces DMG taken by ${skillDamageReductionValue * 100}%`,
    content: `When the Skill is used, reduces all allies' DMG taken by ${skillDamageReductionValue * 100}% for 2 turn(s).`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'shieldActive',
    name: 'shieldActive',
    text: 'Shield active',
    title: 'Shield active: Increases ATK by 15%',
    content: `When the Shield is active, increases all allies' ATK by 15% for 2 turn(s).`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e6DefStacks',
    name: 'e6DefStacks',
    text: 'E6 def stacks',
    title: 'E6 def stacks: Increases DEF by 10%',
    content: `When the E6 DEF Stacks are active, increases all allies' DEF by 10% for 2 turn(s).`,
    min: 0,
    max: 3,
    disabled: e < 6,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      enhancedBasic: true,
      skillActive: true,
      shieldActive: true,
      e6DefStacks: 3,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject);

      // Stats
      x[Stats.DEF_P] += (e >= 6) ? r.e6DefStacks * 0.10 : 0
      x[Stats.ATK_P] += (r.shieldActive) ? 0.15 : 0

      // Scaling
      x.SKILL_SCALING += skillScaling

      // Boost
      x.DMG_RED_MULTI *= (r.skillActive) ? (1 - skillDamageReductionValue) : 1
      x.DMG_RED_MULTI *= (r.skillActive) ? (1 - 0.15) : 1

      return x
    },
    calculateBaseMultis: (c, request) => {
      const r = request.characterConditionals
      const x = c.x

      if (r.enhancedBasic) {
        x.BASIC_DMG += basicEnhancedAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicEnhancedDefScaling * x[Stats.DEF]
      } else {
        x.BASIC_DMG += basicAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicDefScaling * x[Stats.DEF]
      }

      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += ultAtkScaling * x[Stats.ATK]
      x.ULT_DMG += ultDefScaling * x[Stats.DEF]
    }
  }
}

export default TrailblazerPreservation;