import React from 'react';
import { Stats } from 'lib/constants';
import { basicRev, skillRev, ultRev, talentRev, precisionRound } from '../utils';
import { baseComputedStatsObject } from '../constants';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';

import { Eidolon } from 'types/Character';
import { Form } from 'types/CharacterConditional';

const Welt = (e: Eidolon) => {
  const skillExtraHitsMax = (e >= 6) ? 3 : 2

  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 0.72, 0.792);
  const skillScalingChance = skillRev(e, 0.75, 0.77);
  const ultScaling = ultRev(e, 1.50, 1.62);
  const talentScaling = talentRev(e, 0.60, 0.66);

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'enemyDmgTakenDebuff',
    name: 'enemyDmgTakenDebuff',
    text: 'Enemy dmg taken debuff',
    title: 'Retribution',
    content: 'When using Ultimate, there is a 100% base chance to increase the DMG received by the targets by 12% for 2 turn(s).',
  }, {
    formItem: FormSwitchWithPopover,
    id: 'enemySlowed',
    name: 'enemySlowed',
    text: 'Enemy slowed',
    title: 'Time Distortion',
    content: `When hitting an enemy that is already Slowed, Welt deals Additional Imaginary DMG equal to ${precisionRound(talentScaling * 100)}% of his ATK to the enemy.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: 'Skill extra hits',
    title: 'Edge of the Void',
    content: `Deals Imaginary DMG equal to ${precisionRound(skillScaling * 100)}% of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to ${precisionRound(skillScaling * 100)}% of Welt's ATK to a random enemy. On hit, there is a ${precisionRound(skillScalingChance * 100)}% base chance to reduce the enemy's SPD by 10% for 2 turn(s).`,
    min: 0,
    max: skillExtraHitsMax,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e1EnhancedState',
    name: 'e1EnhancedState',
    text: 'E1 enhanced state',
    title: 'Legacy of Honor',
    content: "After Welt uses his Ultimate, his abilities are enhanced. The next 2 time(s) he uses his Basic ATK or Skill, deals Additional DMG to the target equal to 50% of his Basic ATK's DMG multiplier or 80% of his Skill's DMG multiplier respectively.",
    disabled: (e < 4)
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      enemySlowed: true,
      enemyDmgTakenDebuff: true,
      skillExtraHits: skillExtraHitsMax,
      e1EnhancedState: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject);

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_SCALING += (r.enemySlowed) ? talentScaling : 0
      x.SKILL_SCALING += (r.enemySlowed) ? talentScaling : 0
      x.ULT_SCALING += (r.enemySlowed) ? talentScaling : 0

      x.BASIC_SCALING += (e >= 1 && r.e1EnhancedState) ? 0.50 * basicScaling : 0
      x.SKILL_SCALING += (e >= 1 && r.e1EnhancedState) ? 0.80 * skillScaling : 0

      x.SKILL_SCALING += r.skillExtraHits * skillScaling

      // Boost
      x.ELEMENTAL_DMG += (request.enemyWeaknessBroken) ? 0.20 : 0
      x.DMG_TAKEN_MULTI += (r.enemyDmgTakenDebuff) ? 0.12 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}
export default Welt;