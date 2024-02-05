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
    "id": "23002",
    "skill": "Kinship",
    "desc": "When the wearer defeats an enemy or is hit, immediately restores HP equal to #2[i]% of the wearer's ATK. At the same time, the wearer's DMG is increased by #3[i]% until the end of their next turn. This effect cannot stack and can only trigger 1 time per turn.",
    "params": [[0.24, 0.08, 0.24], [0.28, 0.09, 0.28], [0.32, 0.1, 0.32], [0.36, 0.11, 0.36], [0.4, 0.12, 0.4]],
    "properties": [[{"type": "AttackAddedRatio", "value": 0.24}], [{"type": "AttackAddedRatio", "value": 0.28}], [{"type": "AttackAddedRatio", "value": 0.32}], [{"type": "AttackAddedRatio", "value": 0.36}], [{"type": "AttackAddedRatio", "value": 0.4}]]
  };

  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBuff',
    name: 'dmgBuff',
    formItem: FormSwitchWithPopover,
    text: 'Enemy defeated or self hit DMG buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0;
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}