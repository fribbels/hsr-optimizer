import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { OptimizerContext } from 'types/optimizer'

export function injectPrecomputedStatsContext(x: ComputedStatsContainer, context: OptimizerContext, gpuParams: GpuConstants) {
  const a = x.a
  const statsCount = Object.keys(newStatsConfig).length
  const statsKeys = Object.keys(newStatsConfig)
  const containerCount = Math.ceil(context.maxContainerArrayLength / statsCount)

  const structs = []
  for (let containerIndex = 0; containerIndex < containerCount; containerIndex++) {
    const statsLines = []

    for (let statIndex = 0; statIndex < statsCount; statIndex++) {
      const index = containerIndex * statsCount + statIndex
      const value = index < a.length ? a[index] : 0
      const statKey = statsKeys[statIndex]

      const comment = gpuParams.DEBUG ? ` // Stats.${statKey}` : ''
      const comma = statIndex < statsCount - 1 ? ',' : ''
      statsLines.push(`    ${value}${comma}${comment}`)
    }

    const structComment = gpuParams.DEBUG ? ` // Container #${containerIndex}` : ''
    const structComma = containerIndex < containerCount - 1 ? ',' : ''
    structs.push(`  ComputedStats(\n${statsLines.join('\n')}\n  )${structComma}${structComment}`)
  }

  return structs.join('\n')
}
