import { Constants, PathNames } from 'lib/constants/constants'
import { injectComputedStats } from 'lib/gpu/injection/injectComputedStats'
import { injectConditionals } from 'lib/gpu/injection/injectConditionals'
import { injectSettings } from 'lib/gpu/injection/injectSettings'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { GpuConstants, RelicsByPart } from 'lib/gpu/webgpuTypes'
import computeShader from 'lib/gpu/wgsl/computeShader.wgsl?raw'
import structs from 'lib/gpu/wgsl/structs.wgsl?raw'
import { SortOption } from 'lib/optimization/sortOptions'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

export function generateWgsl(context: OptimizerContext, request: Form, relics: RelicsByPart, gpuParams: GpuConstants) {
  let wgsl = ''

  wgsl = injectSettings(wgsl, context, request, relics)
  wgsl = injectComputeShader(wgsl)
  wgsl = injectConditionals(wgsl, request, context, gpuParams)
  wgsl = injectGpuParams(wgsl, request, context, gpuParams)
  wgsl = injectBasicFilters(wgsl, request, gpuParams)
  wgsl = injectCombatFilters(wgsl, request, gpuParams)
  wgsl = injectRatingFilters(wgsl, request, gpuParams)
  wgsl = injectSetFilters(wgsl, gpuParams)
  wgsl = injectComputedStats(wgsl, gpuParams)
  wgsl = injectSuppressions(wgsl, request, context, gpuParams)

  return wgsl
}

function injectSuppressions(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  if (context.path != PathNames.Remembrance) {
    wgsl = suppress(wgsl, 'COPY MEMOSPRITE BASIC STATS')
    wgsl = suppress(wgsl, 'MEMOSPRITE DAMAGE CALCS')
    wgsl = suppress(wgsl, 'MC ASSIGNMENT')
  }

  if (context.resultSort != SortOption.EHP.key && !gpuParams.DEBUG && request.minEhp == 0 && request.maxEhp == Constants.MAX_INT) {
    wgsl = suppress(wgsl, 'EHP CALC')
  }

  if (context.resultSort != SortOption.COMBO.key && !gpuParams.DEBUG) {
    if (context.resultSort != SortOption.DOT.key && request.minDot == 0 && request.maxDot == Constants.MAX_INT) wgsl = suppress(wgsl, 'DOT CALC')
    if (context.resultSort != SortOption.BASIC.key && request.minBasic == 0 && request.maxBasic == Constants.MAX_INT) wgsl = suppress(wgsl, 'BASIC CALC')
    if (context.resultSort != SortOption.SKILL.key && request.minSkill == 0 && request.maxSkill == Constants.MAX_INT) wgsl = suppress(wgsl, 'SKILL CALC')
    if (context.resultSort != SortOption.ULT.key && request.minUlt == 0 && request.maxUlt == Constants.MAX_INT) wgsl = suppress(wgsl, 'ULT CALC')
    if (context.resultSort != SortOption.FUA.key && request.minFua == 0 && request.maxFua == Constants.MAX_INT) wgsl = suppress(wgsl, 'FUA CALC')
    if (context.resultSort != SortOption.MEMO_SKILL.key && request.minMemoSkill == 0 && request.maxMemoSkill == Constants.MAX_INT) wgsl = suppress(wgsl, 'MEMO_SKILL CALC')
    if (context.resultSort != SortOption.MEMO_TALENT.key && request.minMemoTalent == 0 && request.maxMemoTalent == Constants.MAX_INT) wgsl = suppress(wgsl, 'MEMO_TALENT CALC')
  }

  return wgsl
}

function suppress(wgsl: string, label: string) {
  wgsl = wgsl.replace(`START ${label} */`, `═════════════════════════════════════════ DISABLED ${label} ═════════════════════════════════════════╗`)
  wgsl = wgsl.replace(`/* END ${label}`, `════════════════════════════════════════════ DISABLED ${label} ═════════════════════════════════════════╝`)

  return wgsl
}

function injectComputeShader(wgsl: string) {
  wgsl += `
${computeShader}

${structs}
  `
  return wgsl
}

function filterFn(request: Form) {
  return (text: string) => {
    const [variable, stat, threshold] = text.split(/[><]/).flatMap((x) => x.split('.')).map((x) => x.trim())
    const min = threshold.includes('min')
    const max = threshold.includes('max')

    if (max && request[threshold as keyof Form] == Constants.MAX_INT) return ''
    if (min && request[threshold as keyof Form] == 0) return ''

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
  const sortOption = SortOption[request.resultSort! as keyof typeof SortOption]
  const sortOptionGpu: string = sortOption.gpuProperty
  const sortOptionComputed = sortOption.isComputedRating
  const filter = filterFn(request)

  let sortString = sortOptionComputed ? `x.${sortOptionGpu} < threshold` : `c.${sortOptionGpu} < threshold`
  if (sortOptionGpu == SortOption.COMBO.key) {
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
  const sortOption = SortOption[request.resultSort! as keyof typeof SortOption]
  const sortOptionGpu: string = sortOption.gpuProperty
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
    filter('x.MEMO_TALENT_DMG < minMemoTalent'),
    filter('x.MEMO_TALENT_DMG > maxMemoTalent'),
    filter('x.DOT_DMG < minDot'),
    filter('x.DOT_DMG > maxDot'),
    filter('x.BREAK_DMG < minBreak'),
    filter('x.BREAK_DMG > maxBreak'),
    filter('x.HEAL_VALUE < minHeal'),
    filter('x.HEAL_VALUE > maxHeal'),
    filter('x.SHIELD_VALUE < minShield'),
    filter('x.SHIELD_VALUE > maxShield'),
    sortOptionGpu == SortOption.COMBO.key ? '' : filter(`x.${sortOptionGpu} < threshold`),
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
    filter('x.MEMO_TALENT_DMG < minMemoTalent'),
    filter('x.MEMO_TALENT_DMG > maxMemoTalent'),
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
  const sortOption = SortOption[request.resultSort! as keyof typeof SortOption]
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
  const sortOptionGpu: string = sortOption.gpuProperty
  const sortOptionComputed = sortOption.isComputedRating

  const valueString = sortOptionComputed ? `x.${sortOptionGpu}` : `c.${sortOptionGpu}`

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
  results[index] = x.${sortOptionGpu};
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
