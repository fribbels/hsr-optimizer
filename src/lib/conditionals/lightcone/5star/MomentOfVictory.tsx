import React from 'react';
import { ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import getContentFromLCRanks from '../getContentFromLCRank';
import { SuperImpositionLevel } from 'types/LightCone';
import { LightConeRawRank } from 'types/LightConeConditionals';
import { Stats } from 'lib/constants';


export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40];

  const lcRank: LightConeRawRank = {
    "id": "23005",
    "skill": "Verdict",
    "desc": "Increases the chance for the wearer to be attacked by enemies. When the wearer is attacked, increase their DEF by an extra #3[i]% until the end of the wearer's turn.",
    "params": [[2, 0.24, 0.24, 0.24], [2, 0.28, 0.28, 0.28], [2, 0.32, 0.32, 0.32], [2, 0.36, 0.36, 0.36], [2, 0.4, 0.4, 0.4]],
    "properties": [[{"type": "DefenceAddedRatio", "value": 0.24}, {"type": "StatusProbabilityBase", "value": 0.24}], [{"type": "DefenceAddedRatio", "value": 0.28}, {"type": "StatusProbabilityBase", "value": 0.28}], [{"type": "DefenceAddedRatio", "value": 0.32}, {"type": "StatusProbabilityBase", "value": 0.32}], [{"type": "DefenceAddedRatio", "value": 0.36}, {"type": "StatusProbabilityBase", "value": 0.36}], [{"type": "DefenceAddedRatio", "value": 0.4}, {"type": "StatusProbabilityBase", "value": 0.4}]]
  };

  const content: ContentItem[] = [{
    lc: true,
    id: 'selfAttackedDefBuff',
    name: 'selfAttackedDefBuff',
    formItem: FormSwitchWithPopover,
    text: 'Self attacked DEF buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      selfAttackedDefBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.DEF_P] += (r.selfAttackedDefBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}