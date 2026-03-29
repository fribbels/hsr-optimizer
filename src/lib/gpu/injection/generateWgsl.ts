import { Constants } from 'lib/constants/constants'
import { generateBasicSetEffectsWgsl } from 'lib/gpu/injection/generateBasicSetEffects'
import { injectComputedStats } from 'lib/gpu/injection/injectComputedStats'
import { generateDynamicConditionals } from 'lib/gpu/injection/injectConditionals'
import { injectSettings } from 'lib/gpu/injection/injectSettings'
import { injectUnrolledActions } from 'lib/gpu/injection/injectUnrolledActions'
import { generateSetBitConstants } from 'lib/gpu/injection/setIndexMap'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { uniformCompatible } from 'lib/gpu/webgpuDevice'
import type {
  GpuConstants,
  RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import computeShader from 'lib/gpu/wgsl/computeShader.wgsl?raw'
import structs from 'lib/gpu/wgsl/structs.wgsl?raw'
import { STATS_LENGTH } from 'lib/optimization/engine/config/statsConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  generateSetConditionalsInitializer,
  generateSetConditionalsStruct,
} from 'lib/sets/setConfigRegistry'
import type { Form } from 'types/form'
import type {
  OptimizerContext,
  ShaderVariables,
} from 'types/optimizer'

function generateShaderVariables(context: OptimizerContext, request: Form, gpuParams: GpuConstants) {
  // All sort options need all actions generated for proper stat computation
  const actionLength = context.defaultActions.length + context.rotationActions.length

  // EHP is needed for filtering, sorting, or debug mode
  const needsEhpFilter = request.minEhp > 0 || request.maxEhp < Constants.MAX_INT
  const needsEhpSort = request.resultSort === SortOption.EHP.key
  const needsEhp = needsEhpFilter || needsEhpSort || gpuParams.DEBUG

  const shaderVariables: ShaderVariables = {
    actionLength,
    needsEhp,
  }

  return shaderVariables
}

export function generateWgsl(context: OptimizerContext, request: Form, relics: RelicsByPart, gpuParams: GpuConstants) {
  let wgsl = ''

  context.shaderVariables = generateShaderVariables(context, request, gpuParams)

  wgsl = injectSettings(wgsl, context, request, relics)
  wgsl = injectComputeShader(wgsl)
  wgsl = injectUnrolledActions(wgsl, request, context, gpuParams)
  wgsl = injectConditionalsNew(wgsl, request, context, gpuParams)
  wgsl = injectGpuParams(wgsl, request, context, gpuParams)
  wgsl = injectBasicFilters(wgsl, request)
  wgsl = injectSetFilters(wgsl, request)
  wgsl = injectComputedStats(wgsl)

  return wgsl
}

function injectConditionalsNew(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const actionLength = context.shaderVariables.actionLength
  const containerLength = context.maxContainerArrayLength
  const calculationsPerAction = containerLength / STATS_LENGTH

  const statsLength = STATS_LENGTH

  // Generate precomputed stats buffer data
  const precomputedStatsData = new Float32Array(actionLength * containerLength)

  for (let i = 0; i < actionLength; i++) {
    const action = i < context.defaultActions.length
      ? context.defaultActions[i]
      : context.rotationActions[i - context.defaultActions.length]

    const offset = i * containerLength
    // Copy full container (stats + registers)
    precomputedStatsData.set(action.precomputedStats.a.subarray(0, containerLength), offset)
  }

  // Store for later use in pipeline creation
  context.precomputedStatsData = precomputedStatsData

  const precomputedStatsAddressSpace = uniformCompatible() ? 'uniform' : 'storage, read'

  // Buffer declaration
  const bufferDeclaration = `
@group(1) @binding(3) var<${precomputedStatsAddressSpace}> precomputedStats : array<array<f32, ${containerLength}>, ${actionLength}>;
`

  let actionsDefinition = `
const actionCount = ${actionLength};
const calculationsPerAction = ${calculationsPerAction};
const maxEntitiesCount = ${context.maxEntitiesCount};
const maxHitsCount = ${context.maxHitsCount};
const statsLength = ${statsLength};
`

  for (let i = 0; i < actionLength; i++) {
    const action = i < context.defaultActions.length ? context.defaultActions[i] : context.rotationActions[i - context.defaultActions.length]

    actionsDefinition += `
const action${i} = Action( // ${action.actionIndex} ${action.actionName}
  SetConditionals(
    ${generateSetConditionalsInitializer(action.setConditionals, gpuParams.DEBUG)}
  ),
);`
  }

  wgsl = wgsl.replace('/* INJECT ACTIONS DEFINITION */', bufferDeclaration + actionsDefinition)

  // Combat conditionals

  wgsl += generateDynamicConditionals(request, context)

  return wgsl
}

function injectComputeShader(wgsl: string) {
  wgsl += generateSetBitConstants()
  const basicSetEffects = generateBasicSetEffectsWgsl()
  const injectedComputeShader = computeShader.replace('/* INJECT BASIC SET EFFECTS */', basicSetEffects)
  const injectedStructs = structs.replace('/* INJECT SET_CONDITIONALS_STRUCT */', generateSetConditionalsStruct())
  wgsl += `
${injectedComputeShader}

${injectedStructs}
  `
  return wgsl
}

