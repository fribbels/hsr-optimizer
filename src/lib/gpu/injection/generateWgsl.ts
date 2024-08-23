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

export function generateWgsl(params: OptimizerParams, request: Form) {
  calculateConditionals(request, params)
  calculateConditionalRegistry(request, params)
  calculateTeammates(request, params)
  let wgsl = ''

  wgsl = injectSettings(wgsl, params, request)
  wgsl = injectComputeShader(wgsl)
  wgsl = injectConditionals(wgsl, request, params)
  wgsl = injectPrecomputedStats(wgsl, params)
  wgsl = injectUtils(wgsl)

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
