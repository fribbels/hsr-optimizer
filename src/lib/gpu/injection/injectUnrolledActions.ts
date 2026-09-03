import { evaluateDependencyOrder } from 'lib/conditionals/evaluation/dependencyEvaluator'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Constants } from 'lib/constants/constants'
import type { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  generateBasicStatExpression,
  getDisplayEntityIndex,
} from 'lib/gpu/injection/displayStats'
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
  OutputTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { matchesTargetTag } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { getDamageFunction } from 'lib/optimization/engine/damage/damageCalculator'
import { AbilityMeta } from 'lib/optimization/rotation/turnAbilityConfig'
import type {
  SortOptionKey,
  SortOptionProperties,
} from 'lib/optimization/sortOptions'
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
  const { calls, functions } = generateUnrolledActions(request, context, gpuParams)

  return wgsl
    .replace('/* INJECT UNROLLED ACTIONS */', calls)
    .replace('/* INJECT UNROLLED ACTION FUNCTIONS */', functions)
}

function generateUnrolledActions(request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  let calls = `
    var comboDmg: f32 = 0;
    var comboHeal: f32 = 0;
    var comboShield: f32 = 0;
    var comboBuff: f32 = 0;
`
  let functions = ''
  const defaultActionsRecordBuff = context.defaultActions.some(recordsBuffOutput)
  const displayActionIndex = context.defaultActions.length - 1
  const displayFilters = generateCombatStatFilters(request, context, displayActionIndex)
  const abilitySortIndex = gpuParams.DEBUG ? -1 : getAbilitySortCompletionIndex(request, context)
  const abilitySortCompletionIndex = displayFilters && abilitySortIndex >= 0
    ? Math.max(abilitySortIndex, displayActionIndex)
    : abilitySortIndex

  for (let i = 0; i < context.defaultActions.length; i++) {
    const action = context.defaultActions[i]
    const result = unrollAction(i, action, context, gpuParams, false)

    calls += result.actionCall
    functions += result.actionFunction

    if (i === displayActionIndex) {
      calls += displayFilters
    }

    // Apply rating filters once every required action is calculated.
    if (i === abilitySortCompletionIndex) {
      calls += generateRatingFilters(request, context)
      calls += generateSortOptionReturn(request, context, displayActionIndex)
      calls += '    continue;\n'
      return { calls, functions }
    }
  }

  if (defaultActionsRecordBuff) {
    calls += '    let defaultComboBuff = comboBuff;\n'
  }

  for (let i = 0; i < context.rotationActions.length; i++) {
    const action = context.rotationActions[i]
    const actionIndex = context.defaultActions.length + i
    const result = unrollAction(actionIndex, action, context, gpuParams, true)

    calls += result.actionCall
    functions += result.actionFunction
  }

  if (defaultActionsRecordBuff) {
    calls += '    comboBuff = defaultComboBuff;\n'
  }

  if (!gpuParams.DEBUG) {
    calls += generateRatingFilters(request, context)
    calls += generateSortOptionReturn(request, context, displayActionIndex)
  } else {
    calls += generateDebugContainer(context)
    const comboGlobalRegIdx = getGlobalRegisterIndexWgsl(GlobalRegister.COMBO_DMG, context)
    const healGlobalRegIdx = getGlobalRegisterIndexWgsl(GlobalRegister.COMBO_HEAL, context)
    const shieldGlobalRegIdx = getGlobalRegisterIndexWgsl(GlobalRegister.COMBO_SHIELD, context)
    const buffGlobalRegIdx = getGlobalRegisterIndexWgsl(GlobalRegister.COMBO_BUFF, context)
    calls += `    debugContainer[${comboGlobalRegIdx}] = comboDmg; // GlobalRegister[COMBO_DMG]\n`
    calls += `    debugContainer[${healGlobalRegIdx}] = comboHeal; // GlobalRegister[COMBO_HEAL]\n`
    calls += `    debugContainer[${shieldGlobalRegIdx}] = comboShield; // GlobalRegister[COMBO_SHIELD]\n`
    calls += `    debugContainer[${buffGlobalRegIdx}] = comboBuff; // GlobalRegister[COMBO_BUFF]\n`
    calls += `
    results[indexGlobal * CYCLES_PER_INVOCATION + i] = debugContainer;
`
  }

  return { calls, functions }
}

