import React from 'react';
import { Stats } from 'lib/constants';
import { baseComputedStatsObject } from 'lib/conditionals/constants';
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { Form } from 'types/Form';

export default (e: Eidolon) => {
  const skillCrBuffValue = skillRev(e, 0.12, 0.132);
  const skillHpBuffValue = skillRev(e, 0.06, 0.066);
  const talentDmgReductionValue = talentRev(e, 0.18, 0.196);

  const basicScaling = basicRev(e, 0.50, 0.55);
  const skillScaling = skillRev(e, 0, 0);
  const ultScaling = ultRev(e, 1.00, 1.08);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'skillActive',
    name: 'skillActive',
    text: 'Skill active',
    title: 'Skill active',
    content: `While affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by ${precisionRound(skillHpBuffValue * 100)}% of Fu Xuan's Max HP, and increases CRIT Rate by ${precisionRound(skillCrBuffValue * 100)}%.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e6TeamHpLostPercent',
    name: 'e6TeamHpLostPercent',
    text: 'E6 team HP lost',
    title: 'E6 team HP lost',
    content: `E6: Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. Fu Xuan's Ultimate DMG will increase by 200% of this tally of HP loss. This tally is also capped at 120% of Fu Xuan's Max HP.`,
    min: 0,
    max: 1.2,
    percent: true,
    disabled: e < 6,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      skillActive: true,
      e6TeamHpLostPercent: 1.2,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CD] += (e >= 1) ? 0.30 : 0
      x[Stats.CR] += (r.skillActive) ? skillCrBuffValue : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.DMG_RED_MULTI *= (1 - talentDmgReductionValue)

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x'];

      x[Stats.HP] += (r.skillActive) ? skillHpBuffValue * x[Stats.HP] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.HP]
      x.ULT_DMG += (e >= 6) ? 2.00 * r.e6TeamHpLostPercent * x[Stats.HP] : 0
    }
  }
}