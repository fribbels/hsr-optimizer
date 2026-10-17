import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import type { ComputedStatsContainerConfig } from 'lib/optimization/engine/container/computedStatsContainer'
import type { Form } from 'types/form'

export function getDisplayEntityIndex(request: Form, config: ComputedStatsContainerConfig): number {
  if (request.memoDisplay !== 'memo') return SELF_ENTITY_INDEX

  const memoIndex = config.entitiesArray.findIndex((entity) => entity.memosprite)
  return memoIndex >= 0 ? memoIndex : SELF_ENTITY_INDEX
}

export function generateBasicStatExpression(request: Form, config: ComputedStatsContainerConfig, key: string): string {
  const value = `c.${key}`
  const entity = config.entitiesArray[getDisplayEntityIndex(request, config)]
  if (!entity.memosprite) return value

  switch (key) {
    case 'HP':
      return `(${entity.memoBaseHpScaling ?? 0} * ${value} + ${entity.memoBaseHpFlat ?? 0})`
    case 'ATK':
      return `(${entity.memoBaseAtkScaling ?? 0} * ${value} + ${entity.memoBaseAtkFlat ?? 0})`
    case 'DEF':
      return `(${entity.memoBaseDefScaling ?? 0} * ${value} + ${entity.memoBaseDefFlat ?? 0})`
    case 'SPD':
      return `(${entity.memoBaseSpdScaling ?? 0} * ${value} + ${entity.memoBaseSpdFlat ?? 0})`
    default:
      return value
  }
}
