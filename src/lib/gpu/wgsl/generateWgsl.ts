import structs from 'lib/gpu/wgsl/structs/structs.wgsl?raw'
import structComputedStats from 'lib/gpu/wgsl/structs/structComputedStats.wgsl?raw'
import shader from 'lib/gpu/wgsl/shader.wgsl?raw'
import { generateSettings } from "lib/gpu/wgsl/generateSettings";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { Form } from "types/Form";

export function generateWgsl(params: OptimizerParams, request: Form) {
  const settings = generateSettings(params, request)
  return `
${settings}
${shader}
${structs}
${structComputedStats}
  `
}