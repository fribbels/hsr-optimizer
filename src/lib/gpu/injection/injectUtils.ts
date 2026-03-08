import {
  AKeyValue,
  AToHKey,
  GLOBAL_REGISTERS_LENGTH,
  HKeyValue,
} from 'lib/optimization/engine/config/keys'
import {
  ComputedStatsContainerConfig,
} from 'lib/optimization/engine/container/computedStatsContainer'
import { Hit } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

// ============== Index Calculations ==============

export function getActionIndex(entityIndex: number, actionKey: AKeyValue, config: ComputedStatsContainerConfig): number {
  return entityIndex * config.entityStride + actionKey
}

export function getHitIndex(entityIndex: number, hitIndex: number, hitKey: HKeyValue, config: ComputedStatsContainerConfig): number {
  return entityIndex * config.entityStride
    + config.actionStatsLength
    + hitIndex * config.hitStatsLength
    + hitKey
}

// ============== Register Index Helpers ==============

// Layout: [Action Registers][Hit Registers][Global Registers]
export function getActionRegisterIndex(actionRegisterIndex: number, config: ComputedStatsContainerConfig): number {
  return config.arrayLength - config.totalRegistersLength + actionRegisterIndex
}

export function getHitRegisterIndex(hitRegisterIndex: number, config: ComputedStatsContainerConfig): number {
  return config.arrayLength - config.totalRegistersLength + config.actionRegistersLength + hitRegisterIndex
}

// WGSL versions that use maxArrayLength for stability (since WGSL container is always maxArrayLength)
export function getActionRegisterIndexWgsl(actionRegisterIndex: number, context: OptimizerContext): number {
  const totalRegistersLength = context.allActions.length + GLOBAL_REGISTERS_LENGTH + context.outputRegistersLength
  return context.maxContainerArrayLength - totalRegistersLength + actionRegisterIndex
}

export function getHitRegisterIndexWgsl(hitRegisterIndex: number, context: OptimizerContext): number {
  const totalRegistersLength = context.allActions.length + GLOBAL_REGISTERS_LENGTH + context.outputRegistersLength
  return context.maxContainerArrayLength - totalRegistersLength + context.allActions.length + hitRegisterIndex
}

export function getGlobalRegisterIndexWgsl(globalRegisterIndex: number, context: OptimizerContext): number {
  return context.maxContainerArrayLength - GLOBAL_REGISTERS_LENGTH + globalRegisterIndex
}

// Debug utility to generate WGSL code that stores hit damage to register
// Call this inside damage function wgsl() after calculating `damage`
export function wgslDebugHitRegister(hit: Hit, context: OptimizerContext, valueExpr: string = 'damage'): string {
  const registerIndex = getHitRegisterIndexWgsl(hit.registerIndex, context)
  return `(*p_container)[${registerIndex}] = ${valueExpr}; // HitRegister[${hit.registerIndex}]`
}

// Debug utility to generate WGSL code that stores action damage sum to register
// Call this after all hits are calculated
export function wgslDebugActionRegister(action: OptimizerAction, context: OptimizerContext, valueExpr: string = 'actionDmg'): string {
  const registerIndex = getActionRegisterIndexWgsl(action.registerIndex, context)
  return `(*p_container)[${registerIndex}] = ${valueExpr}; // ActionRegister[${action.registerIndex}]`
}

// ============== Container Value Accessors ==============

// Action value accessor (any stat)
export function containerActionVal(entityIndex: number, actionKey: AKeyValue, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getActionIndex(entityIndex, actionKey, config)}]`
}

// Hit value accessor (hit stats only)
export function containerHitVal(entityIndex: number, hitIndex: number, hitKey: HKeyValue, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getHitIndex(entityIndex, hitIndex, hitKey, config)}]`
}

// Combined value accessor (action + hit) for WGSL
// Returns expression that computes actionValue + hitValue for hit stats, or just actionValue for action-only stats
export function containerGetValue(entityIndex: number, hitIndex: number, actionKey: AKeyValue, config: ComputedStatsContainerConfig): string {
  const actionIdx = getActionIndex(entityIndex, actionKey, config)
  const hitKey = AToHKey[actionKey]

  if (hitKey !== undefined) {
    const hitIdx = getHitIndex(entityIndex, hitIndex, hitKey, config)
    return `((*p_container)[${actionIdx}] + (*p_container)[${hitIdx}])`
  }
  return `(*p_container)[${actionIdx}]`
}

// Aliases for p_container
export function p_containerActionVal(entityIndex: number, actionKey: AKeyValue, config: ComputedStatsContainerConfig) {
  return containerActionVal(entityIndex, actionKey, config)
}

// ============== Register Accessors ==============

export function containerHitRegister(hitRegisterIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getHitRegisterIndex(hitRegisterIndex, config)}]`
}

