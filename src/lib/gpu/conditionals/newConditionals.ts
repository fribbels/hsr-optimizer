import { ComputedStatsObject } from "lib/conditionals/conditionalConstants";
import { Stats } from "lib/constants";
import { ConditionalType, RutilantArenaConditional, SpaceSealingStationConditional } from "lib/gpu/conditionals/setConditionals";
import { OptimizerParams } from "lib/optimizer/calculateParams";

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
  type: ConditionalType.ABILITY,
  activationKey: 2,
  statDependencies: [Stats.DEF],
  evaluate: function (x, params) {
    evaluator(this, x, params)
  },
  condition: function (x: ComputedStatsObject) {
    return x[Stats.DEF] > 1600
  },
  effect: function (x: ComputedStatsObject, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(0.48, 0.02 * Math.floor((x[Stats.DEF] - 1600) / 100))

    params.conditionalState[this.id] = buffValue
    buffStat(x, params, Stats.CR, buffValue - stateValue)
  },
  gpu: () => {
    return `
fn evaluateAventurineConversionConditional(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>, p_sets: ptr<function, Sets>) {
  let def = (*p_x).DEF;
  let stateValue: f32 = (*p_state).AventurineConversionConditional;

  if (def > 1600) {
    let buffValue: f32 = min(0.48, 0.02 * floor((def - 1600) / 100));

    (*p_state).AventurineConversionConditional = buffValue;
    (*p_x).CR += buffValue - stateValue;

    evaluateDependenciesCR(p_x, p_state, p_sets);
  }
}
    `
  }
}

export const XueyiConversionConditional: NewConditional = {
  id: 'XueyiConversionConditional',
  type: ConditionalType.ABILITY,
  activationKey: 2,
  statDependencies: [Stats.BE],
  evaluate: function (x, params) {
    evaluator(this, x, params)
  },
  condition: function (x: ComputedStatsObject) {
    return true
  },
  effect: function (x: ComputedStatsObject, params) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(2.40, x[Stats.BE])

    x.ELEMENTAL_DMG += buffValue - stateValue
    params.conditionalState[this.id] = buffValue
  },
  gpu: () => {
    return `
fn evaluateXueyiConversionConditional(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>, p_sets: ptr<function, Sets>) {
  let be = (*p_x).BE;
  let stateValue: f32 = (*p_state).XueyiConversionConditional;
  let buffValue: f32 = min(2.40, be);

  (*p_state).XueyiConversionConditional = buffValue;
  (*p_x).ELEMENTAL_DMG += buffValue - stateValue;

  evaluateDependenciesCR(p_x, p_state, p_sets);
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

export const SetConditionals = [
  SpaceSealingStationConditional,
  RutilantArenaConditional,
]