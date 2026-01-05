import {
  getActionIndex,
  getHitIndex,
} from 'lib/gpu/injection/injectUtils'
import {
  getStatKeyName,
  StatKeyValue,
} from 'lib/optimization/engine/config/keys'
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

// Value can be a number (compile-time constant) or string (WGSL runtime expression)
export type WgslBuffValue = number | string

// Action buff builder - only supports target filtering
class ActionBuffBuilder {
  private _targetTag: TargetTag = TargetTag.SelfAndPet
  private readonly statKey: StatKeyValue
  private readonly value: WgslBuffValue

  constructor(statKey: StatKeyValue, value: WgslBuffValue) {
    this.statKey = statKey
    this.value = value
  }

  targets(t: TargetTag): this {
    this._targetTag = t
    return this
  }

  toString(): never {
    throw new Error('ActionBuffBuilder: Missing .wgsl(action) call - cannot use builder directly in template literal')
  }

  wgsl(action: OptimizerAction, indent: number = 0): string {
    const config = action.config
    const lines: string[] = []
    const prefix = '  '.repeat(indent)

    for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
      const entity = config.entitiesArray[entityIndex]
      const index = getActionIndex(entityIndex, this.statKey, config)
      const code = `(*p_container)[${index}] += ${this.value}; // ${entity.name} ${getStatKeyName(this.statKey)}`

      if (matchesTargetTag(entity, this._targetTag)) {
        lines.push(code)
      } else {
        lines.push(`// ${code}`)
      }
    }

    // First line uses template position, subsequent lines need prefix
    return lines.join(`\n${prefix}`)
  }
}

// Hit buff builder - supports target, damage type, and element filtering
class HitBuffBuilder {
  private _targetTag: TargetTag = TargetTag.SelfAndPet
  private _damageTags: DamageTag = ALL_DAMAGE_TAGS
  private _elementTags: ElementTag = ALL_ELEMENT_TAGS
  private readonly statKey: StatKeyValue
  private readonly value: WgslBuffValue

  constructor(statKey: StatKeyValue, value: WgslBuffValue) {
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

  toString(): never {
    throw new Error('HitBuffBuilder: Missing .wgsl(action) call - cannot use builder directly in template literal')
  }

  wgsl(action: OptimizerAction, indent: number = 0): string {
    const config = action.config
    const hits = action.hits ?? []
    const lines: string[] = []
    const prefix = '  '.repeat(indent)

    for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
      const entity = config.entitiesArray[entityIndex]
      const entityMatches = matchesTargetTag(entity, this._targetTag)

      for (let hitIndex = 0; hitIndex < hits.length; hitIndex++) {
        const hit = hits[hitIndex]
        const index = getHitIndex(entityIndex, hitIndex, this.statKey, config)
        const code = `(*p_container)[${index}] += ${this.value}; // ${entity.name} Hit${hitIndex} ${getStatKeyName(this.statKey)}`

        // Check all filters
        const damageMatches = this._damageTags === ALL_DAMAGE_TAGS || (hit.damageType & this._damageTags)
        const elementMatches = this._elementTags === ALL_ELEMENT_TAGS || (hit.damageElement & this._elementTags)

        if (entityMatches && damageMatches && elementMatches) {
          lines.push(code)
        } else {
          lines.push(`// ${code}`)
        }
      }
    }

    // First line uses template position, subsequent lines need prefix
    return lines.join(`\n${prefix}`)
  }
}

// Entry point - stat and value first, .wgsl(action) finalizes
export const buff = {
  action: (statKey: StatKeyValue, value: WgslBuffValue) => new ActionBuffBuilder(statKey, value),
  hit: (statKey: StatKeyValue, value: WgslBuffValue) => new HitBuffBuilder(statKey, value),
}
