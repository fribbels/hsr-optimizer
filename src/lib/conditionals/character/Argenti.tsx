import React from 'react';
import { Stats } from 'lib/constants';
import { baseComputedStatsObject } from 'lib/conditionals/constants';
import { basic, precisionRound, skill, talent, ult } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';


export default (e: Eidolon) => {
  const talentMaxStacks = (e >= 4) ? 12 : 10

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 1.60, 1.728)
  const ultEnhancedScaling = ult(e, 2.80, 3.024)
  const ultEnhancedExtraHitScaling = ult(e, 0.95, 1.026)
  const talentCrStackValue = talent(e, 0.025, 0.028)

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'ultEnhanced',
    name: 'ultEnhanced',
    text: 'Enhanced ult',
    title: 'Enhanced ult',
    content: `Consumes 180 Energy and deals Physical DMG equal to ${precisionRound(ultEnhancedScaling * 100)}% of Argenti's ATK to all enemies,
      and further deals DMG for 6 extra time(s), with each time dealing Physical DMG equal to ${precisionRound(ultEnhancedExtraHitScaling * 100)}% of Argenti's ATK to a random enemy.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'talentStacks',
    name: 'talentStacks',
    text: 'Apotheosis stacks',
    title: 'Apotheosis stacks',
    content: `Increases CR by ${precisionRound(talentCrStackValue * 100)}% per stack, max of ${precisionRound(talentMaxStacks)} stacks.`,
    min: 0,
    max: talentMaxStacks,
  }, {
    formItem: FormSliderWithPopover,
    id: 'ultEnhancedExtraHits',
    name: 'ultEnhancedExtraHits',
    text: 'Enhanced ult extra hits on target',
    title: 'Enhanced ult extra hits on target',
    content: `Enhanced Ult hits a random enemy for ${precisionRound(ultEnhancedExtraHitScaling * 100)}% ATK per hit.`,
    min: 0,
    max: 6,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2UltAtkBuff',
    name: 'e2UltAtkBuff',
    text: 'E2 ult ATK buff',
    title: 'E2 ult ATK buff',
    content: `E2: If the number of enemies on the field equals to 3 or more, increases ATK by ${precisionRound(0.40 * 100)}% for 1 turn.`,
    disabled: e < 2,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      ultEnhanced: true,
      talentStacks: talentMaxStacks,
      ultEnhancedExtraHits: 6,
      e2UltAtkBuff: true
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Skills
      x[Stats.CR] += (r.talentStacks) * talentCrStackValue

      // Traces

      // Eidolons
      x[Stats.CD] += (e >= 1) ? (r.talentStacks) * 0.04 : 0
      x[Stats.ATK_P] += (e >= 2 && r.e2UltAtkBuff) ? 0.40 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += (r.ultEnhanced) ? ultEnhancedScaling : ultScaling
      x.ULT_SCALING += (r.ultEnhancedExtraHits) * ultEnhancedExtraHitScaling

      // BOOST
      x.ULT_BOOST += (request.enemyHpPercent <= 0.5) ? 0.15 : 0
      x.ULT_DEF_PEN += (e >= 6) ? 0.30 : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += 0
    }
  }
}
