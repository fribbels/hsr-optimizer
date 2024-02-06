import React from "react";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { SuperImpositionLevel } from "types/LightCone";
import { PrecomputedCharacterConditional } from "types/CharacterConditional";
import { Form } from 'types/Form';
import { LightConeConditional } from "types/LightConeConditionals";
import getContentFromLCRanks from "../getContentFromLCRank";

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24];
  const lcRanks = {
    "id": "21011",
    "skill": "Departure",
    "desc": "After entering battle, if an ally deals the same DMG Type as the wearer, DMG dealt increases by #1[i]%.",
    "params": [[0.12], [0.15], [0.18], [0.21], [0.24]],
    "properties": [[], [], [], [], []]
  };
  const content = [{
    lc: true,
    id: 'alliesSameElement',
    name: 'alliesSameElement',
    formItem: FormSwitchWithPopover,
    text: 'Same element ally DMG boost',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      alliesSameElement: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
