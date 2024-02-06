import React from "react";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";

export default (/* s: SuperImpositionLevel */) => {
  // const sValues = [0, 0, 0, 0, 0];
  // const lcRank = {
  //   "id": "21008",
  //   "skill": "Self-Confidence",
  //   "desc": "Increases the wearer's Effect Hit Rate by #1[i]% and increases DoT by #2[i]%.",
  //   "params": [
  //     [
  //       0.2,
  //       0.24
  //     ],
  //     [
  //       0.25,
  //       0.3
  //     ],
  //     [
  //       0.3,
  //       0.36
  //     ],
  //     [
  //       0.35,
  //       0.42
  //     ],
  //     [
  //       0.4,
  //       0.48
  //     ]
  //   ],
  //   "properties": [
  //     [
  //       {
  //         "type": "StatusProbabilityBase",
  //         "value": 0.2
  //       }
  //     ],
  //     [
  //       {
  //         "type": "StatusProbabilityBase",
  //         "value": 0.25
  //       }
  //     ],
  //     [
  //       {
  //         "type": "StatusProbabilityBase",
  //         "value": 0.3
  //       }
  //     ],
  //     [
  //       {
  //         "type": "StatusProbabilityBase",
  //         "value": 0.35
  //       }
  //     ],
  //     [
  //       {
  //         "type": "StatusProbabilityBase",
  //         "value": 0.4
  //       }
  //     ]
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
