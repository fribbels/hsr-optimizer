import React from "react";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";

export default (/* s: SuperImpositionLevel */) => {
  // const sValues = [0, 0, 0, 0, 0];
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
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}
