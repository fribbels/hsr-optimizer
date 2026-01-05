import {
  getStatKeyName,
  StatKeyValue,
} from 'lib/optimization/engine/config/keys'
import {
  ComputedStatsContainerConfig,
  OptimizerEntity,
} from 'lib/optimization/engine/container/computedStatsContainer'
import { Hit } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function getActionIndex(entityIndex: number, statIndex: number, config: ComputedStatsContainerConfig): number {
  return entityIndex * (config.statsLength * (config.hitsLength + 1))
    + statIndex
}

export function getHitIndex(entityIndex: number, hitIndex: number, statIndex: number, config: ComputedStatsContainerConfig): number {
  return entityIndex * (config.statsLength * (config.hitsLength + 1))
    + (hitIndex + 1) * config.statsLength
    + statIndex
}

// Register index helpers
// Layout: [Stats...][Action Registers][Hit Registers]
// Indexed from end of array for stability

export function getActionRegisterIndex(actionRegisterIndex: number, config: ComputedStatsContainerConfig): number {
  return config.arrayLength - config.totalRegistersLength + actionRegisterIndex
}

export function getHitRegisterIndex(hitRegisterIndex: number, config: ComputedStatsContainerConfig): number {
  return config.arrayLength - config.hitRegistersLength + hitRegisterIndex
}

// WGSL versions that use maxArrayLength for stability (since WGSL container is always maxArrayLength)
export function getActionRegisterIndexWgsl(actionRegisterIndex: number, context: OptimizerContext): number {
  const totalRegistersLength = context.allActions.length + context.outputRegistersLength
  return context.maxContainerArrayLength - totalRegistersLength + actionRegisterIndex
}

export function getHitRegisterIndexWgsl(hitRegisterIndex: number, context: OptimizerContext): number {
  return context.maxContainerArrayLength - context.outputRegistersLength + hitRegisterIndex
}

// Debug utility to generate WGSL code that stores hit damage to register
// Call this inside damage function wgsl() after calculating `damage`
export function wgslDebugHitRegister(hit: Hit, context: OptimizerContext): string {
  const registerIndex = getHitRegisterIndexWgsl(hit.registerIndex, context)
  return `(*p_container)[${registerIndex}] = damage; // HitRegister[${hit.registerIndex}]`
}

// Debug utility to generate WGSL code that stores action damage sum to register
// Call this after all hits are calculated
export function wgslDebugActionRegister(action: OptimizerAction, context: OptimizerContext, valueExpr: string = 'actionDmg'): string {
  const registerIndex = getActionRegisterIndexWgsl(action.registerIndex, context)
  return `(*p_container)[${registerIndex}] = ${valueExpr}; // ActionRegister[${action.registerIndex}]`
}

export function containerActionVal(entityIndex: number, statIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getActionIndex(entityIndex, statIndex, config)}]`
}

export function containerHitVal(entityIndex: number, hitIndex: number, statIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getHitIndex(entityIndex, hitIndex, statIndex, config)}]`
}

export function p_containerActionVal(entityIndex: number, statIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getActionIndex(entityIndex, statIndex, config)}]`
}

export function p_containerHitVal(entityIndex: number, hitIndex: number, statIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getHitIndex(entityIndex, hitIndex, statIndex, config)}]`
}

export function containerActionRegister(actionRegisterIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getActionRegisterIndex(actionRegisterIndex, config)}]`
}

export function containerHitRegister(hitRegisterIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getHitRegisterIndex(hitRegisterIndex, config)}]`
}

export function p_containerActionRegister(actionRegisterIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getActionRegisterIndex(actionRegisterIndex, config)}]`
}

export function p_containerHitRegister(hitRegisterIndex: number, config: ComputedStatsContainerConfig) {
  return `(*p_container)[${getHitRegisterIndex(hitRegisterIndex, config)}]`
}

function actionBuffFiltered(
  statKey: StatKeyValue,
  value: number,
  action: OptimizerAction,
  context: OptimizerContext,
  filter: EntityFilter,
) {
  const lines: string[] = []
  for (let entityIndex = 0; entityIndex < action.config.entitiesLength; entityIndex++) {
    const entity = action.config.entitiesArray[entityIndex]

    if (filter(entity)) {
      const index = getActionIndex(entityIndex, statKey, action.config)
      lines.push(`(*p_container)[${index}] += ${value}; // ${entity.name} ${getStatKeyName(statKey)}`)
    }
  }
  return lines.filter(Boolean).join('\n        ')
}

export type EntityFilter = (entity: OptimizerEntity) => boolean

export const EntityFilters = {
  primaryOrPet: (e: OptimizerEntity) => Boolean(e.primary || e.pet),
  memo: (e: OptimizerEntity) => e.memosprite,
  all: () => true,
  summon: (e: OptimizerEntity) => e.pet || e.memosprite,
} as const

// Buffing actions

export const actionBuff = (
  statKey: StatKeyValue,
  value: number,
  action: OptimizerAction,
  context: OptimizerContext,
) => actionBuffFiltered(statKey, value, action, context, EntityFilters.primaryOrPet)

export const actionBuffMemo = (
  statKey: StatKeyValue,
  value: number,
  action: OptimizerAction,
  context: OptimizerContext,
) => actionBuffFiltered(statKey, value, action, context, EntityFilters.memo)

// Buffing hits

function hitBuffFiltered(
  statKey: StatKeyValue,
  value: number,
  action: OptimizerAction,
  context: OptimizerContext,
  filter: EntityFilter,
) {
  const lines: string[] = []
  for (let entityIndex = 0; entityIndex < action.config.entitiesLength; entityIndex++) {
    const entity = action.config.entitiesArray[entityIndex]

    for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
      if (filter(entity)) {
        const index = getHitIndex(entityIndex, hitIndex, statKey, action.config)
        lines.push(`(*p_container)[${index}] += ${value}; // ${entity.name} ${getStatKeyName(statKey)}`)
      }
    }
  }
  return lines.filter(Boolean).join('\n        ')
}

// public getValue(key: StatKeyValue, hitIndex: number) {
//   const hit = this.config.hits[hitIndex]
//   const sourceEntityIndex = hit.sourceEntityIndex ?? 0
//
//   const actionValue = this.a[this.getActionIndex(sourceEntityIndex, key)]
//   const hitValue = this.a[this.getHitIndex(sourceEntityIndex, hitIndex, key)]
//
//   return actionValue + hitValue
// }
//
// function getActionValue(key: StatKeyValue, entityIndex: number, config: ComputedStatsContainerConfig): number {
//   return this.a[this.getActionIndex(entityIndex, key)]
// }

// public getActionValueByIndex(key: StatKeyValue, entityIndex: number): number {
//   return this.a[this.getActionIndex(entityIndex, key)]
// }
//
// public getHitValue(key: StatKeyValue, hitIndex: number) {
//   const hit = this.config.hits[hitIndex]
//   const sourceEntityIndex = hit.sourceEntityIndex ?? 0
//
//   return this.a[this.getHitIndex(sourceEntityIndex, hitIndex, key)]
// }
