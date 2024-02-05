import React from "react";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { SuperImpositionLevel } from "types/LightCone";
import { PrecomputedCharacterConditional } from "types/CharacterConditional";
import { Form } from 'types/Form';
import { LightConeConditional } from "types/LightConeConditionals";
import getContentFromLCRanks from "../getContentFromLCRank";



export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40];
  const lcRanks = {
    "id": "20002",
    "skill": "Havoc",
    "desc": "Increases the wearer's Basic ATK and Skill DMG by #1[i]%.",
    "params": [
      [
        0.2
      ],
      [
        0.25
      ],
      [
        0.3
      ],
      [
        0.35
      ],
      [
        0.4
      ]
    ],
    "properties": [
      [],
      [],
      [],
      [],
      []
    ]
  };
  const content = [{
    lc: true,
    id: 'basicSkillDmgBuff',
    name: 'basicSkillDmgBuff',
    formItem: FormSwitchWithPopover,
    text: 'Basic/Skill DMG buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      basicSkillDmgBuff: true
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.BASIC_BOOST += (r.basicSkillDmgBuff) ? sValues[s] : 0
      x.SKILL_BOOST += (r.basicSkillDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}