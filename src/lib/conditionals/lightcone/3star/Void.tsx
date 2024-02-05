import React from "react";
import { Stats } from 'lib/constants'
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { SuperImpositionLevel } from "types/LightCone";
import { PrecomputedCharacterConditional } from "types/CharacterConditional";
import { Form } from 'types/Form';
import { LightConeConditional } from "types/LightConeConditionals";
import getContentFromLCRanks from "../getContentFromLCRank";



export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.20, 0.25, 0, 30, 0.35, 0.40];
  const lcRanks = {
    "id": "20004",
    "skill": "Fallen",
    "desc": "At the start of the battle, the wearer's Effect Hit Rate increases by #1[i]% for #2[i] turn(s).",
    "params": [
      [
        0.2,
        3
      ],
      [
        0.25,
        3
      ],
      [
        0.3,
        3
      ],
      [
        0.35,
        3
      ],
      [
        0.4,
        3
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
    id: 'initialEhrBuff',
    name: 'initialEhrBuff',
    formItem: FormSwitchWithPopover,
    text: 'Initial EHR buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      initialEhrBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.EHR] += (r.initialEhrBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}