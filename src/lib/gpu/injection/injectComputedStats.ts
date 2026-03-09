import { AKeyNames } from 'lib/optimization/engine/config/keys'
import { GpuConstants } from 'lib/gpu/webgpuTypes'

export function injectComputedStats(wgsl: string, gpuParams: GpuConstants) {
  let out = 'struct ComputedStats {\n'
  for (const stat of AKeyNames) {
    out += `${stat}: f32,\n`
  }
  out += '}\n'

  return wgsl + out
}
