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
  const sValues = [12, 14, 16, 18, 20];
  const lcRanks = {
    "id": "20019",
    "skill": "Family",
    "desc": "Upon entering battle, increases SPD of all allies by #1[i] points for #2[i] turn(s).",
    "params": [[12, 1], [14, 1], [16, 1], [18, 1], [20, 1]],
    "properties": [[], [], [], [], []]
  };
  const content = [{
    lc: true,
    id: 'initialSpdBuff',
    name: 'initialSpdBuff',
    formItem: FormSwitchWithPopover,
    text: 'Initial SPD buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      initialSpdBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.SPD] += (r.initialSpdBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}