function filterFn(request: Form) {
  return (text: string) => {
    if (text.length === 0) return text
    const [, , threshold] = text.split(/[><]/).flatMap((x) => x.split('.')).map((x) => x.trim())
    const min = threshold.includes('min')
    const max = threshold.includes('max')
    const value = request[threshold as keyof Form]

    if (max && (value == null || value === Constants.MAX_INT)) return ''
    if (min && (value == null || value === 0)) return ''

    return text
  }
}

function format(text: string, levels: number = 2) {
  return indent(text.length > 0 ? text : 'false', levels)
}

function injectSetFilters(wgsl: string, request: Form) {
  const hasRelicFilter = (request.relicSets?.length ?? 0) > 0
  const hasOrnamentFilter = (request.ornamentSets?.length ?? 0) > 0

  // Strip unused binding declarations so auto layout doesn't expect them
  if (!hasRelicFilter) {
    wgsl = wgsl.replace('@group(1) @binding(2) var<storage> relicSetSolutionsMatrix : array<i32>;', '')
  }
  if (!hasOrnamentFilter) {
    wgsl = wgsl.replace('@group(1) @binding(1) var<storage> ornamentSetSolutionsMatrix : array<i32>;', '')
  }

  if (!hasRelicFilter && !hasOrnamentFilter) {
    return wgsl.replace('/* INJECT SET FILTERS */', '')
  }

  const conditions: string[] = []
  if (hasRelicFilter) {
    conditions.push('((relicSetSolutionsMatrix[relicSetIndex >> 5u] >> (relicSetIndex & 31u)) & 1) == 0')
  }
  if (hasOrnamentFilter) {
    conditions.push('((ornamentSetSolutionsMatrix[ornamentSetIndex >> 5u] >> (ornamentSetIndex & 31u)) & 1) == 0')
  }

  // CTRL+ F: RESULTS ASSIGNMENT
  return wgsl.replace(
    '/* INJECT SET FILTERS */',
    indent(
      `
if (${conditions.join('\n || ')}) {
  continue;
}
  `,
      2,
    ),
  )
}

function injectBasicFilters(wgsl: string, request: Form) {
  const sortOption = SortOption[request.resultSort!]
  const sortKey: string = sortOption.key
  const sortOptionComputed = sortOption.isComputedRating
  const filter = filterFn(request)

  // For basic stats, threshold check is here. For computed ratings (COMBO, damage types),
  // threshold check is in generateSortOptionReturn
  let sortString = ''
  if (!sortOptionComputed) {
    sortString = `c.${sortKey} < threshold`
  }

  const basicFilters = [
    filter('c.SPD < minSpd'),
    filter('c.SPD > maxSpd'),
    filter('c.HP  < minHp'),
    filter('c.HP  > maxHp'),
    filter('c.ATK < minAtk'),
    filter('c.ATK > maxAtk'),
    filter('c.DEF < minDef'),
    filter('c.DEF > maxDef'),
    filter('c.CR  < minCr'),
    filter('c.CR  > maxCr'),
    filter('c.CD  < minCd'),
    filter('c.CD  > maxCd'),
    filter('c.EHR < minEhr'),
    filter('c.EHR > maxEhr'),
    filter('c.RES < minRes'),
    filter('c.RES > maxRes'),
    filter('c.BE  < minBe'),
    filter('c.BE  > maxBe'),
    filter('c.ERR < minErr'),
    filter('c.ERR > maxErr'),
    filter(sortString),
  ].filter((str) => str.length > 0).join(' ||\n')

  // CTRL+ F: RESULTS ASSIGNMENT
  wgsl = wgsl.replace(
    '/* INJECT BASIC STAT FILTERS */',
    indent(
      `
if (statDisplay == 1) {
  if (
${format(basicFilters)}
  ) {
    continue;
  }
}
  `,
      2,
    ),
  )

  return wgsl
}

function injectGpuParams(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const cyclesPerInvocation = gpuParams.DEBUG ? 1 : gpuParams.CYCLES_PER_INVOCATION

  wgsl = wgsl.replace(
    '/* INJECT GPU PARAMS */',
    `
const WORKGROUP_SIZE = ${gpuParams.WORKGROUP_SIZE};
const BLOCK_SIZE = ${gpuParams.BLOCK_SIZE};
const CYCLES_PER_INVOCATION = ${cyclesPerInvocation};
const DEBUG = ${gpuParams.DEBUG ? 1 : 0};
const COMPACT_LIMIT = ${gpuParams.COMPACT_LIMIT}u;
  `,
  )

  const compactDeclarations = `
struct CompactEntry { index: i32, value: f32 }

@group(2) @binding(1) var<storage, read_write> compactCount : atomic<u32>;
@group(2) @binding(2) var<storage, read_write> compactResults : array<CompactEntry>;`

  wgsl = wgsl.replace(
    '/* INJECT RESULTS BUFFER */',
    gpuParams.DEBUG
      ? `@group(2) @binding(0) var<storage, read_write> results : array<array<f32, ${context.maxContainerArrayLength}>>; // DEBUG${compactDeclarations}`
      : compactDeclarations,
  )

  return wgsl
}
