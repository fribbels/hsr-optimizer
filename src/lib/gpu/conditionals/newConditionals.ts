import { ComputedStatsObject } from "lib/conditionals/conditionalConstants";
import { Stats } from "lib/constants";
import { RutilantArenaConditional, SpaceSealingStationConditional } from "lib/gpu/conditionals/setConditionals";

export type NewConditional = {
  id: string
  type: number,
  activationKey: number
  statDependencies: string[]
  evaluate: (x: ComputedStatsObject, params) => void
  condition: (x: ComputedStatsObject) => boolean
  effect: (x: ComputedStatsObject, params) => void
  gpu: () => string
}

export type ConditionalMetadata = {
  activationKeys: number[]
}

export function evaluator(self: NewConditional, x: ComputedStatsObject, params) {
  const metadata = params.conditionalMetadata
  if (metadata && metadata.activationKeys[self.activationKey]) {
    return
  }

  if (self.condition(x)) {
    self.effect(x, params)
    if (metadata) {
      metadata.activationKeys[self.activationKey] = 1
    }
  }
}

export const AventurineConversionConditional: NewConditional = {
  id: 'AventurineConversionConditional',
  activationKey: 2,
  statDependencies: [Stats.DEF],
  evaluate: function (x, params) {
    evaluator(this, x, params)
  },
  condition: function (x: ComputedStatsObject) {
    return x[Stats.DEF] > 1600
  },
  effect: (x: ComputedStatsObject, params) => {
    buffStat(x, params, Stats.CR, Math.min(0.48, 0.02 * Math.floor((x[Stats.DEF] - 1600) / 100)))
  },
  gpu: () => {
    return `
fn evaluateAventurineConversionConditional(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>) {
  let def = (*p_x).DEF;
  let stateValue: f32 = (*p_state).aventurineDefConversion;

  if (def > 1600) {
    let buffValue: f32 = min(0.48, 0.02 * floor((def - 1600) / 100));
    let oldBuffValue: f32 = stateValue;

    (*p_state).aventurineDefConversion = buffValue;
    (*p_x).CR += buffValue - stateValue;

    evaluateDependenciesCR(p_x, p_state);
  }
}
    `
  }
}

export function buffStat(x: ComputedStatsObject, params, stat: string, value: number) {
  x[stat] += value

  for (const conditional of params.conditionalRegistry[stat] || []) {
    conditional.evaluate(x, params)
  }
}

// export const RegisteredConditionals = {
//   [Stats.HP]: [],
//   [Stats.ATK]: [],
//   [Stats.DEF]: [AventurineConversionConditional,],
//   [Stats.SPD]: [SpaceSealingStationConditional,],
//   [Stats.CR]: [RutilantArenaConditional,],
//   [Stats.CD]: [],
//   [Stats.EHR]: [],
//   [Stats.RES]: [],
//   [Stats.BE]: [],
//   [Stats.OHB]: [],
//   [Stats.ERR]: [],
// }

export const SetConditionals = [
  SpaceSealingStationConditional,
  RutilantArenaConditional,
]

// export const LanternConditional = {
//   id: "Lantern",
//   activationKey: 1,
//   statDependencies: [],
//   execute: function() {
//     if (this.condition) {
//
//     }
//   },
//   condition: function(x: ComputedStatsObject) {
//     if (!this.activationKey) {
//       // Check if the conditional is already activated
//       return
//     }
//
//     return true
//   },
//   cpu: (x: ComputedStatsObject) => {
//     x[Stats.BE] += 0.40
//   },
//   gpu: () => {
//
//   }
// }