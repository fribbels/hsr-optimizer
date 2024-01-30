import React from 'react';
import { Stats } from 'lib/constants';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from '../constants';
import { calculateAshblazingSet, ultRev, basicRev, skillRev, talentRev } from '../utils';
import { Eidolon } from 'types/Character';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';

const Yanqing = (e: Eidolon) => {
  const ultCdBuffValue = ultRev(e, 0.50, 0.54);
  const talentCdBuffValue = ultRev(e, 0.30, 0.33);
  const talentCrBuffValue = ultRev(e, 0.20, 0.21);

  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 2.20, 2.42);
  const ultScaling = ultRev(e, 3.50, 3.78);
  const fuaScaling = talentRev(e, 0.50, 0.55);

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'ultBuffActive',
    name: 'ultBuffActive',
    text: 'Ult buff active',
    title: 'Ult buff active',
    content: `Increases CRIT Rate by ${Math.round(ultCdBuffValue * 100)}%`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'soulsteelBuffActive',
    name: 'soulsteelBuffActive',
    text: 'Soulsteel buff active',
    title: 'Soulsteel buff active',
    content: `Increases CRIT DMG by ${Math.round(talentCrBuffValue * 100)}% and CRIT Rate by ${Math.round(talentCdBuffValue * 100)}%`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'critSpdBuff',
    name: 'critSpdBuff',
    text: 'Crit spd buff',
    title: 'Crit spd buff',
    content: 'Increases SPD by 10%',
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e1TargetFrozen',
    name: 'e1TargetFrozen',
    text: 'E1 target frozen',
    title: 'E1 target frozen',
    content: 'Increases ATK by 60%',
    disabled: (e < 1)
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e4CurrentHp80',
    name: 'e4CurrentHp80',
    text: 'E4 self HP >= 80%',
    title: 'E4 self HP >= 80%',
    content: 'Increases RES Pen by 12%',
    disabled: (e < 4)
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      ultBuffActive: true,
      soulsteelBuffActive: true,
      critSpdBuff: true,
      e1TargetFrozen: true,
      e4CurrentHp80: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject);

      // Stats
      x[Stats.CR] += (r.ultBuffActive) ? 0.60 : 0
      x[Stats.CD] += (r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0
      x[Stats.CR] += (r.soulsteelBuffActive) ? talentCrBuffValue : 0
      x[Stats.CD] += (r.soulsteelBuffActive) ? talentCdBuffValue : 0
      x[Stats.RES] += (r.soulsteelBuffActive) ? 0.20 : 0
      x[Stats.SPD_P] += (r.critSpdBuff) ? 0.10 : 0
      x[Stats.ERR] += (e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.BASIC_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.SKILL_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.ULT_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.FUA_SCALING += (request.enemyElementalWeak) ? 0.30 : 0

      x.BASIC_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.SKILL_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.ULT_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.FUA_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0

      // Boost
      x.RES_PEN += (e >= 4 && r.e4CurrentHp80) ? 0.12 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti);
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti);
    }
  }
}

export default Yanqing;