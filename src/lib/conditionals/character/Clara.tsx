import React from 'react';
import { Stats } from 'lib/constants';
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from 'lib/conditionals/constants';
import { basic, skill, talent, ult } from 'lib/conditionals/utils';
import { calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';

export default (e: Eidolon) => {
  const ultDmgReductionValue = ult(e, 0.25, 0.27)
  const ultFuaExtraScaling = ult(e, 1.60, 1.728)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const fuaScaling = talent(e, 1.60, 1.76)

  const hitMultiByTargetsBlast = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1) // Clara is 1 hit blast when enhanced
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult Buff',
    title: 'Ult Buff',
    content: `Increases Svarog Counter DMG by ${precisionRound(ultFuaExtraScaling * 100)}% during Ultimate.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'talentEnemyMarked',
    name: 'talentEnemyMarked',
    text: 'Enemy Marked',
    title: 'Enemy Marked',
    content: `Additionally deals Physical DMG equal to ${precisionRound(skillScaling * 100)}% of Clara's ATK to enemies marked by Svarog with a Mark of Counter.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2UltAtkBuff',
    name: 'e2UltAtkBuff',
    text: 'E2 Ult ATK Buff',
    title: 'E2 Ult ATK Buff',
    content: `After Ult, increases ATK by ${precisionRound(0.30 * 100)}% for 2 turns.`,
    disabled: e < 2,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e4DmgReductionBuff',
    name: 'e4DmgReductionBuff',
    text: 'E4 DMG Reduction Buff',
    title: 'E4 DMG Reduction Buff',
    content: `Decreases DMG taken by ${precisionRound(0.30 * 100)}%.`,
    disabled: e < 4,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      ultBuff: true,
      talentEnemyMarked: true,
      e2UltAtkBuff: true,
      e4DmgReductionBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (e >= 2 && r.e2UltAtkBuff) ? 0.30 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      // TODO: check if this is correct
      x.SKILL_SCALING += skillScaling + skillScaling*r.talentEnemyMarked;
      // x.SKILL_SCALING += skillScaling
      // x.SKILL_SCALING += r.talentEnemyMarked ? skillScaling : 0

      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += r.ultBuff ? ultFuaExtraScaling : 0

      // Boost
      x.DMG_RED_MULTI *= (1 - 0.10)
      x.DMG_RED_MULTI *= r.ultBuff ? (1 - ultDmgReductionValue) : 1
      x.DMG_RED_MULTI *= (e >= 4 && r.e4DmgReductionBuff) ? (1 - 0.30) : 1
      x.FUA_BOOST += 0.30

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]

      // Calc ashblazing: ult buff -> blast, unbuffed -> single
      if (r.ultBuff) {
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMultiByTargetsBlast[request.enemyCount])
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      } else {
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMultiSingle)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      }
    }
  }
}
