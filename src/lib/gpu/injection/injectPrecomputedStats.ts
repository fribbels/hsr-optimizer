import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { ComputedStatsArray, Key, KeysType } from 'lib/optimization/computedStatsArray'
import { baseComputedStatsObject } from 'lib/optimization/config/computedStatsConfig'

export function injectPrecomputedStatsContext(x: ComputedStatsArray, gpuParams: GpuConstants) {
  const a = x.a
  a[Key.EHP] = 0

  const computedStatsWgsl = Object.keys(baseComputedStatsObject)
    .map((key) => {
      const value = a[Key[key as KeysType]]
      const comment = gpuParams.DEBUG ? ` // Stats.${key}` : ''
      return `${value},${comment}`
    })
    .join('\n')

  return computedStatsWgsl
}
