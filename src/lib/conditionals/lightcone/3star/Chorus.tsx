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
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12];
  const lcRanks = {
    "id": "20005",
    "skill": "Concerted",
    "desc": "After entering battle, increases the ATK of all allies by #1[i]%. Effects of the same type cannot stack.",
    "params": [
      [
        0.08
      ],
      [
        0.09
      ],
      [
        0.1
      ],
      [
        0.11
      ],
      [
        0.12
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
    id: 'inBattleAtkBuff',
    name: 'inBattleAtkBuff',
    formItem: FormSwitchWithPopover,
    text: 'Initial ATK buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      inBattleAtkBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.inBattleAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}