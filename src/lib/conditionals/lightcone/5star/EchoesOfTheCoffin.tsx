import React from 'react';
import { ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import getContentFromLCRanks from '../getContentFromLCRank';
import { SuperImpositionLevel } from 'types/LightCone';
import { LightConeRawRank } from 'types/LightConeConditionals';
import { Stats } from 'lib/constants';

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [12, 14, 16, 18, 20];

  const lcRank: LightConeRawRank = {
    "id": "23008",
    "skill": "Thorns",
    "desc": "Increases the wearer's ATK by #1[i]%. After the wearer uses an attack, for each different enemy target the wearer hits, regenerates #3[f1] Energy. Each attack can regenerate Energy up to #4[i] time(s) this way. After the wearer uses their Ultimate, all allies gain #2[i] SPD for 1 turn.",
    "params": [[0.24, 12, 3, 3], [0.28, 14, 3.5, 3], [0.32, 16, 4, 3], [0.36, 18, 4.5, 3], [0.4, 20, 5, 3]],
    "properties": [[{"type": "AttackAddedRatio", "value": 0.24}], [{"type": "AttackAddedRatio", "value": 0.28}], [{"type": "AttackAddedRatio", "value": 0.32}], [{"type": "AttackAddedRatio", "value": 0.36}], [{"type": "AttackAddedRatio", "value": 0.4}]]
  };

  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltSpdBuff',
    name: 'postUltSpdBuff',
    formItem: FormSwitchWithPopover,
    text: 'Post Ult SPD Buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      postUltSpdBuff: false,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.SPD] += (r.postUltSpdBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
