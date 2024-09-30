import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { indent, wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Form } from 'types/Form'
import { precisionRound } from 'lib/conditionals/conditionalUtils'

export type DynamicConditional = {
  id: string
  type: number
  activation: number
  dependsOn: string[]
  condition: (x: ComputedStatsObject, request: Form, params: OptimizerParams) => boolean | number
  effect: (x: ComputedStatsObject, request: Form, params: OptimizerParams) => void
  gpu: (request: Form, params: OptimizerParams) => string
  ratioConversion?: boolean
}

export function evaluateConditional(conditional: DynamicConditional, x: ComputedStatsObject, request: Form, params: OptimizerParams) {
  if (conditional.activation == ConditionalActivation.SINGLE) {
    if (!params.conditionalState[conditional.id] && conditional.condition(x, request, params)) {
      params.conditionalState[conditional.id] = 1
      conditional.effect(x, request, params)
    }
  } else if (conditional.activation == ConditionalActivation.CONTINUOUS) {
    if (conditional.condition(x, request, params)) {
      conditional.effect(x, request, params)
    }
  } else {

  }
}

export function conditionalWgslWrapper(conditional: DynamicConditional, wgsl: string) {
  return `
fn evaluate${conditional.id}(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>) {
  let x = *p_x;
${indent(wgsl.trim(), 1)}
}
  `
}

export function buffStat(x: ComputedStatsObject, request: Form, params: OptimizerParams, stat: string, value: number) {
  // Self buffing stats will asymptotically reach 0
  if (value < 0.0001) {
    return
  }

  x[stat] += value

  for (const conditional of params.conditionalRegistry[stat] || []) {
    evaluateConditional(conditional, x, request, params)
  }
}

export const AventurineConversionConditional: DynamicConditional = {
  id: 'AventurineConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.DEF],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals
    return r.defToCrBoost && x[Stats.DEF] > 1600
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(0.48, 0.02 * Math.floor((x[Stats.DEF] - 1600) / 100))

    params.conditionalState[this.id] = buffValue
    buffStat(x, request, params, Stats.CR, buffValue - stateValue)

    return buffValue
  },
  gpu: function (request: Form, _params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.defToCrBoost)}) {
  return;
}
let def = (*p_x).DEF;
let stateValue: f32 = (*p_state).AventurineConversionConditional;

if (def > 1600) {
  let buffValue: f32 = min(0.48, 0.02 * floor((def - 1600) / 100));

  (*p_state).AventurineConversionConditional = buffValue;
  buffDynamicCR(buffValue - stateValue, p_x, p_state);
}
    `)
  },
}

export const XueyiConversionConditional: DynamicConditional = {
  id: 'XueyiConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return r.beToDmgBoost
  },
  effect: function (x: ComputedStatsObject, _request: Form, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(2.40, x[Stats.BE])

    params.conditionalState[this.id] = buffValue
    x.ELEMENTAL_DMG += buffValue - stateValue
  },
  gpu: function (request: Form, params: OptimizerParams) {
    const r = request.characterConditionals
    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beToDmgBoost)}) {
  return;
}
let be = (*p_x).BE;
let stateValue: f32 = (*p_state).XueyiConversionConditional;
let buffValue: f32 = min(2.40, be);

(*p_state).XueyiConversionConditional = buffValue;
(*p_x).ELEMENTAL_DMG += buffValue - stateValue;
    `)
  },
}

export const FireflyConversionConditional: DynamicConditional = {
  id: 'FireflyConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.ATK],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.ATK] > 1800
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const trueAtk = x[Stats.ATK] - x.RATIO_BASED_ATK_BUFF - x.RATIO_BASED_ATK_P_BUFF * params.baseATK
    const buffValue = 0.008 * Math.floor((trueAtk - 1800) / 10)

    params.conditionalState[this.id] = buffValue
    buffStat(x, request, params, Stats.BE, buffValue - stateValue)

    return buffValue
  },
  gpu: function (request: Form, _params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.atkToBeConversion)}) {
  return;
}
let atk = (*p_x).ATK;
let stateValue = (*p_state).FireflyConversionConditional;
let trueAtk = atk - (*p_x).RATIO_BASED_ATK_BUFF - (*p_x).RATIO_BASED_ATK_P_BUFF * baseATK;

