import React from 'react';
import { ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import getContentFromLCRanks from '../getContentFromLCRank';
import { SuperImpositionLevel } from 'types/LightCone';
import { LightConeRawRank } from 'types/LightConeConditionals';
import { Stats } from 'lib/constants';

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCr = [0.08, 0.10, 0.12, 0.14, 0.16];
  const sValuesAtk = [0.20, 0.25, 0.30, 0.35, 0.40];

  const lcRank: LightConeRawRank = {
    "id": "24001",
    "skill": "Chase",
    "desc": "Increases the wearer's CRIT rate by #1[i]%, and increases their CRIT rate against enemies with HP less than or equal to #2[i]% by an extra #3[i]%.",
    "params": [[0.08, 0.5, 0.08, 0.2, 2], [0.1, 0.5, 0.1, 0.25, 2], [0.12, 0.5, 0.12, 0.3, 2], [0.14, 0.5, 0.14, 0.35, 2], [0.16, 0.5, 0.16, 0.4, 2]],
    "properties": [[{"type": "CriticalChanceBase", "value": 0.08}], [{"type": "CriticalChanceBase", "value": 0.1}], [{"type": "CriticalChanceBase", "value": 0.12}], [{"type": "CriticalChanceBase", "value": 0.14}], [{"type": "CriticalChanceBase", "value": 0.16}]]
  };
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: 'When the wearer defeats an enemy, their ATK is increased by #4[i]% for #5[i] turn(s).'
  };

  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHp50CrBoost',
    name: 'enemyHp50CrBoost',
    formItem: FormSwitchWithPopover,
    text: 'Enemy HP <= 50% CR Boost',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }, {
    lc: true,
    id: 'enemyDefeatedAtkBuff',
    name: 'enemyDefeatedAtkBuff',
    formItem: FormSwitchWithPopover,
    text: 'Enemy Defeated ATK Buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
  }];


  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      enemyHp50CrBoost: true,
      enemyDefeatedAtkBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.enemyHp50CrBoost && request.enemyHpPercent <= 0.50) ? sValuesCr[s] : 0
      x[Stats.ATK_P] += (r.enemyDefeatedAtkBuff) ? sValuesAtk[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}