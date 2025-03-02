import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { StatsConfigByIndex } from 'lib/optimization/config/computedStatsConfig'

export function injectComputedStats(wgsl: string, gpuParams: GpuConstants) {
  let out = 'struct ComputedStats {\n'
  for (const stat of StatsConfigByIndex) {
    out += `${stat.name}: f32,\n`
  }
  out += '}\n'

  return wgsl + out
}