if (trueAtk > 1800) {
  let buffValue: f32 = 0.008 * floor((trueAtk - 1800) / 10);

  (*p_state).FireflyConversionConditional = buffValue;
  buffDynamicBE(buffValue - stateValue, p_x, p_state);
}
    `)
  },
}

export const BoothillConversionConditional: DynamicConditional = {
  id: 'BoothillConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return r.beToCritBoost
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0

    const stateCrBuffValue = Math.min(0.30, 0.10 * stateValue)
    const stateCdBuffValue = Math.min(1.50, 0.50 * stateValue)

    const crBuffValue = Math.min(0.30, 0.10 * x[Stats.BE])
    const cdBuffValue = Math.min(1.50, 0.50 * x[Stats.BE])

    params.conditionalState[this.id] = x[Stats.BE]

    buffStat(x, request, params, Stats.CR, crBuffValue - stateCrBuffValue)
    buffStat(x, request, params, Stats.CD, cdBuffValue - stateCdBuffValue)
  },
  gpu: function (request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beToCritBoost)}) {
  return;
}

let be = (*p_x).BE;
let stateValue = (*p_state).BoothillConversionConditional;

let stateCrBuffValue = min(0.30, 0.10 * stateValue);
let stateCdBuffValue = min(1.50, 0.50 * stateValue);

let crBuffValue = min(0.30, 0.10 * be);
let cdBuffValue = min(1.50, 0.50 * be);

(*p_state).BoothillConversionConditional = be;

buffDynamicCR(crBuffValue - stateCrBuffValue, p_x, p_state);
buffDynamicCD(cdBuffValue - stateCdBuffValue, p_x, p_state);
    `)
  },
}

export const GepardConversionConditional: DynamicConditional = {
  id: 'GepardConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.DEF],
  condition: function () {
    return true
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = 0.35 * x[Stats.DEF]

    params.conditionalState[this.id] = buffValue
    buffStat(x, request, params, Stats.ATK, buffValue - stateValue)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
let def = (*p_x).DEF;
let stateValue: f32 = (*p_state).GepardConversionConditional;
let buffValue: f32 = 0.35 * def;

(*p_state).GepardConversionConditional = buffValue;
buffDynamicATK(buffValue - stateValue, p_x, p_state);
    `)
  },
}

export const BlackSwanConversionConditional: DynamicConditional = {
  id: 'BlackSwanConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.EHR],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    return true
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals
    if (!r.ehrToDmgBoost) {
      return
    }
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(0.72, 0.60 * x[Stats.EHR])

    params.conditionalState[this.id] = buffValue
    x.ELEMENTAL_DMG += buffValue - stateValue
  },
  gpu: function (request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.ehrToDmgBoost)}) {
  return;
}
let ehr = (*p_x).EHR;
let stateValue: f32 = (*p_state).BlackSwanConversionConditional;
let buffValue: f32 = min(0.72, 0.60 * ehr);

(*p_state).BlackSwanConversionConditional = buffValue;
(*p_x).ELEMENTAL_DMG += buffValue - stateValue;
    `)
  },
}

export const RappaConversionConditional: DynamicConditional = {
  id: 'RappaConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.ATK],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    return true
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals
    if (!r.atkToBreakVulnerability) {
      return
    }

    const stateValue = params.conditionalState[this.id] || 0
    const atkOverStacks = Math.floor(precisionRound((x[Stats.ATK] - 2400) / 100))
    const buffValue = Math.min(0.08, Math.max(0, atkOverStacks) * 0.01) + 0.02

    params.conditionalState[this.id] = buffValue
    x.BREAK_VULNERABILITY += buffValue - stateValue
  },
  gpu: function (request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.atkToBreakVulnerability)}) {
  return;
}
let atk = (*p_x).ATK;
let stateValue: f32 = (*p_state).RappaConversionConditional;
let atkOverStacks: f32 = floor((x.ATK - 2400) / 100);
let buffValue: f32 = min(0.08, max(0, atkOverStacks) * 0.01) + 0.02;

