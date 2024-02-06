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
    "id": "21012",
    "skill": "Spare No Effort",
    "desc": "The wearer also deals an extra #2[i]% of DMG to enemies whose current HP percentage is equal to or higher than the wearer's current HP percentage.",
    "params": [[0.2, 0.2], [0.25, 0.25], [0.3, 0.3], [0.35, 0.35], [0.4, 0.4]],
    "properties": [[{"type": "AllDamageTypeAddedRatio", "value": 0.2}], [{"type": "AllDamageTypeAddedRatio", "value": 0.25}], [{"type": "AllDamageTypeAddedRatio", "value": 0.3}], [{"type": "AllDamageTypeAddedRatio", "value": 0.35}], [{"type": "AllDamageTypeAddedRatio", "value": 0.4}]]
  };
  const content = [{
    lc: true,
    id: 'enemyHpHigherDmgBoost',
    name: 'enemyHpHigherDmgBoost',
    formItem: FormSwitchWithPopover,
    text: 'Enemy HP % higher DMG boost',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      enemyHpHigherDmgBoost: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += sValues[s]
      x.ELEMENTAL_DMG += (r.enemyHpHigherDmgBoost) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
