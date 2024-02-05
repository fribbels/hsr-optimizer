import React from 'react';
import { ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import getContentFromLCRanks from '../getContentFromLCRank';
import { SuperImpositionLevel } from 'types/LightCone';
import { LightConeRawRank } from 'types/LightConeConditionals';
import { Stats } from 'lib/constants';

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesFuaDmg = [0.30, 0.35, 0.40, 0.45, 0.50];
  const sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20];
  const lcRank: LightConeRawRank = {
    "id": "23016",
    "skill": "One At A Time",
    "desc": "Increase the wearer's CRIT Rate by #1[i]% and their follow-up attacks' DMG by #2[i]%.",
    "params": [[0.18, 0.3, 0.12, 2], [0.21, 0.35, 0.14, 2], [0.24, 0.4, 0.16, 2], [0.27, 0.45, 0.18, 2], [0.3, 0.5, 0.2, 2]],
    "properties": [[{"type": "CriticalChanceBase", "value": 0.18}], [{"type": "CriticalChanceBase", "value": 0.21}], [{"type": "CriticalChanceBase", "value": 0.24}], [{"type": "CriticalChanceBase", "value": 0.27}], [{"type": "CriticalChanceBase", "value": 0.3}]]
  };
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: `After the wearer uses a follow-up attack, apply the Tame state to the target, stacking up to #4[i] stacks. When allies hit enemy targets under the Tame state, every Tame stack increases the CRIT DMG dealt by #3[i]%.`
  };
  const content: ContentItem[] = [{
    lc: true,
    id: 'targetTameStacks',
    name: 'targetTameStacks',
    formItem: FormSliderWithPopover,
    text: 'Target Tame stacks',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
    min: 0,
    max: 2,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      targetTameStacks: 2,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += r.targetTameStacks * sValuesCd[s];
      x.FUA_BOOST += sValuesFuaDmg[s];
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}