import React from 'react';
import { ContentItem, Form, LightConeConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import getContentFromLCRanks from '../getContentFromLCRank';
import { SuperImpositionLevel } from 'types/LightCone';
import { LightConeRawRank } from 'types/LightConeConditionals';
import { Stats } from 'lib/constants';

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesErr = [0.10, 0.12, 0.14, 0.16, 0.18];
  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50];

  const lcRank: LightConeRawRank = {
    "id": "23003",
    "skill": "Heir",
    "desc": "Increases the wearer's Energy Regeneration Rate by #1[i]% and regenerates 1 Skill Point when the wearer uses their Ultimate on an ally. This effect can be triggered once after every 2 uses of the wearer's Ultimate. When the wearer uses their Skill, the next ally taking action (except the wearer) deals #2[i]% more DMG for #3[i] turn(s).",
    "params": [[0.1, 0.3, 1], [0.12, 0.35, 1], [0.14, 0.4, 1], [0.16, 0.45, 1], [0.18, 0.5, 1]],
    "properties": [[{"type": "SPRatioBase", "value": 0.1}], [{"type": "SPRatioBase", "value": 0.12}], [{"type": "SPRatioBase", "value": 0.14}], [{"type": "SPRatioBase", "value": 0.16}], [{"type": "SPRatioBase", "value": 0.18}]]
  };

  const content: ContentItem[] = [{
    lc: true,
    id: 'postSkillDmgBuff',
    name: 'postSkillDmgBuff',
    formItem: FormSwitchWithPopover,
    text: 'Post Skill DMG Buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      postSkillDmgBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals;

      x[Stats.ERR] += sValuesErr[s]
      x.ELEMENTAL_DMG += (r.postSkillDmgBuff) ? sValuesDmg[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
