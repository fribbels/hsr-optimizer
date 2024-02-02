import React from 'react';
import { Stats } from 'lib/constants';
import { baseComputedStatsObject } from 'lib/conditionals/constants';
import { basicRev, skillRev, talentRev, ultRev } from 'lib/conditionals/utils';
import { precisionRound } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';

export default (e: Eidolon) => {
  const talentDebuffDmgIncreaseValue = talentRev(e, 0.07, 0.076);
  const talentDebuffMax = (e >= 6) ? 4 : 3

  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 1.20, 1.32);
  const ultScaling = ultRev(e, 1.20, 1.296);
  const dotScaling = skillRev(e, 2.182, 2.40);

  const content = [{
    formItem: FormSliderWithPopover,
    id: 'talentDebuffStacks',
    name: 'talentDebuffStacks',
    text: 'Talent Debuff Stacks',
    title: 'Talent Debuff Stacks',
    content: `Increases DMG by ${precisionRound(talentDebuffDmgIncreaseValue * 100)}% per stack. Stacks up to ${talentDebuffMax} times.`,
    min: 0,
    max: talentDebuffMax,
  },{
    formItem: FormSwitchWithPopover,
    id: 'enemyBurned',
    name: 'enemyBurned',
    text: 'Enemy Burned',
    title: 'Enemy Burned',
    content: `Increases DMG by ${precisionRound(0.20 * 100)}% against enemies affected by Burn.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2BurnMultiBoost',
    name: 'e2BurnMultiBoost',
    text: 'E2 Burn Multi Boost',
    title: 'E2 Burn Multi Boost',
    content: `Increases Burn DMG by ${precisionRound(0.40 * 100)}%.`,
    disabled: e < 2,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      talentDebuffStacks: talentDebuffMax,
      enemyBurned: true,
      e2BurnMultiBoost: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling
      x.DOT_SCALING += (e >= 2 && r.e2BurnMultiBoost) ? 0.40 : 0


      // Boost
      x.ELEMENTAL_DMG += (r.enemyBurned) ? 0.20 : 0
      x.DMG_TAKEN_MULTI += r.talentDebuffStacks * talentDebuffDmgIncreaseValue

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