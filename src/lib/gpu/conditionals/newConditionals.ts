import { ComputedStatsObject } from "lib/conditionals/conditionalConstants";
import { Stats } from "lib/constants";
import { ConditionalActivation, ConditionalType } from "lib/gpu/conditionals/setConditionals";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { indent, wgslIsFalse } from "lib/gpu/injection/wgslUtils";
import { Form } from "types/Form";

export type NewConditional = {
  id: string
  type: number,
  activation: number,
  dependsOn: string[]
  condition: (x: ComputedStatsObject, params: OptimizerParams) => boolean
  effect: (x: ComputedStatsObject, params: OptimizerParams) => void
  gpu: (request: Form, params: OptimizerParams) => string
}

export function evaluateConditional(conditional: NewConditional, x: ComputedStatsObject, params: OptimizerParams) {
  if (conditional.activation == ConditionalActivation.SINGLE) {
    if (conditional.condition(x, params) && !params.conditionalState[conditional.id]) {
      conditional.effect(x, params)
      params.conditionalState[conditional.id] = 1
    }
  } else if (conditional.activation == ConditionalActivation.CONTINUOUS) {
    conditional.effect(x, params)
  } else {

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
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.DEF],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.DEF] > 1600
  },
  effect: function (x: ComputedStatsObject, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(0.48, 0.02 * Math.floor((x[Stats.DEF] - 1600) / 100))

    params.conditionalState[this.id] = buffValue
    buffStat(x, params, Stats.CR, buffValue - stateValue)

    return buffValue;
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
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.BE],
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

export const FireflyConversionConditional: NewConditional = {
  id: 'FireflyConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.ATK],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.ATK] > 1800
  },
  effect: function (x: ComputedStatsObject, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const trueAtk = x[Stats.ATK] - x.RATIO_BASED_ATK_BUFF - x.RATIO_BASED_ATK_P_BUFF * params.baseATK;
    const buffValue = 0.008 * Math.floor((trueAtk - 1800) / 10)

    params.conditionalState[this.id] = buffValue
    buffStat(x, params, Stats.BE, buffValue - stateValue)

    return buffValue;
  },
  gpu: function (request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslIsFalse(r.atkToBeConversion)}) {
  return;
}
let atk = (*p_x).ATK;
let stateValue = (*p_state).FireflyConversionConditional;
let trueAtk = atk - (*p_x).RATIO_BASED_ATK_BUFF - (*p_x).RATIO_BASED_ATK_P_BUFF * baseATK;

if (trueAtk > 1800) {
  let buffValue: f32 = 0.008 * floor((trueAtk - 1800) / 10);

  (*p_state).FireflyConversionConditional = buffValue;
  (*p_x).BE += buffValue - stateValue;

  evaluateDependenciesBE(p_x, p_state, p_sets);
}
    `)
  }
}

export function buffStat(x: ComputedStatsObject, params, stat: string, value: number) {
  x[stat] += value

  for (const conditional of params.conditionalRegistry[stat] || []) {
    evaluateConditional(conditional, x, params)
  }
}
