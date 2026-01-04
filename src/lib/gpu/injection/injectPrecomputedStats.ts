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
  const totalValues = context.maxContainerArrayLength

  const lines: string[] = ['']
  const hitsLength = x.config?.hitsLength ?? 0
  const slotsPerEntity = hitsLength + 1 // Action stats + hits

  // Register positions (indexed from end)
  const hitRegistersLength = x.config?.hitRegistersLength ?? 0
  const totalRegistersLength = x.config?.totalRegistersLength ?? 0
  const hitRegistersStart = totalValues - hitRegistersLength
  const actionRegistersStart = totalValues - totalRegistersLength

  for (let globalIndex = 0; globalIndex < totalValues; globalIndex++) {
    const value = globalIndex < a.length ? a[globalIndex] : 0

    let comment = ''
    if (gpuParams.DEBUG) {
      if (globalIndex >= hitRegistersStart) {
        // Hit registers section (at the very end)
        const hitRegisterIndex = globalIndex - hitRegistersStart
        comment = ` // HitRegister[${hitRegisterIndex}]`
      } else if (globalIndex >= actionRegistersStart) {
        // Action registers section (before hit registers)
        const actionRegisterIndex = globalIndex - actionRegistersStart
        comment = ` // ActionRegister[${actionRegisterIndex}]`
      } else {
        // Stats section
        const containerIndex = Math.floor(globalIndex / statsCount)
        const statIndex = globalIndex % statsCount
        const entityIndex = Math.floor(containerIndex / slotsPerEntity)
        const localIndex = containerIndex % slotsPerEntity
        const entityName = x.config?.entitiesArray?.[entityIndex]?.name ?? `Entity ${entityIndex}`
        const slotType = localIndex === 0 ? 'Action' : `Hit ${localIndex - 1}`
        const statKey = statsKeys[statIndex]
        const actionName = action?.actionName ?? ''
        comment = ` // Global: ${globalIndex} | Local: ${statIndex} | Hit: ${localIndex} | Stats.${statKey} | ${entityName} | ${slotType}${actionName ? ` | ${actionName}` : ''}`
      }
    }

    const comma = globalIndex < totalValues - 1 ? ',' : ''
    lines.push(`    ${value}${comma}${comment}`)
  }

  return lines.join('\n')
}
