import { BASIC_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from "lib/conditionals/conditionalConstants";
import { Stats } from "lib/constants";
import { buffAbilityDmg } from "lib/optimizer/calculateBuffs";

export type NewConditional = {
  id: string
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

export const RutilantArenaConditional: NewConditional = {
  id: "RutilantArenaConditional",
  activationKey: 1,
  statDependencies: [Stats.CR],
  evaluate: function (x, params) {
    evaluator(this, x, params)
  },
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.70
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, 0.20)
  },
  gpu: () => {
    return `
fn evaluateRutilantArenaConditional(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>) {
  if (
    (*p_state).rutilantArena == 0.0 &&
    (*p_x).CR > 0.70
  ) {
    (*p_state).rutilantArena = 1.0;

    buffAbilityDmg(p_x, BASIC_TYPE | SKILL_TYPE, 0.20, 1);
  }
}
    `
  }
}

export const InertSalsottoConditional: NewConditional = {
  id: "InertSalsottoConditional",
  activationKey: 1,
  statDependencies: [Stats.CR],
  evaluate: function (x, params) {
    evaluator(this, x, params)
  },
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.50
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDmg(x, ULT_TYPE | FUA_TYPE, 0.15)
  },
  gpu: () => {

  }
}

function evaluator(self: NewConditional, x: ComputedStatsObject, params) {
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

  for (const conditional of RegisteredConditionals[stat] || []) {
    conditional.evaluate(x, params)
  }
}

export const RegisteredConditionals = {
  [Stats.HP]: [],
  [Stats.ATK]: [],
  [Stats.DEF]: [AventurineConversionConditional,],
  [Stats.SPD]: [],
  [Stats.CR]: [RutilantArenaConditional,],
  [Stats.CD]: [],
  [Stats.EHR]: [],
  [Stats.RES]: [],
  [Stats.BE]: [],
  [Stats.OHB]: [],
  [Stats.ERR]: [],
}

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