function getAbilitySortCompletionIndex(request: Form, context: OptimizerContext): number {
  const sortOption = SortOption[request.resultSort!]
  if (
    !sortOption?.isComputedRating
    || sortOption.statKey != null
    || sortOption.globalRegisterIndex != null
  ) {
    return -1
  }

  let completionIndex = context.defaultActions.findIndex((action) => action.actionName === sortOption.key)
  if (completionIndex < 0) return -1

  for (const filterSortOption of Object.values(SortOption)) {
    const bounds = getRatingFilterBounds(request, filterSortOption)
    if (!bounds || (!bounds.hasMin && !bounds.hasMax)) continue

    const actionIndex = context.defaultActions.findIndex((action) => action.actionName === filterSortOption.key)
    completionIndex = Math.max(completionIndex, actionIndex)
  }

  return completionIndex
}

function recordsBuffOutput(action: OptimizerAction): boolean {
  return action.hits?.some((hit) => hit.recorded !== false && hit.outputTag === OutputTag.BUFF) ?? false
}

function getActionOutputWgsl(action: OptimizerAction): string {
  switch (AbilityMeta[action.actionType].outputTag) {
    case OutputTag.DAMAGE:
      return 'comboDmg'
    case OutputTag.HEAL:
      return 'comboHeal'
    case OutputTag.SHIELD:
      return 'comboShield'
    case OutputTag.BUFF:
      return 'comboBuff'
    default:
      return '0.0'
  }
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

/** Generates active ability rating filters. */
function generateRatingFilters(request: Form, context: OptimizerContext): string {
  const conditions: string[] = []

  for (const sortOption of Object.values(SortOption)) {
    const bounds = getRatingFilterBounds(request, sortOption)
    if (!bounds || (!bounds.hasMin && !bounds.hasMax)) continue

    const actionIndex = context.defaultActions.findIndex((a) => a.actionName === sortOption.key)
    if (actionIndex < 0) continue

    if (bounds.hasMin) conditions.push(`dmg${actionIndex} < ${sortOption.minFilterKey}`)
    if (bounds.hasMax) conditions.push(`dmg${actionIndex} > ${sortOption.maxFilterKey}`)
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

function getRatingFilterBounds(request: Form, sortOption: SortOptionProperties) {
  if (!sortOption.minFilterKey || !sortOption.maxFilterKey) return null

  const minVal = request[sortOption.minFilterKey as keyof Form] as number
  const maxVal = request[sortOption.maxFilterKey as keyof Form] as number
  return {
    hasMin: minVal > 0,
    hasMax: maxVal < Constants.MAX_INT,
  }
}

/**
 * Generates WGSL for atomic compaction: claims a slot and writes (index, value) to compact buffer.
 * Tuple mode: packs (workgroup_index_in_batch << 16 | threadLocalOffset) into u32.
 *   CPU decodes via assignment table to reconstruct absolute relic positions.
 * Naive mode: dispatch-local index (CPU adds offset on readback).
 */
function writeCompactResult(valueExpr: string): string {
  return indent(
    `
// Tuple mode: pack (workgroup_in_batch, threadLocalOffset) into u32 so the CPU can
// reconstruct absolute relic indices via the assignment table.
// Naive mode: use dispatch-local index directly (CPU adds the batch offset on readback).
let compactIndex: u32 = select(
  u32(indexGlobal * CYCLES_PER_INVOCATION + i),
  (workgroup_index << PACKED_INDEX_LOCAL_BITS) | u32(i32(local_invocation_index) * CYCLES_PER_INVOCATION + i),
  TUPLE_MODE == 1,
);
let slot = atomicAdd(&compactCount, 1u);
if (slot < COMPACT_LIMIT) {
  compactResults[slot] = CompactEntry(compactIndex, ${valueExpr});
}
`,
    3,
  )
}

/**
 * Generates WGSL code to output the result based on the selected sort option.
 * Currently handles: basic stats + COMBO
 */
function generateSortOptionReturn(request: Form, context: OptimizerContext, displayActionIndex: number): string {
  const sortOption = SortOption[request.resultSort!]
  const sortKey = sortOption.key
  const displayAction = context.defaultActions[displayActionIndex]
  const config = displayAction.config
  const container = `container${displayActionIndex}`

  // Basic stats (not isComputedRating)
  // - statDisplay == 1 (basic mode): use c.{property}
  // - statDisplay == 0 (combat mode): use the displayed action container
  if (!sortOption.isComputedRating) {
    const aKey = SortOptionToAKey[sortKey]
    if (aKey === undefined) {
      throw new Error(`GPU sort: no AKey mapping for basic stat '${sortKey}'`)
    }

    const displayEntityIndex = getDisplayEntityIndex(request, config)
    const statIndex = getActionIndex(displayEntityIndex, aKey, config)
    const boostKey = SortOptionBoostKey[sortKey]
    const boostExpr = boostKey !== undefined
      ? ` + ${container}[${getActionIndex(displayEntityIndex, boostKey, config)}]`
      : ''
    const basicSortValue = generateBasicStatExpression(request, config, sortKey)

    return `
    if (statDisplay == 1) {
      if (${basicSortValue} > threshold) {
${writeCompactResult(basicSortValue)}
      }
    } else {
      let sortValue = ${container}[${statIndex}]${boostExpr};
      if (sortValue > threshold) {
${writeCompactResult('sortValue')}
      }
    }
`
  }

  if (sortKey === SortOption.COMBO.key) {
    return `
    if (comboDmg > threshold) {
${writeCompactResult('comboDmg')}
    }
`
  }

  if (sortKey === SortOption.COMBO_HEAL.key) {
    return `
    if (comboHeal > threshold) {
${writeCompactResult('comboHeal')}
    }
`
  }

  if (sortKey === SortOption.COMBO_SHIELD.key) {
    return `
    if (comboShield > threshold) {
${writeCompactResult('comboShield')}
    }
`
  }

  if (sortKey === SortOption.COMBO_BUFF.key) {
    return `
    if (comboBuff > threshold) {
${writeCompactResult('comboBuff')}
    }
`
  }

  if (sortKey === SortOption.EHP.key) {
    const displayEntityIndex = getDisplayEntityIndex(request, config)
    const ehpIndex = getActionIndex(displayEntityIndex, AKey.EHP, config)
    return `
    if (${container}[${ehpIndex}] > threshold) {
${writeCompactResult(`${container}[${ehpIndex}]`)}
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
${writeCompactResult(`dmg${matchingIndex}`)}
    }
`
  }

  throw new Error(`Unhandled sort option: ${sortKey}`)
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

function generateDebugContainer(context: OptimizerContext): string {
  const debugActionIndex = context.defaultActions.length - 1
  const debugAction = context.defaultActions[debugActionIndex]
  if (!debugAction) throw new Error('WebGPU debug output requires at least one default action')

  let code = `
    // Match simulateBuild
    var debugContainer: array<f32, ${context.maxContainerArrayLength}> = container${debugActionIndex};
`

  if (context.shaderVariables.needsEhp) {
    const { statements } = generateEhpStatements('debugContainer', debugAction, 'debugEhp')
    code += `    ${statements.join('\n    ')}\n`
  }

  for (let i = 0; i < context.defaultActions.length; i++) {
    if (i !== debugActionIndex) code += generateRegisterCopy(i, context.defaultActions[i], context)
  }
  for (let i = 0; i < context.rotationActions.length; i++) {
    const actionIndex = context.defaultActions.length + i
    code += generateRegisterCopy(actionIndex, context.rotationActions[i], context)
  }

  return code
}

// dprint-ignore
function unrollAction(index: number, action: OptimizerAction, context: OptimizerContext, gpuParams: GpuConstants, isRotationAction: boolean) {
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
  const comboBuffUpdateWgsl = recordsBuffOutput(action) ? '*p_comboBuff = comboBuff;' : ''
  const actionOutputWgsl = getActionOutputWgsl(action)

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

  let actionCall: string
  let actionFunction: string

  if (isRotationAction) {
    actionCall = `
    var container${index}: array<f32, ${context.maxContainerArrayLength}> = precomputedStats[${index}];
    let dmg${index} = unrolledAction${index}(
      &comboDmg,
      &comboHeal,
      &comboShield,
      &comboBuff,
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
`

    actionFunction = `
fn unrolledAction${index}(
  p_comboDmg: ptr<function, f32>,
  p_comboHeal: ptr<function, f32>,
  p_comboShield: ptr<function, f32>,
  p_comboBuff: ptr<function, f32>,
  p_container: ptr<function, array<f32, ${context.maxContainerArrayLength}>>,
  p_sets: ptr<function, SetMatches>,
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
) -> f32 { // Action ${index} - ${action.actionName} (rotation)
  let setConditionals = action${index}.setConditionals;
  var state = ConditionalState();
  let p_state = &state;
  state.actionIndex = ${index};

  var comboDmg = 0.0;
  var comboHeal = 0.0;
  var comboShield = 0.0;
  var comboBuff = 0.0;

  ${setCombatWgsl}

  // Set the Action-scope stats, to be added to the Hit-scope stats later
  ${unrollEntityBaseStats(action)}

  ${basicConditionalsWgsl}

  ${conditionalSequenceWgsl}

  ${characterConditionalWgsl}

  ${lightConeConditionalWgsl}

  ${setTerminalWgsl}

  ${damageCalculationWgsl}

  // Accumulate into outer scope accumulators by output type
  *p_comboDmg += comboDmg;
  *p_comboHeal += comboHeal;
  *p_comboShield += comboShield;
  ${comboBuffUpdateWgsl}

  return ${actionOutputWgsl};
}
  `
  } else {
    actionCall = `
    var container${index}: array<f32, ${context.maxContainerArrayLength}> = precomputedStats[${index}];
    let dmg${index} = unrolledAction${index}(
      &comboBuff,
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
`

    actionFunction = `
fn unrolledAction${index}(
  p_comboBuff: ptr<function, f32>,
  p_container: ptr<function, array<f32, ${context.maxContainerArrayLength}>>,
  p_sets: ptr<function, SetMatches>,
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
  var comboBuff = 0.0;

  ${setCombatWgsl}

  // Set the Action-scope stats, to be added to the Hit-scope stats later
  ${unrollEntityBaseStats(action)}

  ${basicConditionalsWgsl}

  ${conditionalSequenceWgsl}

  ${characterConditionalWgsl}

  ${lightConeConditionalWgsl}

  ${setTerminalWgsl}

  ${damageCalculationWgsl}

  ${comboBuffUpdateWgsl}

  return ${actionOutputWgsl};
}
  `
  }

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
    code += wgslDebugActionRegister(action, context, getActionOutputWgsl(action)) + '\n'
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
 * Generates combat stat filters for the displayed action.
 * Uses conditional extraction - only extracts stats that have active min/max filters.
 */
function generateCombatStatFilters(request: Form, context: OptimizerContext, displayActionIndex: number): string {
  const action = context.defaultActions[displayActionIndex]
  const config = action.config
  const container = `container${displayActionIndex}`
  const displayEntityIndex = getDisplayEntityIndex(request, config)
  const isCombatMode = request.statDisplay === 'combat'

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
      const index = getActionIndex(displayEntityIndex, key, config)
      extractions.push(`let ${varName} = ${container}[${index}];`)
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
      const index = getActionIndex(displayEntityIndex, key, config)
      const boostIndex = getActionIndex(displayEntityIndex, boostKey, config)
      extractions.push(`let ${varName} = ${container}[${index}] + ${container}[${boostIndex}];`)
      if (hasMin) conditions.push(`${varName} < ${minKey}`)
      if (hasMax) conditions.push(`${varName} > ${maxKey}`)
    }
  }

  if (isCombatMode) {
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
  }

  // EHP calculation for all entities (needed for filtering or sorting)
  if (context.shaderVariables.needsEhp) {
    const ehp = generateEhpStatements(container, action, 'filterEhp')
    extractions.push(...ehp.statements)
    const ehpIndex = getActionIndex(displayEntityIndex, AKey.EHP, config)

    if (request.minEhp > 0) conditions.push(`${container}[${ehpIndex}] < minEhp`)
    if (request.maxEhp < Constants.MAX_INT) conditions.push(`${container}[${ehpIndex}] > maxEhp`)
  }

  if (extractions.length === 0) return ''

  if (conditions.length === 0) {
    return `
    // Combat stat extractions
    ${extractions.join('\n    ')}
`
  }

  return `
    // Combat stat filters
    ${extractions.join('\n    ')}
    if (
      ${conditions.join(' ||\n      ')}
    ) {
      continue;
    }
`
}

function generateEhpStatements(containerName: string, action: OptimizerAction, variablePrefix: string) {
  const statements: string[] = []

  for (let entityIndex = 0; entityIndex < action.config.entitiesLength; entityIndex++) {
    const hpIndex = getActionIndex(entityIndex, AKey.HP, action.config)
    const defIndex = getActionIndex(entityIndex, AKey.DEF, action.config)
    const dmgRedIndex = getActionIndex(entityIndex, AKey.DMG_RED, action.config)
    const ehpIndex = getActionIndex(entityIndex, AKey.EHP, action.config)
    const suffix = `${variablePrefix}${entityIndex}`
    const hp = `${suffix}Hp`
    const def = `${suffix}Def`
    const dmgRed = `${suffix}DmgRed`
    const value = `${suffix}Value`

    statements.push(`let ${hp} = ${containerName}[${hpIndex}];`)
    statements.push(`let ${def} = ${containerName}[${defIndex}];`)
    statements.push(`let ${dmgRed} = ${containerName}[${dmgRedIndex}];`)
    statements.push(`let ${value} = ${hp} / (1.0 - ${def} / (${def} + 200.0 + 10.0 * f32(enemyLevel))) / (1.0 - ${dmgRed});`)
    statements.push(`${containerName}[${ehpIndex}] = ${value};`)
  }

  return { statements }
}
