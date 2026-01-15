import { evaluateDependencyOrder } from 'lib/conditionals/evaluation/dependencyEvaluator'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  getActionIndex,
  wgslDebugActionRegister,
} from 'lib/gpu/injection/injectUtils'
import {
  indent,
  wgsl,
  wgslFalse,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { GpuConstants } from 'lib/gpu/webgpuTypes'
import {
  AKey,
  HKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import {
  buff,
  matchesTargetTag,
} from 'lib/optimization/engine/container/gpuBuffBuilder'
import { getDamageFunction } from 'lib/optimization/engine/damage/damageCalculator'
import {
  CharacterConditionalsController,
  LightConeConditionalsController,
} from 'types/conditionals'
import { Form } from 'types/form'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function injectUnrolledActions(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  let unrolledActionCallsWgsl = '\n    var comboDmg: f32 = 0;\n'
  let unrolledActionFunctionsWgsl = ''

  // Execute default actions
  for (let i = 0; i < context.defaultActions.length; i++) {
    const action = context.defaultActions[i]

    const { actionCall, actionFunction } = unrollAction(i, action, context, gpuParams)

    unrolledActionCallsWgsl += actionCall
    unrolledActionFunctionsWgsl += actionFunction

    // DEBUG: Copy entire container0, then copy registers from other actions
    if (gpuParams.DEBUG) {
      if (i === 0) {
        // Copy entire container0 to get all action stats and hit stats
        unrolledActionCallsWgsl += `\n    var debugContainer: array<f32, ${context.maxContainerArrayLength}> = container0;\n\n`
      } else {
        // Copy only registers from actions 1+
        unrolledActionCallsWgsl += generateRegisterCopy(i, action, context)
      }
    }
  }

  // Execute rotation actions
  for (let i = 0; i < context.rotationActions.length; i++) {
    const action = context.rotationActions[i]
    const actionIndex = context.defaultActions.length + i

    const { actionCall, actionFunction } = unrollAction(actionIndex, action, context, gpuParams)

    unrolledActionCallsWgsl += actionCall
    unrolledActionFunctionsWgsl += actionFunction

    // DEBUG: Copy registers after execution
    if (gpuParams.DEBUG) {
      unrolledActionCallsWgsl += generateRegisterCopy(actionIndex, action, context)
    }
  }

  if (!gpuParams.DEBUG) {
    unrolledActionCallsWgsl += `
    if (comboDmg > threshold) {
      results[index] = comboDmg;
      failures = 1;
    } else {
      results[index] = -failures; failures = failures + 1;
    }
`
  } else {
    unrolledActionCallsWgsl += `
    results[index] = debugContainer;
`
  }

  wgsl = wgsl.replace(
    '/* INJECT UNROLLED ACTIONS */',
    unrolledActionCallsWgsl,
  )

  wgsl = wgsl.replace(
    '/* INJECT UNROLLED ACTION FUNCTIONS */',
    unrolledActionFunctionsWgsl,
  )

  return wgsl
}

function generateRegisterCopy(actionIndex: number, action: OptimizerAction, context: OptimizerContext): string {
  const registersOffset = context.maxContainerArrayLength - (context.allActions.length + context.outputRegistersLength)
  const actionRegisterOffset = registersOffset
  const hitRegisterOffset = registersOffset + context.allActions.length

  let code = `    // Copy action ${actionIndex} registers to debug container\n`

  // Copy action register
  const actionRegIdx = actionRegisterOffset + action.registerIndex
  code += `  debugContainer[${actionRegIdx}] = container${actionIndex}[${actionRegIdx}];\n`

  // Copy all hit registers
  if (action.hits) {
    for (let hitIndex = 0; hitIndex < action.hits.length; hitIndex++) {
      const hit = action.hits[hitIndex]
      const hitRegIdx = hitRegisterOffset + hit.registerIndex
      code += `  debugContainer[${hitRegIdx}] = container${actionIndex}[${hitRegIdx}];\n`
    }
  }

  code += '\n'
  return code
}

// dprint-ignore
function unrollAction(index: number, action: OptimizerAction, context: OptimizerContext, gpuParams: GpuConstants) {
  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(context)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(context)

  let characterConditionalWgsl = "// Character conditionals\n"
  let lightConeConditionalWgsl = '// Light cone conditionals\n'

  if (characterConditionals.newGpuFinalizeCalculations) {
    characterConditionalWgsl += indent(characterConditionals.newGpuFinalizeCalculations(action, context), 3)
  }
  if (lightConeConditionals.newGpuFinalizeCalculations) {
    lightConeConditionalWgsl += indent(lightConeConditionals.newGpuFinalizeCalculations(action, context), 3)
  }

  //////////

  let basicConditionalsWgsl = "// Basic Character conditionals\n"

  if (characterConditionals.newGpuCalculateBasicEffects) {
    basicConditionalsWgsl += indent(characterConditionals.newGpuCalculateBasicEffects(action, context), 1)
  }
  if (lightConeConditionals.newGpuCalculateBasicEffects) {
    basicConditionalsWgsl += indent(lightConeConditionals.newGpuCalculateBasicEffects(action, context), 1)
  }

  //////////

  const damageCalculationWgsl = indent(unrollDamageCalculations(index, action, context, gpuParams), 1)

  //////////

  function generateConditionalExecution(conditional: DynamicConditional) {
    return `evaluate${conditional.id}${action.actionIdentifier}(p_container, p_sets, p_state);`
  }

  const { conditionalSequence, terminalConditionals } = evaluateDependencyOrder(action.conditionalRegistry)
  let conditionalSequenceWgsl = '\n'
  conditionalSequenceWgsl += conditionalSequence.map(generateConditionalExecution).map((wgsl) => indent(wgsl, 1)).join('\n') + '\n'

  conditionalSequenceWgsl += '\n'
  conditionalSequenceWgsl += terminalConditionals.map(generateConditionalExecution).map((wgsl) => indent(wgsl, 1)).join('\n') + '\n'

  //////////

  const actionCall = `
    var container${index}: array<f32, ${context.maxContainerArrayLength}> = precomputedStats[${index}];
    let dmg${index} = unrolledAction${index}(
      &container${index},
      &sets,
      &c,
      diffATK,
      diffDEF,
      diffHP,
      diffSPD,
      diffCD,
      diffCR,
      diffEHR,
      diffRES,
      diffBE,
      diffERR,
      diffOHB,
    );
    comboDmg += dmg${index};
`
  
  const actionFunction = `
fn unrolledAction${index}(
  p_container: ptr<function, array<f32, ${context.maxContainerArrayLength}>>,
  p_sets: ptr<function, Sets>,
  p_c: ptr<function, BasicStats>,
  diffATK: f32,
  diffDEF: f32,
  diffHP: f32,
  diffSPD: f32,
  diffCD: f32,
  diffCR: f32,
  diffEHR: f32,
  diffRES: f32,
  diffBE: f32,
  diffERR: f32,
  diffOHB: f32,
) -> f32 { // Action ${index} - ${action.actionName} 
  let setConditionals = action${index}.setConditionals;
  var state = ConditionalState();
  let p_state = &state;
  state.actionIndex = ${index};

  var comboDmg = 0.0;
  var comboHeal = 0.0;
  var comboShield = 0.0;

  // Set the Action-scope stats, to be added to the Hit-scope stats later
  ${unrollEntityBaseStats(action)}

  if (
    p2((*p_sets).AmphoreusTheEternalLand) >= 1
    && setConditionals.enabledAmphoreusTheEternalLand == true
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.MEMOSPRITE, action.config)} >= 1
  ) {
    ${buff.action(AKey.SPD_P, 0.08).targets(TargetTag.FullTeam).wgsl(action, 4)}
  }
  
  ${basicConditionalsWgsl}
  
  ${conditionalSequenceWgsl}
  
  ${characterConditionalWgsl}
  
  ${lightConeConditionalWgsl}

  if (
    p2((*p_sets).FirmamentFrontlineGlamoth) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.SPD, action.config)} >= 135.0
  ) {
    ${buff.hit(HKey.DMG_BOOST, `select(0.12, 0.18, ${containerActionVal(SELF_ENTITY_INDEX, AKey.SPD, action.config)} >= 160.0)`).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).RutilantArena) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.CR, action.config)} >= 0.70
  ) {
    ${buff.hit(HKey.DMG_BOOST, 0.20).damageType(DamageTag.BASIC | DamageTag.SKILL).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).InertSalsotto) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.CR, action.config)} >= 0.50
  ) {
    ${buff.hit(HKey.DMG_BOOST, 0.15).damageType(DamageTag.ULT | DamageTag.FUA).wgsl(action, 2)}
  }

  if (p2((*p_sets).RevelryByTheSea) >= 1) {
    if (${containerActionVal(SELF_ENTITY_INDEX, AKey.ATK, action.config)} >= 3600.0) {
      ${buff.hit(HKey.DMG_BOOST, 0.24).damageType(DamageTag.DOT).wgsl(action, 3)}
    } else if (${containerActionVal(SELF_ENTITY_INDEX, AKey.ATK, action.config)} >= 2400.0) {
      ${buff.hit(HKey.DMG_BOOST, 0.12).damageType(DamageTag.DOT).wgsl(action, 3)}
    }
  }

  if (
    p4((*p_sets).IronCavalryAgainstTheScourge) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.BE, action.config)} >= 1.50
  ) {
    ${buff.hit(HKey.DEF_PEN, 0.10).damageType(DamageTag.BREAK).wgsl(action, 2)}
    ${buff.hit(HKey.DEF_PEN, `select(0.0, 0.15, ${containerActionVal(SELF_ENTITY_INDEX, AKey.BE, action.config)} >= 2.50)`).damageType(DamageTag.SUPER_BREAK).wgsl(action, 2)}
  }
  
  ${damageCalculationWgsl}
  
  // Combat stat filters
  
  // Basic stat filters
  
  // Rating stat filters
  
  // Return value
  
  return comboDmg;
}
  `

  return { actionCall, actionFunction }
}

function unrollDamageCalculations(index: number, action: OptimizerAction, context: OptimizerContext, gpuParams: GpuConstants) {
  let code = ''

  for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
    const hit = action.hits![hitIndex]
    const damageFunction = getDamageFunction(hit.damageFunctionType)
    code += damageFunction.wgsl(action, hitIndex, context)
  }

  if (gpuParams.DEBUG) {
    // Set action register with total combo damage
    code += wgslDebugActionRegister(action, context, 'comboDmg') + '\n'
  }

  return wgsl`
${code}
`
}

function unrollEntityBaseStats(action: OptimizerAction, targetTag: TargetTag = TargetTag.FullTeam) {
  const config = action.config
  const lines: string[] = ['']
  for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
    const entity = config.entitiesArray[entityIndex]
    if (matchesTargetTag(entity, targetTag)) {
      const entityName = entity.name ?? `Entity ${entityIndex}`
      const baseIndex = getActionIndex(entityIndex, AKey.HP_P, config)
      // dprint-ignore
      lines.push(
        `\
  // Entity ${entityIndex}: ${entityName} | Base index: ${baseIndex}
  ${containerActionVal(entityIndex, AKey.BASE_ATK, config)} = ${entity.memoBaseAtkScaling ?? 1} * baseATK;
  ${containerActionVal(entityIndex, AKey.BASE_DEF, config)} = ${entity.memoBaseDefScaling ?? 1} * baseDEF;
  ${containerActionVal(entityIndex, AKey.BASE_HP, config)} = ${entity.memoBaseHpScaling ?? 1} * baseHP;
  ${containerActionVal(entityIndex, AKey.BASE_SPD, config)} = ${entity.memoBaseSpdScaling ?? 1} * baseSPD;

  ${containerActionVal(entityIndex, AKey.ATK, config)} += diffATK * ${entity.memoBaseAtkScaling ?? 1} + ${entity.memoBaseAtkFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.DEF, config)} += diffDEF * ${entity.memoBaseDefScaling ?? 1} + ${entity.memoBaseDefFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.HP, config)} += diffHP * ${entity.memoBaseHpScaling ?? 1} + ${entity.memoBaseHpFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.SPD, config)} += diffSPD * ${entity.memoBaseSpdScaling ?? 1} + ${entity.memoBaseSpdFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.CD, config)} += diffCD;
  ${containerActionVal(entityIndex, AKey.CR, config)} += diffCR;
  ${containerActionVal(entityIndex, AKey.EHR, config)} += diffEHR;
  ${containerActionVal(entityIndex, AKey.RES, config)} += diffRES;
  ${containerActionVal(entityIndex, AKey.BE, config)} += diffBE;
  ${containerActionVal(entityIndex, AKey.ERR, config)} += diffERR;
  ${containerActionVal(entityIndex, AKey.OHB, config)} += diffOHB;
        
  ${containerActionVal(entityIndex, AKey.ATK, config)} += ${containerActionVal(entityIndex, AKey.ATK_P, config)} * ${containerActionVal(entityIndex, AKey.BASE_ATK, config)};
  ${containerActionVal(entityIndex, AKey.DEF, config)} += ${containerActionVal(entityIndex, AKey.DEF_P, config)} * ${containerActionVal(entityIndex, AKey.BASE_DEF, config)};
  ${containerActionVal(entityIndex, AKey.HP, config)} += ${containerActionVal(entityIndex, AKey.HP_P, config)} * ${containerActionVal(entityIndex, AKey.BASE_HP, config)};
  ${containerActionVal(entityIndex, AKey.SPD, config)} += ${containerActionVal(entityIndex, AKey.SPD_P, config)} * ${containerActionVal(entityIndex, AKey.BASE_SPD, config)};
        
  ${containerActionVal(entityIndex, AKey.PHYSICAL_DMG_BOOST, config)} += (*p_c).PHYSICAL_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.FIRE_DMG_BOOST, config)} += (*p_c).FIRE_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.ICE_DMG_BOOST, config)} += (*p_c).ICE_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.LIGHTNING_DMG_BOOST, config)} += (*p_c).LIGHTNING_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.WIND_DMG_BOOST, config)} += (*p_c).WIND_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.QUANTUM_DMG_BOOST, config)} += (*p_c).QUANTUM_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.IMAGINARY_DMG_BOOST, config)} += (*p_c).IMAGINARY_DMG_BOOST;
`,
      )
    }
  }
  return lines.join('\n')
}
