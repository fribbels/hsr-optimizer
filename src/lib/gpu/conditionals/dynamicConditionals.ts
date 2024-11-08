import { precisionRound } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { indent, wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { OptimizerAction, OptimizerContext, TeammateAction } from 'types/Optimizer'

export type DynamicConditional = {
  id: string
  type: number
  activation: number
  dependsOn: string[]
  condition: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => boolean | number
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => void
  gpu: (action: OptimizerAction, context: OptimizerContext) => string
  ratioConversion?: boolean
  teammateIndex?: number
}

function getTeammateFromIndex(conditional: DynamicConditional, action: OptimizerAction): TeammateAction {
  if (conditional.teammateIndex === 0) return action.teammate0
  else if (conditional.teammateIndex === 1) return action.teammate1
  else return action.teammate2
}

export function evaluateConditional(conditional: DynamicConditional, x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  if (conditional.teammateIndex != null) {
    const teammate = getTeammateFromIndex(conditional, action)
    const teammateAction = {
      ...action,
      characterConditionals: teammate.characterConditionals,
      lightConeConditionals: teammate.lightConeConditionals,
    }
    if (conditional.activation == ConditionalActivation.SINGLE) {
      if (!action.conditionalState[conditional.id] && conditional.condition(x, teammateAction, context)) {
        action.conditionalState[conditional.id] = 1
        conditional.effect(x, teammateAction, context)
      }
    } else if (conditional.activation == ConditionalActivation.CONTINUOUS) {
      if (conditional.condition(x, teammateAction, context)) {
        conditional.effect(x, teammateAction, context)
      }
    } else {
      //
    }
  } else {
    if (conditional.activation == ConditionalActivation.SINGLE) {
      if (!action.conditionalState[conditional.id] && conditional.condition(x, action, context)) {
        action.conditionalState[conditional.id] = 1
        conditional.effect(x, action, context)
      }
    } else if (conditional.activation == ConditionalActivation.CONTINUOUS) {
      if (conditional.condition(x, action, context)) {
        conditional.effect(x, action, context)
      }
    } else {
      //
    }
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

export const FireflyConversionConditional: DynamicConditional = {
  id: 'FireflyConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.ATK],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return x.a[Key.ATK] > 1800
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    const stateValue = action.conditionalState[this.id] || 0
    const trueAtk = x.a[Key.ATK] - x.a[Key.RATIO_BASED_ATK_BUFF] - x.a[Key.RATIO_BASED_ATK_P_BUFF] * context.baseATK
    const buffValue = 0.008 * Math.floor((trueAtk - 1800) / 10)

    action.conditionalState[this.id] = buffValue
    x.BE.buffDynamic(buffValue - stateValue, Source.NONE, action, context)

    return buffValue
  },
  gpu: function (action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

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

export const BlackSwanConversionConditional: DynamicConditional = {
  id: 'BlackSwanConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.EHR],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return true
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals
    if (!r.ehrToDmgBoost) {
      return
    }
    const stateValue = action.conditionalState[this.id] || 0
    const buffValue = Math.min(0.72, 0.60 * x.a[Key.EHR])

    action.conditionalState[this.id] = buffValue
    x.ELEMENTAL_DMG.buff(buffValue - stateValue, Source.NONE)
  },
  gpu: function (action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

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
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return true
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals
    if (!r.atkToBreakVulnerability) {
      return
    }

    const stateValue = action.conditionalState[this.id] || 0
    const atkOverStacks = Math.floor(precisionRound((x.a[Key.ATK] - 2400) / 100))
    const buffValue = Math.min(0.08, Math.max(0, atkOverStacks) * 0.01) + 0.02

    action.conditionalState[this.id] = buffValue
    x.BREAK_VULNERABILITY.buff(buffValue - stateValue, Source.NONE)
  },
  gpu: function (action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

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
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return true
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

    const stateValue = action.conditionalState[this.id] || 0
    const buffValue = Math.min(0.75, 0.50 * x.a[Key.BE])

    action.conditionalState[this.id] = buffValue
    x.OHB.buffDynamic(buffValue - stateValue, Source.NONE, action, context)
  },
  gpu: function (action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

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
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return true
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

    const stateValue = action.conditionalState[this.id] || 0
    const beOver = Math.floor(precisionRound((x.a[Key.BE] * 100 - 120) / 10))
    const buffValue = Math.min(0.36, Math.max(0, beOver) * 0.06)

    action.conditionalState[this.id] = buffValue
    x.ELEMENTAL_DMG.buff(buffValue - stateValue, Source.NONE)
  },
  gpu: function (action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

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
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return true
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals
    if (!r.ehrToAtkBoost || x.a[Key.EHR] <= 0.80) {
      return
    }

    const stateValue = action.conditionalState[this.id] || 0
    const buffValue = Math.min(2.40, 0.60 * Math.floor((x.a[Key.EHR] - 0.80) / 0.15)) * context.baseATK

    action.conditionalState[this.id] = buffValue
    x.ATK.buffDynamic(buffValue - stateValue, Source.NONE, action, context)
  },
  gpu: function (action: OptimizerAction, context: OptimizerContext) {
    return conditionalWgslWrapper(this, `
let ehr = (*p_x).EHR;
let stateValue: f32 = (*p_state).JiaoqiuConversionConditional;
let buffValue: f32 = min(2.40, 0.60 * floor(((*p_x).EHR - 0.80) / 0.15));

(*p_state).JiaoqiuConversionConditional = buffValue;
buffDynamicATK_P(buffValue - stateValue, p_x, p_state);
    `)
  },
}
