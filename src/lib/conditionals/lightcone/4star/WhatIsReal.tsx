import React from "react";
// import { Stats } from 'lib/constants'
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { LightConeConditional } from "types/LightConeConditionals";

export default (/* s: SuperImpositionLevel */): LightConeConditional => {
  // const sValues = [0, 0, 0, 0, 0];

  return {
    display: () => <DisplayFormControl content={[]} />,
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
