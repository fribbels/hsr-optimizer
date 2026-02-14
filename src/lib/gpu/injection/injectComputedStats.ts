import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'

export function injectComputedStats(wgsl: string, gpuParams: GpuConstants) {
  let out = 'struct ComputedStats {\n'
  for (const stat of Object.keys(newStatsConfig)) {
    out += `${stat}: f32,\n`
  }
  out += '}\n'

  return wgsl + out
}
