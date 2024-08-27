import structs from 'lib/gpu/wgsl/structs.wgsl?raw'
import structComputedStats from 'lib/gpu/wgsl/structComputedStats.wgsl?raw'
import computeShader from 'lib/gpu/wgsl/computeShader.wgsl?raw'
import { injectSettings } from 'lib/gpu/injection/injectSettings'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { Form } from 'types/Form'
import { calculateConditionalRegistry, calculateConditionals } from 'lib/optimizer/calculateConditionals'
import { calculateTeammates } from 'lib/optimizer/calculateTeammates'
import { injectConditionals } from 'lib/gpu/injection/injectConditionals'
import { injectPrecomputedStats } from 'lib/gpu/injection/injectPrecomputedStats'
import { injectUtils } from 'lib/gpu/injection/injectUtils'
import { SortOption } from 'lib/optimizer/sortOptions'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { GpuConstants } from 'lib/gpu/webgpuInternals'
import { Constants } from 'lib/constants'

export function generateWgsl(params: OptimizerParams, request: Form, gpuParams: GpuConstants) {
  calculateConditionals(request, params)
  calculateConditionalRegistry(request, params)
  calculateTeammates(request, params)
  let wgsl = ''

  wgsl = injectSettings(wgsl, params, request)
  wgsl = injectComputeShader(wgsl)
  wgsl = injectConditionals(wgsl, request, params)
  wgsl = injectPrecomputedStats(wgsl, params)
  wgsl = injectUtils(wgsl)
  wgsl = injectGpuParams(wgsl, request, gpuParams)
  wgsl = injectBasicFilters(wgsl, request)
  wgsl = injectCombatFilters(wgsl, request)

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

function format(text: string) {
  return indent((text.length > 0 ? text : 'false'), 2)
}

function injectBasicFilters(wgsl: string, request: Form) {
  const filter = filterFn(request)

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
  ].filter((str) => str.length > 0).join(' ||\n')

  wgsl = wgsl.replace('/* INJECT BASIC STAT FILTERS */', `
if (statDisplay == 1) {
  if (
${format(basicFilters)}
  ) {
    results[index] = -1;
    continue;
  }
}
  `)

  return wgsl
}

function injectCombatFilters(wgsl: string, request: Form) {
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
    filter('x.WEIGHT < minWeight'),
    filter('x.WEIGHT > maxWeight'),
    filter('x.BASIC_DMG < minBasic'),
    filter('x.BASIC_DMG > maxBasic'),
    filter('x.SKILL_DMG < minSkill'),
    filter('x.SKILL_DMG > maxSkill'),
    filter('x.ULT_DMG < minUlt'),
    filter('x.ULT_DMG > maxUlt'),
    filter('x.FUA_DMG < minFua'),
    filter('x.FUA_DMG > maxFua'),
    filter('x.DOT_DMG < minDot'),
    filter('x.DOT_DMG > maxDot'),
    filter('x.BREAK_DMG < minBreak'),
    filter('x.BREAK_DMG > maxBreak'),
    filter('x.COMBO_DMG < minCombo'),
    filter('x.COMBO_DMG > maxCombo'),
  ].filter((str) => str.length > 0).join(' ||\n')

  wgsl = wgsl.replace('/* INJECT COMBAT STAT FILTERS */', `
if (statDisplay == 0) {
  if (
${format(combatFilters)}
  ) {
    results[index] = -1;
    continue;
  }
}
  `)

  return wgsl
}

function injectGpuParams(wgsl: string, request: Form, gpuParams: GpuConstants) {
  const cyclesPerInvocation = gpuParams.DEBUG ? 1 : gpuParams.CYCLES_PER_INVOCATION

  wgsl = wgsl.replace('/* INJECT GPU PARAMS */', `
const WORKGROUP_SIZE = ${gpuParams.WORKGROUP_SIZE};
const BLOCK_SIZE = ${gpuParams.BLOCK_SIZE};
const CYCLES_PER_INVOCATION = ${cyclesPerInvocation};
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

  if (gpuParams.DEBUG) {
    wgsl = wgsl.replace('/* INJECT RETURN VALUE */', indent(`
results[index] = x; // DEBUG
    `, 1))
  } else {
    wgsl = wgsl.replace('/* INJECT RETURN VALUE */', indent(`
results[index] = x.${sortOption};
    `, 1))
  }

  return wgsl
}
