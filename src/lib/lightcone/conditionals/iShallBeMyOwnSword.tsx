import React from 'react';
import { ConditionalMap, ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSwitchWithPopover } from 'components/optimizerTab/FormConditionalInputs';
import DisplayFormControl from 'components/optimizerForm/character/conditionals/DisplayFormControl';

import { SuperImpositionLevel } from 'types/LightCone';

const IShallBeMyOwnSword = (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24]
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]

  const content: ContentItem[] = [
    {
      id: 'eclipseStacks',
      formItem: FormSwitchWithPopover,
      text: 'Eclipse stacks',
      title: 'Eclipse stacks',
      content: 'The number of Eclipse stacks on the enemy.',
    },
    {
      id: 'maxStackDefPen',
      formItem: FormSwitchWithPopover,
      text: 'Max stack def pen',
      title: 'Max stack def pen',
      content: 'Whether the enemy has 3 stacks of Eclipse.',
    }
  ];

  return {
    getContent: () => content,
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      eclipseStacks: 3,
      maxStackDefPen: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals as ConditionalMap;

      const eclipseStacks = parseInt(r.eclipseStacks as string);

      x['ELEMENTAL_DMG'] += eclipseStacks * sValuesStackDmg[s];
      x['DEF_SHRED'] += (r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0;
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  };
};

IShallBeMyOwnSword.displayName = 'I Shall Be My Own Sword';

export default IShallBeMyOwnSword;