import { Constants } from 'lib/constants/constants'
import { injectConditionals } from 'lib/gpu/injection/injectConditionals'
import { injectSettings } from 'lib/gpu/injection/injectSettings'
import { injectUtils } from 'lib/gpu/injection/injectUtils'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { GpuConstants } from 'lib/gpu/webgpuTypes'
import computeShader from 'lib/gpu/wgsl/computeShader.wgsl?raw'
import structComputedStats from 'lib/gpu/wgsl/structComputedStats.wgsl?raw'
import structs from 'lib/gpu/wgsl/structs.wgsl?raw'
import { SortOption } from 'lib/optimization/sortOptions'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

export function generateWgsl(context: OptimizerContext, request: Form, gpuParams: GpuConstants) {
  let wgsl = ''

  wgsl = injectSettings(wgsl, context, request)
  wgsl = injectComputeShader(wgsl)
  wgsl = injectConditionals(wgsl, request, context, gpuParams)
  wgsl = injectUtils(wgsl)
  wgsl = injectGpuParams(wgsl, request, context, gpuParams)
  wgsl = injectBasicFilters(wgsl, request, gpuParams)
  wgsl = injectCombatFilters(wgsl, request, gpuParams)
  wgsl = injectRatingFilters(wgsl, request, gpuParams)
  wgsl = injectSetFilters(wgsl, gpuParams)

  return wgsl
}

function injectComputeShader(wgsl: string) {
  wgsl += `
${computeShader}

${structs}

${structComputedStats}
  `
  return wgsl
}

function filterFn(request: Form) {
  return (text: string) => {
    const [variable, stat, threshold] = text.split(/[><]/).flatMap((x) => x.split('.')).map((x) => x.trim())
    const min = threshold.includes('min')
    const max = threshold.includes('max')

    if (max && request[threshold] == Constants.MAX_INT) return ''
    if (min && request[threshold] == 0) return ''

    return text
  }
}

function format(text: string, levels: number = 2) {
  return indent((text.length > 0 ? text : 'false'), levels)
}

function injectSetFilters(wgsl: string, gpuParams: GpuConstants) {
  // CTRL+ F: RESULTS ASSIGNMENT
  return wgsl.replace('/* INJECT SET FILTERS */', indent(`
if (relicSetSolutionsMatrix[relicSetIndex] < 1 || ornamentSetSolutionsMatrix[ornamentSetIndex] < 1) {
  results[index] = ${gpuParams.DEBUG ? 'ComputedStats()' : '-failures; failures = failures + 1'};
  continue;
}
  `, 2))
}

