import type { GpuConstants } from 'lib/gpu/webgpuTypes'
import { AKeyNames } from 'lib/optimization/engine/config/keys'

export function injectComputedStats(wgsl: string, gpuParams: GpuConstants) {
  let out = 'struct ComputedStats {\n'
  for (const stat of AKeyNames) {
    out += `${stat}: f32,\n`
  }
  out += '}\n'

  return wgsl + out
}
