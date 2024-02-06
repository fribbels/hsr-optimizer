import React from "react";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { SuperImpositionLevel } from "types/LightCone";
import { PrecomputedCharacterConditional } from "types/CharacterConditional";
import { Form } from 'types/Form';
import { LightConeConditional } from "types/LightConeConditionals";
import getContentFromLCRanks from "../getContentFromLCRank";

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16];
  const lcRanks = {
    "id": "21023",
    "skill": "Teary-Eyed",
    "desc": "At the start of the battle, the DMG dealt to all allies decreases by #2[i]% for #3[i] turn(s). At the same time, immediately restores HP to all allies equal to #1[i]% of the respective HP difference between the characters' Max HP and current HP.",
    "params": [[0.3, 0.08, 5], [0.35, 0.1, 5], [0.4, 0.12, 5], [0.45, 0.14, 5], [0.5, 0.16, 5]],
    "properties": [[], [], [], [], []]
  };
  const content = [{
    lc: true,
    id: 'initialDmgReductionBuff',
    name: 'initialDmgReductionBuff',
    formItem: FormSwitchWithPopover,
    text: 'Initial DMG reduction buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      initialDmgReductionBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.DMG_RED_MULTI *= (r.initialDmgReductionBuff) ? (1 - sValues[s]) : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}