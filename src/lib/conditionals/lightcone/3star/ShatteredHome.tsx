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
    "id": "20009",
    "skill": "Eradication",
    "desc": "The wearer deals #2[i]% more DMG to enemy targets whose HP percentage is greater than #1[i]%.",
    "params": [
      [
        0.5,
        0.2
      ],
      [
        0.5,
        0.25
      ],
      [
        0.5,
        0.3
      ],
      [
        0.5,
        0.35
      ],
      [
        0.5,
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
    id: 'enemyHp50Buff',
    name: 'enemyHp50Buff',
    formItem: FormSwitchWithPopover,
    text: 'Enemy HP > 50% DMG buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      enemyHp50Buff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyHp50Buff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}