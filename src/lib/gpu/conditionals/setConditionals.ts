import { Stats } from "lib/constants";
import { BASIC_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from "lib/conditionals/conditionalConstants";
import { buffAbilityDmg } from "lib/optimizer/calculateBuffs";
import { buffStat, NewConditional } from "lib/gpu/conditionals/newConditionals";
import { OptimizerParams } from "lib/optimizer/calculateParams";

export const ConditionalType = {
  SET: 0,
  ABILITY: 1,
}

export function evaluateConditional(conditional: NewConditional, x: ComputedStatsObject, params: OptimizerParams) {

}

export const RutilantArenaConditional: NewConditional = {
  id: "RutilantArenaConditional",
  type: ConditionalType.SET,
  statDependencies: [Stats.CR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.70
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, 0.20)
  },
  gpu: () => {
    return `
fn evaluateRutilantArenaConditional(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>, p_sets: ptr<function, Sets>) {
  if (
    p2((*p_sets).RutilantArena) >= 1 &&
    (*p_state).RutilantArenaConditional == 0.0 &&
    (*p_x).CR > 0.70
  ) {
    (*p_state).RutilantArenaConditional = 1.0;

    buffAbilityDmg(p_x, BASIC_TYPE | SKILL_TYPE, 0.20, 1);
  }
}
    `
  }
}

export const SpaceSealingStationConditional: NewConditional = {
  id: "SpaceSealingStationConditional",
  type: ConditionalType.SET,
  statDependencies: [Stats.SPD],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.SPD] >= 120
  },
  effect: (x: ComputedStatsObject, params: OptimizerParams) => {
    buffStat(x, params, Stats.ATK, 0.12 * params.baseATK)
  },
  gpu: () => {
    return `
fn evaluateSpaceSealingStationConditional(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>, p_sets: ptr<function, Sets>) {
  if (
    p2((*p_sets).SpaceSealingStation) >= 1 &&
    (*p_state).SpaceSealingStationConditional == 0.0 &&
    (*p_x).SPD >= 120
  ) {
    (*p_state).SpaceSealingStationConditional = 1.0;
    (*p_x).ATK += 0.12 * baseATK;

    evaluateDependenciesATK(p_x, p_state, p_sets);
  }
}
    `
  }
}

export const InertSalsottoConditional: NewConditional = {
  id: "InertSalsottoConditional",
  type: ConditionalType.SET,
  statDependencies: [Stats.CR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.50
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDmg(x, ULT_TYPE | FUA_TYPE, 0.15)
  },
  gpu: () => {
    return ``
  }
}

// export const LanternConditional = {
//   id: "Lantern",
//   statDependencies: [],
//   execute: function() {
//     if (this.condition) {
//
//     }
//   },
//   condition: function(x: ComputedStatsObject) {
//     return true
//   },
//   cpu: (x: ComputedStatsObject) => {
//     x[Stats.BE] += 0.40
//   },
//   gpu: () => {
//
//   }
// }