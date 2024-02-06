import React from 'react';
import { Stats } from 'lib/constants';
import { baseComputedStatsObject } from 'lib/conditionals/constants';
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';

import { Eidolon } from 'types/Character'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { Form } from 'types/Form';

export default (e: Eidolon) => {
  const ultSpdBuffValue = ultRev(e, 0.20, 0.21)
  const ultAtkBuffValue = ultRev(e, 0.60, 0.648)
  let talentDmgBoostValue = talentRev(e, 0.30, 0.33)

  talentDmgBoostValue += (e >= 6) ? 0.10 : 0

  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 2.40, 2.64)
  const ultScaling = ultRev(e, 0, 0)

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult buff active',
    title: 'Ult buff active',
    content: `Increases the SPD of a target ally by ${precisionRound(ultSpdBuffValue * 100)}% of Hanya's SPD and increases the same target ally's ATK by ${precisionRound(ultAtkBuffValue * 100)}%.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'targetBurdenActive',
    name: 'targetBurdenActive',
    text: 'Target Burden debuff',
    title: 'Target Burden debuff',
    content: `When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by ${precisionRound(talentDmgBoostValue * 100)}% for 2 turn(s).`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'burdenAtkBuff',
    name: 'burdenAtkBuff',
    text: 'Burden ATK buff',
    title: 'Burden ATK buff',
    content: `Allies triggering Burden's Skill Point recovery effect have their ATK increased by ${precisionRound(0.10 * 100)}% for 1 turn.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2SkillSpdBuff',
    name: 'e2SkillSpdBuff',
    text: 'E2 skill SPD buff',
    title: 'E2 skill SPD buff',
    content: `E2: After Skill, increases SPD by ${precisionRound(0.20 * 100)}% for 1 turn.`,
    disabled: e < 2,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      ultBuff: true,
      targetBurdenActive: true,
      burdenAtkBuff: true,
      skillSpdBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x[Stats.ATK_P] += (r.ultBuff) ? ultAtkBuffValue : 0
      x[Stats.ATK_P] += (r.burdenAtkBuff) ? 0.10 : 0
      x[Stats.SPD_P] += (e >= 2 && r.e2SkillSpdBuff) ? 0.20 : 0

      // Boost
      x.ALL_DMG_MULTI = (r.targetBurdenActive) ? talentDmgBoostValue : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x'];

      x[Stats.SPD] += (r.ultBuff) ? ultSpdBuffValue * x[Stats.SPD] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}
