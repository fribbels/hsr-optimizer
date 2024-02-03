import React from 'react';
import { ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import getContentFromLCRanks from './getContentFromLCRank';
import { SuperImpositionLevel } from 'types/LightCone';
import { ConditionalLightConeMap, LightConeRawRank } from 'types/LightConeConditionals';



const lcRank: LightConeRawRank = {
  "id": "23014",
  "skill": "With This Evening Jade",
  "desc": "Increases the wearer's CRIT DMG by #1[i]%. When an ally (excluding the wearer) gets attacked or loses HP, the wearer gains 1 stack of Eclipse, up to a max of #2[i] stack(s). Each stack of Eclipse increases the DMG of the wearer's next attack by #3[f1]%. When #2[i] stack(s) are reached, additionally enables that attack to ignore #4[i]% of the enemy's DEF. This effect will be removed after the wearer uses an attack.",
  "params": [[
        0.2, 3, 0.14, 0.12
    ],[
        0.23, 3, 0.165, 0.14
    ],[
        0.26, 3, 0.19, 0.16
    ],[
        0.29, 3, 0.215, 0.18
    ],[
        0.32, 3, 0.24, 0.2
    ]
  ],
  "properties": [[{
      "type": "CriticalDamageBase", "value": 0.2
    }],[{
      "type": "CriticalDamageBase", "value": 0.23
    }],[{
      "type": "CriticalDamageBase", "value": 0.26
    }],[{
      "type": "CriticalDamageBase", "value": 0.29
    }],[{
      "type": "CriticalDamageBase", "value": 0.32
    }]]
};



const IShallBeMyOwnSword = (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24];
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20];

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'eclipseStacks',
      name: 'eclipseStacks',
      formItem: FormSliderWithPopover,
      text: 'Eclipse stacks',
      title: 'Eclipse stacks',
      content: getContentFromLCRanks(s, lcRank),
      min: 0,
      max: 3,
    },
    {
      lc: true,
      id: 'maxStackDefPen',
      name: 'maxStackDefPen',
      formItem: FormSwitchWithPopover,
      text: 'Max stack def pen',
      title: 'Max stack def pen',
      content: 'Whether the enemy has 3 stacks of Eclipse.',
    }
  ];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      eclipseStacks: 3,
      maxStackDefPen: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals as ConditionalLightConeMap;
      x['ELEMENTAL_DMG'] += r.eclipseStacks * sValuesStackDmg[s];
      x['DEF_SHRED'] += (r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0;
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  };
};

IShallBeMyOwnSword.displayName = 'I Shall Be My Own Sword';

export default IShallBeMyOwnSword;