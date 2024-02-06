import React from "react";
// import { Stats } from 'lib/constants'
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { SuperImpositionLevel } from "types/LightCone";
import { PrecomputedCharacterConditional } from "types/CharacterConditional";
import { Form } from 'types/Form';
import { LightConeConditional } from "types/LightConeConditionals";
import getContentFromLCRanks from "../getContentFromLCRank";


export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.14, 0.16, 0.18, 0.20];
  const lcRanks = {
    "id": "21036",
    "skill": "Solidarity",
    "desc": "After the wearer uses a certain type of ability such as Basic ATK, Skill, or Ultimate, all allies gain Childishness, which increases allies' DMG for the same type of ability as used by the wearer by #1[i]%. Childishness only takes effect for the most recent type of ability the wearer used and cannot be stacked.",
    "params": [
      [
        0.12
      ],
      [
        0.14
      ],
      [
        0.16
      ],
      [
        0.18
      ],
      [
        0.2
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
    id: 'basicDmgBuff',
    name: 'basicDmgBuff',
    formItem: FormSwitchWithPopover,
    text: 'Basic DMG buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  },
  {
    lc: true,
    id: 'skillDmgBuff',
    name: 'skillDmgBuff',
    formItem: FormSwitchWithPopover,
    text: 'Skill DMG buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  },
  {
    lc: true,
    id: 'ultDmgBuff',
    name: 'ultDmgBuff',
    formItem: FormSwitchWithPopover,
    text: 'Ult DMG buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      basicDmgBuff: true,
      skillDmgBuff: true,
      ultDmgBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.BASIC_BOOST += (r.basicDmgBuff) ? sValues[s] : 0
      x.SKILL_BOOST += (r.skillDmgBuff) ? sValues[s] : 0
      x.ULT_BOOST += (r.ultDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}