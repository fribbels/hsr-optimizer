import {
  getActionIndex,
  getHitIndex,
} from 'lib/gpu/injection/injectUtils'
import { getStatKeyName, StatKeyValue } from 'lib/optimization/engine/config/keys'
import {
  ALL_DAMAGE_TAGS,
  ALL_ELEMENT_TAGS,
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { OptimizerEntity } from 'lib/optimization/engine/container/computedStatsContainer'
import { OptimizerAction } from 'types/optimizer'

export function matchesTargetTag(entity: OptimizerEntity, targetTag: TargetTag): boolean {
  if (targetTag === TargetTag.None) return false
  if (targetTag & TargetTag.Self) return entity.primary
  if (targetTag & TargetTag.SelfAndPet) return entity.primary || (entity.pet ?? false)
  if (targetTag & TargetTag.FullTeam) return true
  if (targetTag & TargetTag.SelfAndMemosprite) return entity.primary || entity.memosprite
  if (targetTag & TargetTag.TargetAndMemosprite) return entity.memosprite
  if (targetTag & TargetTag.SummonsOnly) return entity.summon
  return false
}

// Action buff builder - only supports target filtering
class ActionBuffBuilder {
  private _targetTag: TargetTag = TargetTag.SelfAndPet
  private readonly statKey: StatKeyValue
  private readonly value: number

  constructor(statKey: StatKeyValue, value: number) {
    this.statKey = statKey
    this.value = value
  }

  targets(t: TargetTag): this {
    this._targetTag = t
    return this
  }

  wgsl(action: OptimizerAction): string {
    const config = action.config
    const lines: string[] = []

    for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
      const entity = config.entitiesArray[entityIndex]
      const index = getActionIndex(entityIndex, this.statKey, config)
      const line = `computedStatsContainer[${index}] += ${this.value}; // ${entity.name} ${getStatKeyName(this.statKey)}`

      if (matchesTargetTag(entity, this._targetTag)) {
        lines.push(line)
      } else {
        lines.push(`// ${line}`)
      }
    }

    return lines.join('\n        ')
  }
}

// Hit buff builder - supports target, damage type, and element filtering
class HitBuffBuilder {
  private _targetTag: TargetTag = TargetTag.SelfAndPet
  private _damageTags: DamageTag = ALL_DAMAGE_TAGS
  private _elementTags: ElementTag = ALL_ELEMENT_TAGS
  private readonly statKey: StatKeyValue
  private readonly value: number

  constructor(statKey: StatKeyValue, value: number) {
    this.statKey = statKey
    this.value = value
  }

  targets(t: TargetTag): this {
    this._targetTag = t
    return this
  }

  damageType(d: DamageTag): this {
    this._damageTags = d
    return this
  }

  elements(e: ElementTag): this {
    this._elementTags = e
    return this
  }

  wgsl(action: OptimizerAction): string {
    const config = action.config
    const hits = action.hits ?? []
    const lines: string[] = []

    for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
      const entity = config.entitiesArray[entityIndex]
      const entityMatches = matchesTargetTag(entity, this._targetTag)

      for (let hitIndex = 0; hitIndex < hits.length; hitIndex++) {
        const hit = hits[hitIndex]
        const index = getHitIndex(entityIndex, hitIndex, this.statKey, config)
        const line = `computedStatsContainer[${index}] += ${this.value}; // ${entity.name} Hit${hitIndex} ${getStatKeyName(this.statKey)}`

        // Check all filters
        const damageMatches = this._damageTags === ALL_DAMAGE_TAGS || (hit.damageType & this._damageTags)
        const elementMatches = this._elementTags === ALL_ELEMENT_TAGS || (hit.damageElement & this._elementTags)

        if (entityMatches && damageMatches && elementMatches) {
          lines.push(line)
        } else {
          lines.push(`// ${line}`)
        }
      }
    }

    return lines.join('\n        ')
  }
}

// Entry point - stat and value first, .wgsl(action) finalizes
export const buff = {
  action: (statKey: StatKeyValue, value: number) => new ActionBuffBuilder(statKey, value),
  hit: (statKey: StatKeyValue, value: number) => new HitBuffBuilder(statKey, value),
}
