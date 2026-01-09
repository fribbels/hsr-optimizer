import {
  getActionIndex,
  getHitIndex,
} from 'lib/gpu/injection/injectUtils'
import {
  AKeyValue,
  getAKeyName,
  getHKeyName,
  HKeyValue,
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
  if (targetTag & TargetTag.SelfAndSummon) return entity.primary || entity.summon
  if (targetTag & TargetTag.MemospritesOnly) return entity.memosprite
  return false
}

// Value can be a number (compile-time constant) or string (WGSL runtime expression)
export type WgslBuffValue = number | string

// Action buff builder
class ActionBuffBuilder {
  private _targetTag: TargetTag = TargetTag.SelfAndPet
  private readonly actionKey: AKeyValue
  private readonly value: WgslBuffValue

  constructor(actionKey: AKeyValue, value: WgslBuffValue) {
    this.actionKey = actionKey
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
      const index = getActionIndex(entityIndex, this.actionKey, config)
      const code = `(*p_container)[${index}] += ${this.value}; // ${entity.name} ${getAKeyName(this.actionKey)}`

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

// Hit buff builder
class HitBuffBuilder {
  private _targetTag: TargetTag = TargetTag.SelfAndPet
  private _damageTags: DamageTag = ALL_DAMAGE_TAGS
  private _elementTags: ElementTag = ALL_ELEMENT_TAGS
  private readonly hitKey: HKeyValue
  private readonly value: WgslBuffValue

  constructor(hitKey: HKeyValue, value: WgslBuffValue) {
    this.hitKey = hitKey
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
        const index = getHitIndex(entityIndex, hitIndex, this.hitKey, config)
        const code = `(*p_container)[${index}] += ${this.value}; // ${entity.name} Hit${hitIndex} ${getHKeyName(this.hitKey)}`

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
  action: (actionKey: AKeyValue, value: WgslBuffValue) => new ActionBuffBuilder(actionKey, value),
  hit: (hitKey: HKeyValue, value: WgslBuffValue) => new HitBuffBuilder(hitKey, value),
}
