import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export function injectPrecomputedStatsContext(
  x: ComputedStatsContainer,
  context: OptimizerContext,
  gpuParams: GpuConstants,
  action?: OptimizerAction,
) {
  const a = x.a
  const statsCount = Object.keys(newStatsConfig).length
  const statsKeys = Object.keys(newStatsConfig)
  const containerCount = Math.ceil(context.maxContainerArrayLength / statsCount)

  const structs = []
  const hitsLength = x.config?.hitsLength ?? 0
  const slotsPerEntity = hitsLength + 1 // Action stats + hits

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

    // Calculate entity and slot type
    const entityIndex = Math.floor(containerIndex / slotsPerEntity)
    const localIndex = containerIndex % slotsPerEntity
    const entityName = x.config?.entitiesArray?.[entityIndex]?.name ?? `Entity ${entityIndex}`
    const slotType = localIndex === 0 ? 'Action' : `Hit ${localIndex - 1}`
    const actionName = action?.actionName ?? ''

    const structComment = gpuParams.DEBUG
      ? ` // ${entityName} | ${slotType}${actionName ? ` | ${actionName}` : ''}`
      : ''
    const structComma = containerIndex < containerCount - 1 ? ',' : ''
    structs.push(`  ComputedStats(${structComment}\n${statsLines.join('\n')}\n  )${structComma}`)
  }

  return structs.join('\n')
}
