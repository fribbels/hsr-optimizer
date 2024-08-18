import { ComputedStatsObject } from "lib/conditionals/conditionalConstants";
import { Stats } from "lib/constants";
import { ConditionalType, RutilantArenaConditional, SpaceSealingStationConditional } from "lib/gpu/conditionals/setConditionals";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { indent } from "lib/gpu/injection/wgslUtils";

export type NewConditional = {
  id: string
  type: number,
  statDependencies: string[]
  condition: (x: ComputedStatsObject) => boolean
  effect: (x: ComputedStatsObject, params) => void
  gpu: () => string
}

export function evaluateConditional(self: NewConditional, x: ComputedStatsObject, params) {
  if (self.condition(x)) {
    self.effect(x, params)
  }
}

export function conditionalWgslWrapper(conditional: NewConditional, wgsl: string) {
  return `
fn evaluate${conditional.id}(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>, p_sets: ptr<function, Sets>) {
${indent(wgsl.trim(), 1)}
}
  `
}

export const AventurineConversionConditional: NewConditional = {
  id: 'AventurineConversionConditional',
  type: ConditionalType.ABILITY,
  statDependencies: [Stats.DEF],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.DEF] > 1600
  },
  effect: function (x: ComputedStatsObject, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(0.48, 0.02 * Math.floor((x[Stats.DEF] - 1600) / 100))

    params.conditionalState[this.id] = buffValue
    buffStat(x, params, Stats.CR, buffValue - stateValue)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
let def = (*p_x).DEF;
let stateValue: f32 = (*p_state).AventurineConversionConditional;

if (def > 1600) {
  let buffValue: f32 = min(0.48, 0.02 * floor((def - 1600) / 100));

  (*p_state).AventurineConversionConditional = buffValue;
  (*p_x).CR += buffValue - stateValue;

  evaluateDependenciesCR(p_x, p_state, p_sets);
}
    `)
  }
}

export const XueyiConversionConditional: NewConditional = {
  id: 'XueyiConversionConditional',
  type: ConditionalType.ABILITY,
  statDependencies: [Stats.BE],
  condition: function (x: ComputedStatsObject) {
    return true
  },
  effect: function (x: ComputedStatsObject, params) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(2.40, x[Stats.BE])

    x.ELEMENTAL_DMG += buffValue - stateValue
    params.conditionalState[this.id] = buffValue
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
let be = (*p_x).BE;
let stateValue: f32 = (*p_state).XueyiConversionConditional;
let buffValue: f32 = min(2.40, be);

(*p_state).XueyiConversionConditional = buffValue;
(*p_x).ELEMENTAL_DMG += buffValue - stateValue;

evaluateDependenciesCR(p_x, p_state, p_sets);
    `)
  }
}

export function buffStat(x: ComputedStatsObject, params, stat: string, value: number) {
  x[stat] += value

  for (const conditional of params.conditionalRegistry[stat] || []) {
    conditional.evaluate(x, params)
  }
}

export const SetConditionals = [
  SpaceSealingStationConditional,
  RutilantArenaConditional,
]