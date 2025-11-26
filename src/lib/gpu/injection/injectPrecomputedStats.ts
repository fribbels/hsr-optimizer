import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'

export function injectPrecomputedStatsContext(x: ComputedStatsContainer, gpuParams: GpuConstants) {
  const a = x.a
  const statsCount = Object.keys(newStatsConfig).length
  const statsKeys = Object.keys(newStatsConfig)
  const totalSize = a.length

  const values = Array.from(a).map((value, index) => {
    const containerIndex = Math.floor(index / statsCount)
    const statIndex = index % statsCount
    const statKey = statsKeys[statIndex]

    const comment = gpuParams.DEBUG ? ` // Stats.${statKey} #${containerIndex}` : ''
    const comma = index < totalSize - 1 ? ',' : ''
    return `  ${value}${comma}${comment}`
  }).join('\n')

  return values
}
