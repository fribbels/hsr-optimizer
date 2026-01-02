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

  const lines: string[] = ['']
  const hitsLength = x.config?.hitsLength ?? 0
  const slotsPerEntity = hitsLength + 1 // Action stats + hits
  const totalValues = containerCount * statsCount

  for (let containerIndex = 0; containerIndex < containerCount; containerIndex++) {
    // Calculate entity and slot type
    const entityIndex = Math.floor(containerIndex / slotsPerEntity)
    const localIndex = containerIndex % slotsPerEntity
    const entityName = x.config?.entitiesArray?.[entityIndex]?.name ?? `Entity ${entityIndex}`
    const slotType = localIndex === 0 ? 'Action' : `Hit ${localIndex - 1}`
    const actionName = action?.actionName ?? ''

    for (let statIndex = 0; statIndex < statsCount; statIndex++) {
      const globalIndex = containerIndex * statsCount + statIndex
      const value = globalIndex < a.length ? a[globalIndex] : 0
      const statKey = statsKeys[statIndex]

      const comment = gpuParams.DEBUG
        ? ` // Global: ${globalIndex} | Local: ${statIndex} | Hit: ${localIndex} | Stats.${statKey} | ${entityName} | ${slotType}${actionName ? ` | ${actionName}` : ''}`
        : ''
      const comma = globalIndex < totalValues - 1 ? ',' : ''
      lines.push(`    ${value}${comma}${comment}`)
    }
  }

  return lines.join('\n')
}
