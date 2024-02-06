import React from "react";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";

export default (/* s: SuperImpositionLevel */) => {
  // const sValues = [0, 0, 0, 0, 0];
  // const lcRank = {
  //   "id": "21018",
  //   "skill": "Cannot Stop It!",
  //   "desc": "When the wearer uses their Ultimate, all allies' actions are Advanced Forward by #1[i]%.",
  //   "params": [
  //     [
  //       0.16
  //     ],
  //     [
  //       0.18
  //     ],
  //     [
  //       0.2
  //     ],
  //     [
  //       0.22
  //     ],
  //     [
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
