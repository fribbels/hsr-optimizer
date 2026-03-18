import { evaluateDependencyOrder } from 'lib/conditionals/evaluation/dependencyEvaluator'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Constants } from 'lib/constants/constants'
import type { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  getActionIndex,
  getGlobalRegisterIndexWgsl,
  wgslDebugActionRegister,
} from 'lib/gpu/injection/injectUtils'
import {
  indent,
  wgsl,
} from 'lib/gpu/injection/wgslUtils'
import type { GpuConstants } from 'lib/gpu/webgpuTypes'
import type { AKeyValue } from 'lib/optimization/engine/config/keys'
import {
  AKey,
  GLOBAL_REGISTERS_LENGTH,
  GlobalRegister,
} from 'lib/optimization/engine/config/keys'
import {
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { matchesTargetTag } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { getDamageFunction } from 'lib/optimization/engine/damage/damageCalculator'
import type { SortOptionKey } from 'lib/optimization/sortOptions'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  generateSetCombatWgsl,
  generateSetTerminalWgsl,
} from 'lib/sets/setConfigRegistry'
import type {
  CharacterConditionalsController,
  LightConeConditionalsController,
} from 'types/conditionals'
import type { Form } from 'types/form'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function injectUnrolledActions(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  let unrolledActionCallsWgsl = '\n    var comboDmg: f32 = 0;\n'
  let unrolledActionFunctionsWgsl = ''

  // Execute default actions (don't add to comboDmg)
  for (let i = 0; i < context.defaultActions.length; i++) {
    const action = context.defaultActions[i]

    const { actionCall, actionFunction } = unrollAction(i, action, context, gpuParams, false)

    unrolledActionCallsWgsl += actionCall
    unrolledActionFunctionsWgsl += actionFunction

    // Combat stat filters execute after the first default action (includes EHP calculation)
    if (i === 0) {
      unrolledActionCallsWgsl += generateCombatStatFilters(request, context, gpuParams)
    }

    // DEBUG: Copy entire container0 (after combat stat filters for EHP), then copy registers from other actions
    if (gpuParams.DEBUG) {
      if (i === 0) {
        // Copy entire container0 to get all action stats and hit stats (after EHP calculation)
        unrolledActionCallsWgsl += `\n    var debugContainer: array<f32, ${context.maxContainerArrayLength}> = container0;\n\n`
      } else {
        // Copy only registers from actions 1+
        unrolledActionCallsWgsl += generateRegisterCopy(i, action, context)
      }
    }
  }

  // Execute rotation actions (add to comboDmg)
  for (let i = 0; i < context.rotationActions.length; i++) {
    const action = context.rotationActions[i]
    const actionIndex = context.defaultActions.length + i

    const { actionCall, actionFunction } = unrollAction(actionIndex, action, context, gpuParams, true)

    unrolledActionCallsWgsl += actionCall
    unrolledActionFunctionsWgsl += actionFunction

    // DEBUG: Copy registers after execution
    if (gpuParams.DEBUG) {
      unrolledActionCallsWgsl += generateRegisterCopy(actionIndex, action, context)
    }
  }

  // Write comboDmg to global register for debug mode
  const comboGlobalRegIdx = getGlobalRegisterIndexWgsl(GlobalRegister.COMBO_DMG, context)

  if (!gpuParams.DEBUG) {
    unrolledActionCallsWgsl += generateRatingFilters(request, context, gpuParams)
    unrolledActionCallsWgsl += generateSortOptionReturn(request, context)
  } else {
    unrolledActionCallsWgsl += `    debugContainer[${comboGlobalRegIdx}] = comboDmg; // GlobalRegister[COMBO_DMG]\n`
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

const SortOptionToAKey: Partial<Record<SortOptionKey, AKeyValue>> = {
  ATK: AKey.ATK,
  DEF: AKey.DEF,
  HP: AKey.HP,
  SPD: AKey.SPD,
  CR: AKey.CR,
  CD: AKey.CD,
  EHR: AKey.EHR,
  RES: AKey.RES,
  BE: AKey.BE,
  ERR: AKey.ERR,
  OHB: AKey.OHB,
}

// Stats that need their corresponding BOOST key added for sorting/display
const SortOptionBoostKey: Partial<Record<SortOptionKey, AKeyValue>> = {
  CR: AKey.CR_BOOST,
  CD: AKey.CD_BOOST,
}

/**
 * Generates WGSL rating filters (BASIC, SKILL, ULT, etc.) that check dmg{i} variables
 * against user-specified min/max thresholds. Injected after all actions compute but before sort.
 */
function generateRatingFilters(request: Form, context: OptimizerContext, gpuParams: GpuConstants): string {
  const conditions: string[] = []

  for (const sortOption of Object.values(SortOption)) {
    if (!sortOption.minFilterKey || !sortOption.maxFilterKey) continue

    const minVal = request[sortOption.minFilterKey as keyof Form] as number
    const maxVal = request[sortOption.maxFilterKey as keyof Form] as number
    const hasMin = minVal > 0
    const hasMax = maxVal < Constants.MAX_INT

    if (!hasMin && !hasMax) continue

    const actionIndex = context.defaultActions.findIndex((a) => a.actionName === sortOption.key)
    if (actionIndex < 0) continue

    if (hasMin) conditions.push(`dmg${actionIndex} < ${sortOption.minFilterKey}`)
    if (hasMax) conditions.push(`dmg${actionIndex} > ${sortOption.maxFilterKey}`)
  }

  if (conditions.length === 0) return ''

  return `
    // Rating filters (damage min/max)
    if (
      ${conditions.join(' ||\n      ')}
    ) {
      continue;
    }
`
}

/**
 * Generates WGSL for atomic compaction: claims a slot and writes (index, value) to compact buffer.
 */
function compactWrite(valueExpr: string): string {
  return indent(
    `
let slot = atomicAdd(&compactCount, 1u);
if (slot < COMPACT_LIMIT) {
  compactResults[slot] = CompactEntry(index, ${valueExpr});
}
`,
    3,
  )
}

/**
 * Generates WGSL code to output the result based on the selected sort option.
 * Currently handles: basic stats + COMBO
 */
function generateSortOptionReturn(request: Form, context: OptimizerContext): string {
  const sortOption = SortOption[request.resultSort!]
  const sortKey = sortOption.key

  // Basic stats (not isComputedRating)
  // - statDisplay == 1 (basic mode): use c.{property}
  // - statDisplay == 0 (combat mode): use container0[stat index]
  if (!sortOption.isComputedRating) {
    const aKey = SortOptionToAKey[sortKey]
    if (aKey === undefined) {
      throw new Error(`GPU sort: no AKey mapping for basic stat '${sortKey}'`)
    }

    const config = context.defaultActions[0].config
    const statIndex = getActionIndex(SELF_ENTITY_INDEX, aKey, config)
    const boostKey = SortOptionBoostKey[sortKey]
    const boostExpr = boostKey !== undefined
      ? ` + container0[${getActionIndex(SELF_ENTITY_INDEX, boostKey, config)}]`
      : ''

    return `
    if (statDisplay == 1) {
      if (c.${sortKey} > threshold) {
${compactWrite(`c.${sortKey}`)}
      }
    } else {
      let sortValue = container0[${statIndex}]${boostExpr};
      if (sortValue > threshold) {
${compactWrite('sortValue')}
      }
    }
`
  }

  if (sortKey === SortOption.COMBO.key) {
    return `
    if (comboDmg > threshold) {
${compactWrite('comboDmg')}
    }
`
  }

  if (sortKey === SortOption.EHP.key) {
    return `
    if (ehp0 > threshold) {
${compactWrite('ehp0')}
    }
`
  }

  // Ability damage sorts - find matching default action
  const matchingIndex = context.defaultActions.findIndex((action) => {
    return action.actionName === sortKey
  })

  if (matchingIndex >= 0) {
    return `
    if (dmg${matchingIndex} > threshold) {
${compactWrite(`dmg${matchingIndex}`)}
    }
`
  }

  throw new Error(`GPU sort: unsupported sort option '${sortKey}'`)
}

function generateRegisterCopy(actionIndex: number, action: OptimizerAction, context: OptimizerContext): string {
  const registersOffset = context.maxContainerArrayLength - (context.allActions.length + GLOBAL_REGISTERS_LENGTH + context.outputRegistersLength)
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
function unrollAction(index: number, action: OptimizerAction, context: OptimizerContext, gpuParams: GpuConstants, addToComboDmg: boolean) {
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

  const damageCalculationWgsl = indent(unrollDamageCalculations(action, context, gpuParams), 1)

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

  const setCombatWgsl = generateSetCombatWgsl(action, context)
  const setTerminalWgsl = generateSetTerminalWgsl(action, context)

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
${addToComboDmg ? `    comboDmg += dmg${index};\n` : ''}`
  
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

  ${setCombatWgsl}

  // Set the Action-scope stats, to be added to the Hit-scope stats later
  ${unrollEntityBaseStats(action)}

  ${basicConditionalsWgsl}
  
  ${conditionalSequenceWgsl}
  
  ${characterConditionalWgsl}
  
  ${lightConeConditionalWgsl}

  ${setTerminalWgsl}
  
  ${damageCalculationWgsl}
  
  // Combat stat filters
  
  // Basic stat filters
  
  // Rating stat filters
  
  // Return value
  
  return comboDmg + comboHeal + comboShield;
}
  `

  return { actionCall, actionFunction }
}

function unrollDamageCalculations(action: OptimizerAction, context: OptimizerContext, gpuParams: GpuConstants) {
  let code = ''

  for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
    const hit = action.hits![hitIndex]
    const damageFunction = getDamageFunction(hit.damageFunctionType)
    code += damageFunction.wgsl(action, hitIndex, context)
  }

  if (gpuParams.DEBUG) {
    // Set action register with total combo damage
    code += wgslDebugActionRegister(action, context, 'comboDmg + comboHeal + comboShield') + '\n'
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
      const atkScaling = entity.memosprite ? (entity.memoBaseAtkScaling ?? 0) : 1
      const defScaling = entity.memosprite ? (entity.memoBaseDefScaling ?? 0) : 1
      const hpScaling = entity.memosprite ? (entity.memoBaseHpScaling ?? 0) : 1
      const spdScaling = entity.memosprite ? (entity.memoBaseSpdScaling ?? 0) : 1
      // dprint-ignore
      lines.push(
        `\
  // Entity ${entityIndex}: ${entityName} | Base index: ${baseIndex}
  ${containerActionVal(entityIndex, AKey.ATK, config)} += diffATK * ${atkScaling} + ${entity.memoBaseAtkFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.DEF, config)} += diffDEF * ${defScaling} + ${entity.memoBaseDefFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.HP, config)} += diffHP * ${hpScaling} + ${entity.memoBaseHpFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.SPD, config)} += diffSPD * ${spdScaling} + ${entity.memoBaseSpdFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.CD, config)} += diffCD;
  ${containerActionVal(entityIndex, AKey.CR, config)} += diffCR;
  ${containerActionVal(entityIndex, AKey.EHR, config)} += diffEHR;
  ${containerActionVal(entityIndex, AKey.RES, config)} += diffRES;
  ${containerActionVal(entityIndex, AKey.BE, config)} += diffBE;
  ${containerActionVal(entityIndex, AKey.ERR, config)} += diffERR;
  ${containerActionVal(entityIndex, AKey.OHB, config)} += diffOHB;

  ${containerActionVal(entityIndex, AKey.ATK, config)} += ${containerActionVal(entityIndex, AKey.ATK_P, config)} * ${entity.baseAtk};
  ${containerActionVal(entityIndex, AKey.DEF, config)} += ${containerActionVal(entityIndex, AKey.DEF_P, config)} * ${entity.baseDef};
  ${containerActionVal(entityIndex, AKey.HP, config)} += ${containerActionVal(entityIndex, AKey.HP_P, config)} * ${entity.baseHp};
  ${containerActionVal(entityIndex, AKey.SPD, config)} += ${containerActionVal(entityIndex, AKey.SPD_P, config)} * ${entity.baseSpd};
        
  ${containerActionVal(entityIndex, AKey.PHYSICAL_DMG_BOOST, config)} += (*p_c).PHYSICAL_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.FIRE_DMG_BOOST, config)} += (*p_c).FIRE_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.ICE_DMG_BOOST, config)} += (*p_c).ICE_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.LIGHTNING_DMG_BOOST, config)} += (*p_c).LIGHTNING_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.WIND_DMG_BOOST, config)} += (*p_c).WIND_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.QUANTUM_DMG_BOOST, config)} += (*p_c).QUANTUM_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.IMAGINARY_DMG_BOOST, config)} += (*p_c).IMAGINARY_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.ELATION, config)} += (*p_c).ELATION;
`,
      )
    }
  }
  return lines.join('\n')
}

/**
 * Generates combat stat filters that execute after the first default action.
 * Uses conditional extraction - only extracts stats that have active min/max filters.
 */
function generateCombatStatFilters(request: Form, context: OptimizerContext, gpuParams: GpuConstants): string {
  const action = context.defaultActions[0]
  const config = action.config

  const extractions: string[] = []
  const conditions: string[] = []

  // Helper to add filter for a stat - only extracts if filter is active
  const addStatFilter = (
    varName: string,
    key: AKeyValue,
    minKey: keyof Form,
    maxKey: keyof Form,
  ) => {
    const minVal = request[minKey] as number
    const maxVal = request[maxKey] as number
    const hasMin = minVal > 0
    const hasMax = maxVal < Constants.MAX_INT

    if (hasMin || hasMax) {
      const index = getActionIndex(SELF_ENTITY_INDEX, key, config)
      extractions.push(`let ${varName} = container0[${index}];`)
      if (hasMin) conditions.push(`${varName} < ${minKey}`)
      if (hasMax) conditions.push(`${varName} > ${maxKey}`)
    }
  }

  // Helper to add filter for a stat that combines a base key + boost key
  const addBoostedStatFilter = (
    varName: string,
    key: AKeyValue,
    boostKey: AKeyValue,
    minKey: keyof Form,
    maxKey: keyof Form,
  ) => {
    const minVal = request[minKey] as number
    const maxVal = request[maxKey] as number
    const hasMin = minVal > 0
    const hasMax = maxVal < Constants.MAX_INT

    if (hasMin || hasMax) {
      const index = getActionIndex(SELF_ENTITY_INDEX, key, config)
      const boostIndex = getActionIndex(SELF_ENTITY_INDEX, boostKey, config)
      extractions.push(`let ${varName} = container0[${index}] + container0[${boostIndex}];`)
      if (hasMin) conditions.push(`${varName} < ${minKey}`)
      if (hasMax) conditions.push(`${varName} > ${maxKey}`)
    }
  }

  // Add filters for each combat stat
  addStatFilter('fSpd', AKey.SPD, 'minSpd', 'maxSpd')
  addStatFilter('fHp', AKey.HP, 'minHp', 'maxHp')
  addStatFilter('fAtk', AKey.ATK, 'minAtk', 'maxAtk')
  addStatFilter('fDef', AKey.DEF, 'minDef', 'maxDef')
  addBoostedStatFilter('fCr', AKey.CR, AKey.CR_BOOST, 'minCr', 'maxCr')
  addBoostedStatFilter('fCd', AKey.CD, AKey.CD_BOOST, 'minCd', 'maxCd')
  addStatFilter('fEhr', AKey.EHR, 'minEhr', 'maxEhr')
  addStatFilter('fRes', AKey.RES, 'minRes', 'maxRes')
  addStatFilter('fBe', AKey.BE, 'minBe', 'maxBe')
  addStatFilter('fErr', AKey.ERR, 'minErr', 'maxErr')

  // EHP calculation for all entities (needed for filtering or sorting)
  if (context.shaderVariables.needsEhp) {
    for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
      const hpIndex = getActionIndex(entityIndex, AKey.HP, config)
      const defIndex = getActionIndex(entityIndex, AKey.DEF, config)
      const dmgRedIndex = getActionIndex(entityIndex, AKey.DMG_RED, config)
      const ehpIndex = getActionIndex(entityIndex, AKey.EHP, config)

      extractions.push(`let ehpHp${entityIndex} = container0[${hpIndex}];`)
      extractions.push(`let ehpDef${entityIndex} = container0[${defIndex}];`)
      extractions.push(`let ehpDmgRed${entityIndex} = container0[${dmgRedIndex}];`)
      extractions.push(
        `let ehp${entityIndex} = ehpHp${entityIndex} / (1.0 - ehpDef${entityIndex} / (ehpDef${entityIndex} + 200.0 + 10.0 * f32(enemyLevel))) / (1.0 - ehpDmgRed${entityIndex});`,
      )
      extractions.push(`container0[${ehpIndex}] = ehp${entityIndex};`)
    }

    // EHP filtering uses entity 0 (primary character)
    if (request.minEhp > 0) conditions.push(`ehp0 < minEhp`)
    if (request.maxEhp < Constants.MAX_INT) conditions.push(`ehp0 > maxEhp`)
  }

  if (extractions.length === 0) return ''

  if (conditions.length === 0) {
    return `
    // Combat stat extractions (after action 0)
    ${extractions.join('\n    ')}
`
  }

  return `
    // Combat stat filters (after action 0)
    ${extractions.join('\n    ')}
    if (
      ${conditions.join(' ||\n      ')}
    ) {
      continue;
    }
`
}
