import React from 'react';
import { ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import getContentFromLCRanks from '../getContentFromLCRank';
import { SuperImpositionLevel } from 'types/LightCone';
import { LightConeRawRank } from 'types/LightConeConditionals';
import { Stats } from 'lib/constants';


export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40];
  const sValuesSpd = [0.048, 0.056, 0.064, 0.072, 0.08];

  const lcRank: LightConeRawRank = {
    "id": "23006",
    "skill": "Spider Web",
    "desc": "Increases DMG dealt by the wearer by #2[i]%.",
    "params": [[0.6, 0.24, 0.048, 3, 1], [0.7, 0.28, 0.056, 3, 1], [0.8, 0.32, 0.064, 3, 1], [0.9, 0.36, 0.072, 3, 1], [1, 0.4, 0.08, 3, 1]],
    "properties": [[{"type": "AllDamageTypeAddedRatio", "value": 0.24}], [{"type": "AllDamageTypeAddedRatio", "value": 0.28}], [{"type": "AllDamageTypeAddedRatio", "value": 0.32}], [{"type": "AllDamageTypeAddedRatio", "value": 0.36}], [{"type": "AllDamageTypeAddedRatio", "value": 0.4}]]
  };
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: `After every attack launched by wearer, their SPD increases by #3[f1]%, stacking up to #4[i] times.`,
  };
  const lcRank3: LightConeRawRank = {
    ...lcRank,
    desc: `If the wearer hits an enemy target that is not afflicted by Erode, there is a 100% base chance to inflict Erode to the target. Enemies afflicted with Erode are also considered to be Shocked and will receive Lightning DoT at the start of each turn equal to #1[i]% of the wearer's ATK, lasting for #5[i] turn(s).`
  };

  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBoost',
    name: 'dmgBoost',
    formItem: FormSwitchWithPopover,
    text: 'DMD Boost',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }, {
    lc: true,
    id: 'spdStacks',
    name: 'spdStacks',
    formItem: FormSliderWithPopover,
    text: 'SPD Stacks',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
    min: 0,
    max: 3,
  }, {
    lc: true,
    id: 'dotEffect',
    name: 'dotEffect',
    formItem: FormSwitchWithPopover,
    text: 'DoT Effect (not implemented)',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank3),
  }];


  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      dmgBoost: true,
      spdStacks: 0,
      dotEffect: false
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals;

      x[Stats.SPD_P] += r.spdStacks * sValuesSpd[s]
      x.ELEMENTAL_DMG += (r.dmgBoost) ? sValuesDmg[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
