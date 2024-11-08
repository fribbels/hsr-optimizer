import { baseComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { Key, KeysType } from 'lib/optimizer/computedStatsArray'
import { OptimizerAction } from 'types/Optimizer'

export function injectPrecomputedStatsContext(action: OptimizerAction, gpuParams: GpuConstants) {
  const x = action.precomputedX
  const a = x.a
  a[Key.EHP] = 0

  const computedStatsWgsl = Object.keys(baseComputedStatsObject)
    .map((key) => {
      const value = a[Key[key as KeysType]]
      const comment = gpuParams.DEBUG ? ` // Stats.${key}` : ''
      return `${value},${comment}`
    })
    .join('\n') + 'Sets(),'

  return computedStatsWgsl
}
