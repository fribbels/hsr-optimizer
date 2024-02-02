import React from 'react';
import { Stats } from 'lib/constants';
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from 'lib/conditionals/constants';
import { basicRev, skillRev, talentRev, ultRev } from 'lib/conditionals/utils';
import { calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';

export default(e: Eidolon) => {
  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 2.00, 2.20)
  const ultScaling = ultRev(e, 2.30, 2.484)
  const fuaScaling = talentRev(e, 1.40, 1.54)
  const dotScaling = 0.30

  const hitMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40), // 0.168
    3: ASHBLAZING_ATK_STACK * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.372
    5: ASHBLAZING_ATK_STACK * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.42
  }

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'targetBurned',
    name: 'targetBurned',
    text: 'Target Burned',
    title: 'Target Burned',
    content: `Increases DMG by ${precisionRound(0.20 * 100)}% against enemies affected by Burn.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'selfCurrentHp80Percent',
    name: 'selfCurrentHp80Percent',
    text: 'Self HP >= 80%',
    title: 'Self HP >= 80%',
    content: `Increases CRIT Rate by 15% when HP is above 80%.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e1TalentSpdBuff',
    name: 'e1TalentSpdBuff',
    text: 'E1 SPD Buff',
    title: 'E1 SPD Buff',
    content: `E1: After "Victory Rush" is triggered, Himeko's SPD increases by 20% for 2 turn(s).`,
    disabled: e < 1,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e6UltExtraHits',
    name: 'e6UltExtraHits',
    text: 'E6 Ult Extra Hits',
    title: 'E6 Ult Extra Hits',
    content: `Ultimate deals DMG 2 extra times. Extra hits do ${precisionRound(0.40 * 100)}% DMG per hit.`,
    min: 0,
    max: 2,
    disabled: e < 6,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      targetBurned: true,
      selfCurrentHp80Percent: true,
      e1TalentSpdBuff: true,
      e6UltExtraHits: 2,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (r.selfCurrentHp80Percent) ? 0.15 : 0
      x[Stats.SPD_P] += (e >= 1 && r.e1TalentSpdBuff) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 6) ? r.e6UltExtraHits * ultScaling * 0.40 : 0
      x.FUA_SCALING += fuaScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.SKILL_BOOST += (r.targetBurned) ? 0.20 : 0
      x.ELEMENTAL_DMG += (e >= 2 && request.enemyHpPercent <= 0.50) ? 0.15 : 0

      return x
    },
    calculateBaseMultis: (c:PrecomputedCharacterConditional, request:Form) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]

      const hitMulti = hitMultiByTargets[request.enemyCount]
      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}