function injectBasicFilters(wgsl: string, request: Form, gpuParams: GpuConstants) {
  const sortOption: string = SortOption[request.resultSort!].gpuProperty
  const sortOptionComputed = SortOption[request.resultSort!].isComputedRating
  const filter = filterFn(request)

  let sortString = sortOptionComputed ? `x.${sortOption} < threshold` : `c.${sortOption} < threshold`
  if (sortOption == SortOption.COMBO.key) {
    sortString = ''
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
  wgsl = wgsl.replace('/* INJECT BASIC STAT FILTERS */', indent(`
if (statDisplay == 1) {
  if (
${format(basicFilters)}
  ) {
    results[index] = ${gpuParams.DEBUG ? 'ComputedStats()' : '-failures; failures = failures + 1'};
    break;
  }
}
  `, 4))

  return wgsl
}

function injectCombatFilters(wgsl: string, request: Form, gpuParams: GpuConstants) {
  const sortOption: string = SortOption[request.resultSort!].gpuProperty
  const filter = filterFn(request)

  const combatFilters = [
    filter('x.SPD < minSpd'),
    filter('x.SPD > maxSpd'),
    filter('x.HP  < minHp'),
    filter('x.HP  > maxHp'),
    filter('x.ATK < minAtk'),
    filter('x.ATK > maxAtk'),
    filter('x.DEF < minDef'),
    filter('x.DEF > maxDef'),
    filter('x.CR  < minCr'),
    filter('x.CR  > maxCr'),
    filter('x.CD  < minCd'),
    filter('x.CD  > maxCd'),
    filter('x.EHR < minEhr'),
    filter('x.EHR > maxEhr'),
    filter('x.RES < minRes'),
    filter('x.RES > maxRes'),
    filter('x.BE  < minBe'),
    filter('x.BE  > maxBe'),
    filter('x.ERR < minErr'),
    filter('x.ERR > maxErr'),
    filter('x.EHP < minEhp'),
    filter('x.EHP > maxEhp'),
    filter('x.BASIC_DMG < minBasic'),
    filter('x.BASIC_DMG > maxBasic'),
    filter('x.SKILL_DMG < minSkill'),
    filter('x.SKILL_DMG > maxSkill'),
    filter('x.ULT_DMG < minUlt'),
    filter('x.ULT_DMG > maxUlt'),
    filter('x.FUA_DMG < minFua'),
    filter('x.FUA_DMG > maxFua'),
    filter('x.MEMO_SKILL_DMG < minMemoSkill'),
    filter('x.MEMO_SKILL_DMG > maxMemoSkill'),
    filter('x.DOT_DMG < minDot'),
    filter('x.DOT_DMG > maxDot'),
    filter('x.BREAK_DMG < minBreak'),
    filter('x.BREAK_DMG > maxBreak'),
    filter('x.HEAL_VALUE < minHeal'),
    filter('x.HEAL_VALUE > maxHeal'),
    filter('x.SHIELD_VALUE < minShield'),
    filter('x.SHIELD_VALUE > maxShield'),
    sortOption == SortOption.COMBO.key ? '' : filter(`x.${sortOption} < threshold`),
  ].filter((str) => str.length > 0).join(' ||\n')

  // CTRL+ F: RESULTS ASSIGNMENT
  wgsl = wgsl.replace('/* INJECT COMBAT STAT FILTERS */', indent(`
if (statDisplay == 0) {
  if (
${format(combatFilters)}
  ) {
    results[index] = ${gpuParams.DEBUG ? 'ComputedStats()' : '-failures; failures = failures + 1'};
    break;
  }
}
  `, 4))

  return wgsl
}

function injectRatingFilters(wgsl: string, request: Form, gpuParams: GpuConstants) {
  const filter = filterFn(request)

  const ratingFilters = [
    filter('x.EHP < minEhp'),
    filter('x.EHP > maxEhp'),
    filter('x.BASIC_DMG < minBasic'),
    filter('x.BASIC_DMG > maxBasic'),
    filter('x.SKILL_DMG < minSkill'),
    filter('x.SKILL_DMG > maxSkill'),
    filter('x.ULT_DMG < minUlt'),
    filter('x.ULT_DMG > maxUlt'),
    filter('x.FUA_DMG < minFua'),
    filter('x.FUA_DMG > maxFua'),
    filter('x.MEMO_SKILL_DMG < minMemoSkill'),
    filter('x.MEMO_SKILL_DMG > maxMemoSkill'),
    filter('x.DOT_DMG < minDot'),
    filter('x.DOT_DMG > maxDot'),
    filter('x.BREAK_DMG < minBreak'),
    filter('x.BREAK_DMG > maxBreak'),
    filter('x.HEAL_VALUE < minHeal'),
    filter('x.HEAL_VALUE > maxHeal'),
    filter('x.SHIELD_VALUE < minShield'),
    filter('x.SHIELD_VALUE > maxShield'),
  ].filter((str) => str.length > 0).join(' ||\n')

  // CTRL+ F: RESULTS ASSIGNMENT
  wgsl = wgsl.replace('/* INJECT RATING STAT FILTERS */', indent(`
if (
${format(ratingFilters, 1)}
) {
  results[index] = ${gpuParams.DEBUG ? 'ComputedStats()' : '-failures; failures = failures + 1'};
  break;
}
  `, 4))

  return wgsl
}

function injectGpuParams(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const cyclesPerInvocation = gpuParams.DEBUG ? 1 : gpuParams.CYCLES_PER_INVOCATION

  let debugValues = ''

  if (gpuParams.DEBUG) {
    debugValues = `
const DEBUG_BASIC_COMBO: f32 = ${request.comboAbilities.filter((x) => x == 'BASIC').length};
const DEBUG_SKILL_COMBO: f32 = ${request.comboAbilities.filter((x) => x == 'SKILL').length};
const DEBUG_ULT_COMBO: f32 = ${request.comboAbilities.filter((x) => x == 'ULT').length};
const DEBUG_FUA_COMBO: f32 = ${request.comboAbilities.filter((x) => x == 'FUA').length};
`
  }

  wgsl = wgsl.replace('/* INJECT GPU PARAMS */', `
const WORKGROUP_SIZE = ${gpuParams.WORKGROUP_SIZE};
const BLOCK_SIZE = ${gpuParams.BLOCK_SIZE};
const CYCLES_PER_INVOCATION = ${cyclesPerInvocation};
const DEBUG = ${gpuParams.DEBUG ? 1 : 0};
${debugValues}
  `)

  if (gpuParams.DEBUG) {
    wgsl = wgsl.replace('/* INJECT RESULTS BUFFER */', `
@group(2) @binding(0) var<storage, read_write> results : array<ComputedStats>; // DEBUG
    `)
  } else {
    wgsl = wgsl.replace('/* INJECT RESULTS BUFFER */', `
@group(2) @binding(0) var<storage, read_write> results : array<f32>;
    `)
  }

  // eslint-disable-next-line
  const sortOption: string = SortOption[request.resultSort!].gpuProperty
  const sortOptionComputed = SortOption[request.resultSort!].isComputedRating

  const valueString = sortOptionComputed ? `x.${sortOption}` : `c.${sortOption}`

  // CTRL+ F: RESULTS ASSIGNMENT
  if (gpuParams.DEBUG) {
    wgsl = wgsl.replace('/* INJECT RETURN VALUE */', indent(`
x.COMBO_DMG = combo + comboDot * x.DOT_DMG + comboBreak * x.BREAK_DMG;
results[index] = x; // DEBUG
results[index + 1] = m; // DEBUG
    `, 4))
  } else {
    wgsl = wgsl.replace('/* INJECT RETURN VALUE */', indent(`
if (statDisplay == 0) {
  results[index] = x.${sortOption};
  failures = 1;
} else {
  results[index] = ${valueString};
  failures = 1;
}
    `, 4))
  }

  if (context.resultSort == SortOption.COMBO.key) {
    wgsl = wgsl.replace('/* INJECT ACTION ITERATOR */', indent(`
for (var actionIndex = actionCount - 1; actionIndex >= 0; actionIndex--) {
    `, 4))
  } else {
    wgsl = wgsl.replace('/* INJECT ACTION ITERATOR */', indent(`
for (var actionIndex = 0; actionIndex < actionCount; actionIndex++) {
    `, 4))
  }

  return wgsl
}
