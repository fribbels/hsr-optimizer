import React from 'react';
import { Stats } from 'lib/constants';
import { baseComputedStatsObject } from 'lib/conditionals/constants';
import { basicRev, skillRev, ultRev } from 'lib/conditionals/utils';
import { precisionRound } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';

export default (e: Eidolon) => {
  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 2.00, 2.20);
  let ultStackScaling = ultRev(e, 0.60, 0.65);
  ultStackScaling += (e >= 4 ? 0.06 : 0);

  const content = [{
    formItem: FormSliderWithPopover,
    id: 'ultHitsOnTarget',
    name: 'ultHitsOnTarget',
    text: 'Ult Hits on Target',
    title: 'Ult Hits on Target',
    content: `Increases DMG by ${precisionRound(ultStackScaling * 100)}% per hit.`,
    min: 1,
    max: 10,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'enemyFrozen',
    name: 'enemyFrozen',
    text: 'Enemy Frozen',
    title: 'Enemy Frozen',
    content: `A6: Frozen enemies take 30% more Crit DMG.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2DefReduction',
    name: 'e2DefReduction',
    text: 'E2 DEF Reduction',
    title: 'E2 DEF Reduction',
    content: `E2: Decreases enemies' DEF by 16% for 3 turns.`,
    disabled: e < 2,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e6UltDmgBoost',
    name: 'e6UltDmgBoost',
    text: 'E6 Ult DMG Boost',
    title: 'E6 Ult DMG Boost',
    content: `Increases DMG by 30% when using Ultimate until end of turn.`,
    disabled: e < 6,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      ultHitsOnTarget: 10,
      enemyFrozen: true,
      e2DefReduction: true,
      e6UltDmgBoost: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject);

      x[Stats.CD] += (r.enemyFrozen) ? 0.30 : 0

      x.DEF_SHRED += (e >= 2 && r.e2DefReduction) ? 0.16 : 0
      x.ELEMENTAL_DMG += (e >= 6 && r.e6UltDmgBoost) ? 0.30 : 0

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultStackScaling * (r.ultHitsOnTarget);

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}


