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
import { GpuParams } from 'lib/gpu/webgpu'

export function generateWgsl(params: OptimizerParams, request: Form, gpuParams: GpuParams) {
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

function injectGpuParams(wgsl: string, request: Form, gpuParams: GpuParams) {
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
