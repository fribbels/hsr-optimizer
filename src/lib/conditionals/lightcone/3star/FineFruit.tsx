import React from "react";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { LightConeConditional } from "types/LightConeConditionals";
// import { PrecomputedCharacterConditional } from "types/CharacterConditional";
// import { Form } from "types/Form";

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => <DisplayFormControl content={[]} />,
    defaults: () => ({
      name: true,
    }),
    precomputeEffects: (/* x: PrecomputedCharacterConditional, request: Form */) => {  },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}