(*p_state).RappaConversionConditional = buffValue;
(*p_x).BREAK_VULNERABILITY += buffValue - stateValue;
    `)
  },
}

export const GallagherConversionConditional: DynamicConditional = {
  id: 'GallagherConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    return true
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(0.75, 0.50 * x[Stats.BE])

    params.conditionalState[this.id] = buffValue
    buffStat(x, request, params, Stats.OHB, buffValue - stateValue)
  },
  gpu: function (request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
let be = (*p_x).BE;
let stateValue: f32 = (*p_state).GallagherConversionConditional;
let buffValue: f32 = min(0.75, 0.50 * (*p_x).BE);

(*p_state).GallagherConversionConditional = buffValue;
buffDynamicOHB(buffValue - stateValue, p_x, p_state);
    `)
  },
}

export const RuanMeiConversionConditional: DynamicConditional = {
  id: 'RuanMeiConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    return true
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    const stateValue = params.conditionalState[this.id] || 0
    const beOver = Math.floor(precisionRound((x[Stats.BE] * 100 - 120) / 10))
    const buffValue = Math.min(0.36, Math.max(0, beOver) * 0.06)

    params.conditionalState[this.id] = buffValue
    x.ELEMENTAL_DMG += buffValue - stateValue
  },
  gpu: function (request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
let be = (*p_x).BE;
let stateValue: f32 = (*p_state).RuanMeiConversionConditional;
let beOver = ((*p_x).BE * 100 - 120) / 10;
let buffValue: f32 = floor(max(0, beOver)) * 0.06;

(*p_state).RuanMeiConversionConditional = buffValue;
(*p_x).ELEMENTAL_DMG += buffValue - stateValue;
    `)
  },
}

export const JiaoqiuConversionConditional: DynamicConditional = {
  id: 'JiaoqiuConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.EHR],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    return true
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals
    if (!r.ehrToAtkBoost || x[Stats.EHR] <= 0.80) {
      return
    }

    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(2.40, 0.60 * Math.floor((x[Stats.EHR] - 0.80) / 0.15)) * request.baseAtk

    params.conditionalState[this.id] = buffValue
    buffStat(x, request, params, Stats.ATK, buffValue - stateValue)
  },
  gpu: function (request: Form, params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
let ehr = (*p_x).EHR;
let stateValue: f32 = (*p_state).JiaoqiuConversionConditional;
let buffValue: f32 = min(2.40, 0.60 * floor(((*p_x).EHR - 0.80) / 0.15));

(*p_state).JiaoqiuConversionConditional = buffValue;
buffDynamicATK_P(buffValue - stateValue, p_x, p_state);
    `)
  },
}

export const LingshaConversionConditional: DynamicConditional = {
  id: 'LingshaConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    return true
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const r = request.characterConditionals
    if (!r.beConversion) {
      return
    }

    const stateValue = params.conditionalState[this.id] || 0
    const buffValueAtk = Math.min(0.50, 0.25 * x[Stats.BE]) * request.baseAtk
    const buffValueOhb = Math.min(0.20, 0.10 * x[Stats.BE])

    const stateBuffValueAtk = Math.min(0.50, 0.25 * stateValue) * request.baseAtk
    const stateBuffValueOhb = Math.min(0.20, 0.10 * stateValue)

    params.conditionalState[this.id] = x[Stats.BE]

    const finalBuffAtk = buffValueAtk - (stateValue ? stateBuffValueAtk : 0)
    const finalBuffOhb = buffValueOhb - (stateValue ? stateBuffValueOhb : 0)

    buffStat(x, request, params, Stats.ATK, finalBuffAtk)
    buffStat(x, request, params, Stats.OHB, finalBuffOhb)
  },
  gpu: function (request: Form, _params: OptimizerParams) {
    const r = request.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beConversion)}) {
  return;
}

let stateValue: f32 = (*p_state).LingshaConversionConditional;

let buffValueAtk = min(0.50, 0.25 * x.BE) * baseATK;
let buffValueOhb = min(0.20, 0.10 * x.BE);

let stateBuffValueAtk = min(0.50, 0.25 * stateValue) * baseATK;
let stateBuffValueOhb = min(0.20, 0.10 * stateValue);

(*p_state).LingshaConversionConditional = (*p_x).BE;

let finalBuffAtk = buffValueAtk - select(0, stateBuffValueAtk, stateValue > 0);
let finalBuffOhb = buffValueOhb - select(0, stateBuffValueOhb, stateValue > 0);

buffDynamicATK(finalBuffAtk, p_x, p_state);
buffDynamicOHB(finalBuffOhb, p_x, p_state);
    `)
  },
}
