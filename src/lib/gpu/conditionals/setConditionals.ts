import { Stats } from "lib/constants";
import { BASIC_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from "lib/conditionals/conditionalConstants";
import { buffAbilityDmg } from "lib/optimizer/calculateBuffs";
import { evaluator, NewConditional } from "lib/gpu/conditionals/newConditionals";


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