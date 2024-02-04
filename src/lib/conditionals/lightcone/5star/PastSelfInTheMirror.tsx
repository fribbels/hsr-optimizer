import React from 'react';
import { ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import getContentFromLCRanks from '../getContentFromLCRank';
import { SuperImpositionLevel } from 'types/LightCone';
import { LightConeRawRank } from 'types/LightConeConditionals';

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40];

  const lcRank: LightConeRawRank = {
    "id": "23019",
    "skill": "The Plum Fragrance In My Bones",
    "desc": "Increases the wearer's Break Effect by #1[i]%. When the wearer uses their Ultimate, increases all allies' DMG by #2[i]%, lasting for #3[i] turn(s). Should the wearer's Break Effect exceed or equal #4[i]%, 1 Skill Point will be recovered. At the start of each wave, all allies regenerate #5[f1] Energy immediately. Effects of the same type cannot stack.",
    "params": [
      [0.6, 0.24, 3, 1.5, 10],
      [0.7, 0.28, 3, 1.5, 12.5],
      [0.8, 0.32, 3, 1.5, 15],
      [0.9, 0.36, 3, 1.5, 17.5],
      [1, 0.4, 3, 1.5, 20]
    ],
    "properties": [
      [{"type": "BreakDamageAddedRatioBase", "value": 0.6}],
      [{"type": "BreakDamageAddedRatioBase", "value": 0.7}],
      [{"type": "BreakDamageAddedRatioBase", "value": 0.8}],
      [{"type": "BreakDamageAddedRatioBase", "value": 0.9}],
      [{"type": "BreakDamageAddedRatioBase", "value": 1}]
    ]
  };

  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltDmgBuff',
    name: 'postUltDmgBuff',
    formItem: FormSwitchWithPopover,
    text: 'Post Ult DMG Buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      postUltDmgBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.postUltDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
