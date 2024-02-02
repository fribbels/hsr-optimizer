import React from 'react';
import { Stats } from 'lib/constants';
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from 'lib/conditionals/constants';
import { basicRev, skillRev, ultRev } from 'lib/conditionals/utils';
import { calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';


export default (e: Eidolon) => {
  const skillDmgBoostValue = skillRev(e, 0.66, 0.726);
  const ultAtkBoostValue = ultRev(e, 0.55, 0.594);
  const ultCdBoostValue = ultRev(e, 0.16, 0.168);
  const ultCdBoostBaseValue = ultRev(e, 0.20, 0.216);

  const basicScaling = basicRev(e, 1.0, 1.1);
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'techniqueBuff',
    name: 'techniqueBuff',
    text: 'Technique Buff',
    title: 'Technique Buff',
    content: `Increases ATK by ${precisionRound(0.15 * 100)}%.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'battleStartDefBuff',
    name: 'battleStartDefBuff',
    text: 'Battle Start DEF Buff',
    title: 'A4: Battle Start DEF Buff',
    content: `A4: Increases DEF by ${precisionRound(0.20 * 100)}%.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'skillBuff',
    name: 'skillBuff',
    text: 'Skill Buff',
    title: 'Skill Buff',
    content: `Increases DMG by ${precisionRound(skillDmgBoostValue * 100)}% during Skill.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult Buff',
    title: 'Ult Buff',
    content: `Increases ATK by ${precisionRound(ultAtkBoostValue * 100)}% and Crit DMG by ${precisionRound(ultCdBoostValue * 100)}%.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2SkillSpdBuff',
    name: 'e2SkillSpdBuff',
    text: 'E2 Skill SPD Buff',
    title: 'E2 Skill SPD Buff',
    content: `Ally targeted by skill increases SPD by ${precisionRound(0.30 * 100)}%.`,
    disabled: e < 2,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      techniqueBuff: true,
      battleStartDefBuff: true,
      skillBuff: true,
      ultBuff: true,
      e2SkillSpdBuff: false,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.DEF_P] += (r.battleStartDefBuff) ? 0.20 : 0
      x[Stats.SPD_P] += (r.e2SkillSpdBuff) ? 0.30 : 0
      x[Stats.ATK_P] += (r.techniqueBuff) ? 0.15 : 0
      x[Stats.ATK_P] += (r.ultBuff) ? ultAtkBoostValue : 0
      x.BASIC_CR_BOOST += 1.00

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.FUA_SCALING += (e >= 4) ? fuaScaling : 0

      // Boost
      x.ELEMENTAL_DMG += 0.10
      x.ELEMENTAL_DMG += (r.skillBuff) ? skillDmgBoostValue : 0

      return x
    },
    calculateBaseMultis: (c:PrecomputedCharacterConditional, request:Form) => {
      const r = request.characterConditionals
      const x = c['x'];

      // Order matters?
      x[Stats.CD] += (r.ultBuff) ? ultCdBoostValue * x[Stats.CD] : 0
      x[Stats.CD] += (r.ultBuff) ? ultCdBoostBaseValue : 0

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}