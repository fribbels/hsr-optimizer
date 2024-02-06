import React from "react";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { SuperImpositionLevel } from "types/LightCone";

export default (s: SuperImpositionLevel) => {
  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24];
  // const lcRank = {
  //   "id": "21009",
  //   "skill": "Time Fleets Away",
  //   "desc": "The wearer is more likely to be attacked, and DMG taken is reduced by #2[i]%.",
  //   "params": [
  //     [
  //       2,
  //       0.16
  //     ],
  //     [
  //       2,
  //       0.18
  //     ],
  //     [
  //       2,
  //       0.2
  //     ],
  //     [
  //       2,
  //       0.22
  //     ],
  //     [
  //       2,
  //       0.24
  //     ]
  //   ],
  //   "properties": [
  //     [],
  //     [],
  //     [],
  //     [],
  //     []
  //   ]
  // }

  return {
    display: () => <DisplayFormControl content={null} />,
    defaults: () => ({
    }),
    precomputeEffects: (x/* , request */) => {
      // const r = request.lightConeConditionals

      x.DMG_RED_MULTI *= (1 - sValues[s])
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
