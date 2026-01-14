import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { OptimizerContext } from 'types/optimizer'

function getDamageTypeName(damageType: number): string {
  const types: string[] = []
  if (damageType & DamageTag.BASIC) types.push('BASIC')
  if (damageType & DamageTag.SKILL) types.push('SKILL')
  if (damageType & DamageTag.ULT) types.push('ULT')
  if (damageType & DamageTag.FUA) types.push('FUA')
  if (damageType & DamageTag.DOT) types.push('DOT')
  if (damageType & DamageTag.BREAK) types.push('BREAK')
  if (damageType & DamageTag.SUPER_BREAK) types.push('SUPER_BREAK')
  if (damageType & DamageTag.MEMO) types.push('MEMO')
  if (damageType & DamageTag.ADDITIONAL) types.push('ADDITIONAL')
  return types.length > 0 ? types.join(' | ') : 'NONE'
}

export function logRegisters(x: ComputedStatsContainer, context: OptimizerContext, label: string) {
  const lines: string[] = []
  const defaultActionsCount = context.defaultActions.length
  const rotationActionsCount = context.rotationActions.length

  lines.push(`**************** ${label} ****************`)

  lines.push('')
  lines.push('           ACTION REGISTERS')
  lines.push('='.repeat(50))
  lines.push(`Total: ${context.allActions.length} (${defaultActionsCount} default + ${rotationActionsCount} rotation)`)
  lines.push('')

  // Default actions
  lines.push('')
  lines.push('Default Actions')
  lines.push('-'.repeat(50))
  for (let i = 0; i < defaultActionsCount; i++) {
    const action = context.defaultActions[i]
    const value = x.getActionRegisterValue(action.registerIndex)
    const hitsCount = action.hits?.length ?? 0
    lines.push(`  [${action.registerIndex}] ${value.toFixed(2).padStart(12)} - ${action.actionName} (${hitsCount} hits)`)
  }

  // Rotation actions
  if (rotationActionsCount > 0) {
    lines.push('')
    lines.push('Rotation Actions')
    lines.push('-'.repeat(50))
    for (let i = 0; i < rotationActionsCount; i++) {
      const action = context.rotationActions[i]
      const value = x.getActionRegisterValue(action.registerIndex)
      const hitsCount = action.hits?.length ?? 0
      lines.push(`  [${action.registerIndex}] ${value.toFixed(2).padStart(12)} - ${action.actionName} (${hitsCount} hits)`)
    }
  }

  lines.push('')
  lines.push('           HIT REGISTERS')
  lines.push('='.repeat(50))
  lines.push(`Total: ${context.outputRegistersLength} hits`)
  lines.push('')

  // Group hits by action for readability
  for (const action of context.allActions) {
    const isDefault = context.defaultActions.includes(action)
    const actionType = isDefault ? 'Default' : 'Rotation'

    lines.push('')
    lines.push(`${action.actionName} (${actionType})`)
    lines.push('-'.repeat(50))

    for (let hitIndex = 0; hitIndex < (action.hits?.length ?? 0); hitIndex++) {
      const hit = action.hits![hitIndex]
      const value = x.getHitRegisterValue(hit.registerIndex)
      const entity = action.config.entitiesArray[hit.sourceEntityIndex ?? 0]?.name ?? 'Unknown'
      const activeStatus = hit.directHit ? 'Direct' : 'Indirect'
      const damageType = getDamageTypeName(hit.damageType)
      lines.push(`  [${hit.registerIndex}] ${value.toFixed(2).padStart(12)} - Hit ${hitIndex} | ${entity} | ${damageType} | ${activeStatus}`)
    }
  }

  lines.push('')
  lines.push('')
  lines.push('           SUMMARY')
  lines.push('='.repeat(50))
  lines.push(`Combo DMG: ${x.a[StatKey.COMBO_DMG]?.toFixed(2) ?? 0}`)
  lines.push('')

  console.log(lines.join('\n'))
}
