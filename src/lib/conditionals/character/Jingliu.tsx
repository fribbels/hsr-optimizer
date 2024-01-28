import React from 'react';
import { Stats } from 'lib/constants';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { basic, skill, talent, ult } from "lib/conditionals/utils";
import { baseComputedStatsObject } from 'lib/conditionals/constants';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { Eidolon } from 'types/Character';
import { Unknown } from 'types/Common';
import { CharacterConditional, ConditionalMap, ContentItem, Form } from 'types/CharacterConditional';


const Jingliu = (e: Eidolon): CharacterConditional => {
  const talentCrBuff = talent(e, 0.50, 0.52);
  let talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98);
  talentHpDrainAtkBuffMax += (e >= 4) ? 0.30 : 0;
  const basicScaling = basic(e, 1.00, 1.10);
  const skillScaling = skill(e, 2.00, 2.20);
  const skillEnhancedScaling = skill(e, 2.50, 2.75);
  const ultScaling = ult(e, 3.00, 3.24);

  const content: ContentItem[] = [
    {
      id: 'talentEnhancedState',
      formItem: FormSwitchWithPopover,
      text: 'Enhanced state',
      title: 'Crescent Transmigration',
      content: "When Jingliu has 2 stack(s) of Syzygy, she enters the Spectral Transmigration state with her Action Advanced by 100% and her CRIT Rate increases by 50%. Then, Jingliu's Skill Transcendent Flash becomes enhanced and turns into Moon On Glacial River, and becomes the only ability she can use in battle.",
    },
    {
      id: 'talentHpDrainAtkBuff',
      formItem: FormSwitchWithPopover,
      text: 'HP drain ATK buff',
      title: 'Crescent Transmigration - ATK Bonus',
      content: "When Jingliu uses an attack in the Spectral Transmigration state, she consumes HP from all other allies equal to 4% of their respective Max HP (this cannot reduce allies' HP to lower than 1%. Jingliu's ATK increases by 540% of the total HP consumed from all allies in this attack, capped at 180% of her base ATK, lasting until the current attack ends. Jingliu cannot enter the Spectral Transmigration state again until the current Spectral Transmigration state ends. Syzygy can stack up to 3 times. When Syzygy stacks become 0, Jingliu will exit the Spectral Transmigration state.",
      min: 0,
      max: talentHpDrainAtkBuffMax,
      percent: true,
    },
    {
      id: 'e1CdBuff',
      formItem: FormSwitchWithPopover,
      text: 'E1 ult active',
      title: 'Moon Crashes Tianguan Gate',
      content: "When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by 24% for 1 turn(s). If only one enemy target is attacked, the target will additionally be dealt Ice DMG equal to 100% of Jingliu's ATK.",
      disabled: e < 1,
    },
    {
      id: 'e2SkillDmgBuff',
      formItem: FormSwitchWithPopover,
      text: 'E2 skill buff',
      title: 'Crescent Shadows Qixing Dipper',
      content: "After using Ultimate, increases the DMG of the next Enhanced Skill by 80%.",
      disabled: e < 2,
    },
  ];
  
  
  return {
    display: () => <DisplayFormControl eidolon={e} content={content} />,
    defaults: () => ({
      talentEnhancedState: true,
      talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
      e1CdBuff: true,
      e2SkillDmgBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r: ConditionalMap = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Skills
      x[Stats.CR] += (r.talentEnhancedState) ? talentCrBuff : 0
      x[Stats.ATK_P] += ((r.talentEnhancedState) ? r.talentHpDrainAtkBuff : 0) as number;

      // Traces
      x[Stats.RES] += (r.talentEnhancedState) ? 0.35 : 0
      x.ULT_BOOST += (r.talentEnhancedState) ? 0.20 : 0

      // Eidolons
      x[Stats.CD] += (e >= 1 && r.e1CdBuff) ? 0.24 : 0
      x[Stats.CD] += (e >= 6 && r.talentEnhancedState) ? 0.50 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      x.SKILL_SCALING += (r.talentEnhancedState) ? skillEnhancedScaling : skillScaling
      x.SKILL_SCALING += (e >= 1 && r.talentEnhancedState && request.enemyCount == 1) ? 1 : 0

      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 1 && request.enemyCount == 1) ? 1 : 0

      x.FUA_SCALING += 0

      // BOOST
      x.SKILL_BOOST += (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0

      return x
    },
    calculateBaseMultis: (c: Unknown) => {
      const x = c['x']

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += 0
    }
  }
};
Jingliu.label = 'Jingliu';

export default Jingliu;