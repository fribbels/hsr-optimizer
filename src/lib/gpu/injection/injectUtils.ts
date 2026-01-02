import {
  getStatKeyName,
  StatKeyValue,
} from 'lib/optimization/engine/config/keys'
import {
  ComputedStatsContainerConfig,
  OptimizerEntity,
} from 'lib/optimization/engine/container/computedStatsContainer'
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

export function containerActionRef(entityIndex: number, statIndex: number, config: ComputedStatsContainerConfig) {
  return `container[${getActionIndex(entityIndex, statIndex, config)}]`
}

export function containerHitRef(entityIndex: number, hitIndex: number, statIndex: number, config: ComputedStatsContainerConfig) {
  return `container[${getHitIndex(entityIndex, hitIndex, statIndex, config)}]`
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
      lines.push(`container[${index}] += ${value}; // ${entity.name} ${getStatKeyName(statKey)}`)
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
        lines.push(`container[${index}] += ${value}; // ${entity.name} ${getStatKeyName(statKey)}`)
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
