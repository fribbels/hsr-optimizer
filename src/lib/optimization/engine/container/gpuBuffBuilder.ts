import {
  getActionIndex,
  getHitIndex,
} from 'lib/gpu/injection/injectUtils'
import {
  AKeyValue,
  getAKeyName,
  getHKeyName,
  HKey,
  HKeyValue,
} from 'lib/optimization/engine/config/keys'
import {
  ALL_DAMAGE_TAGS,
  ALL_DIRECTNESS_TAGS,
  ALL_ELEMENT_TAGS,
  DamageTag,
  DirectnessTag,
  ElementTag,
  OutputTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { OptimizerEntity } from 'lib/optimization/engine/container/computedStatsContainer'
import { OptimizerAction } from 'types/optimizer'

export function matchesTargetTag(entity: OptimizerEntity, targetTag: TargetTag, entities?: OptimizerEntity[]): boolean {
  if (targetTag === TargetTag.None) return false
  if (targetTag & TargetTag.Self) return entity.primary
  if (targetTag & TargetTag.SelfAndPet) return entity.primary || (entity.pet ?? false)
  if (targetTag & TargetTag.FullTeam) return true
  if (targetTag & TargetTag.SelfAndMemosprite) return entity.primary || entity.memosprite
  if (targetTag & TargetTag.TargetAndMemosprite) return entity.memosprite
  if (targetTag & TargetTag.SummonsOnly) return entity.summon
  if (targetTag & TargetTag.SelfAndSummon) return entity.primary || entity.summon
  if (targetTag & TargetTag.MemospritesOnly) return entity.memosprite
  if (targetTag & TargetTag.SingleTarget) {
    const primaryEntity = entities?.[SELF_ENTITY_INDEX]
    if (primaryEntity?.memoBuffPriority && entities?.some((e) => e.memosprite)) return entity.memosprite
    return entity.primary || (entity.pet ?? false)
  }
  return false
}

// Value can be a number (compile-time constant) or string (WGSL runtime expression)
export type WgslBuffValue = number | string

export enum WgslOperator {
  ADD = '+=',
  MULTIPLY = '*=',
  SET = '=',
  MULTIPLICATIVE_COMPLEMENT = 'MULTIPLICATIVE_COMPLEMENT',
}

// Action buff builder
class ActionBuffBuilder {
  private _targetTag: TargetTag = TargetTag.SelfAndPet
  private _actionKind: string | undefined = undefined
  private _deferrable: boolean = false
  private readonly actionKey: AKeyValue
  private readonly value: WgslBuffValue
  private readonly operator: WgslOperator

  constructor(actionKey: AKeyValue, value: WgslBuffValue, operator: WgslOperator = WgslOperator.ADD) {
    this.actionKey = actionKey
    this.value = value
    this.operator = operator
  }

  targets(t: TargetTag): this {
    this._targetTag = t
    if (t & TargetTag.SingleTarget) this._deferrable = true
    return this
  }

  actionKind(k: string): this {
    this._actionKind = k
    return this
  }

  deferrable(): this {
    this._deferrable = true
    return this
  }

  toString(): never {
    throw new Error('ActionBuffBuilder: Missing .wgsl(action) call - cannot use builder directly in template literal')
  }

  wgsl(action: OptimizerAction, indent: number = 0): string {
    const config = action.config

    // Action kind filter: skip if this action doesn't match the specified kind
    if (this._actionKind !== undefined && config.actionKind !== this._actionKind) {
      return `// Skipped: actionKind filter (${this._actionKind}) doesn't match action (${config.actionKind})`
    }

    // Deferrable: skip if character deprioritizes buffs (resolved at WGSL generation time)
    if (this._deferrable && action.config.deprioritizeBuffs) {
      return `// Skipped: deferrable buff deprioritized`
    }

    const lines: string[] = []
    const prefix = '  '.repeat(indent)

    for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
      const entity = config.entitiesArray[entityIndex]
      const index = getActionIndex(entityIndex, this.actionKey, config)

      let code: string
      if (this.operator === WgslOperator.MULTIPLICATIVE_COMPLEMENT) {
        // Composes damage reductions multiplicatively: 1 - (1 - current) * (1 - new)
        const ref = `(*p_container)[${index}]`
        code = `${ref} = 1.0 - (1.0 - ${ref}) * (1.0 - ${this.value}); // ${entity.name} ${getAKeyName(this.actionKey)}`
      } else {
        code = `(*p_container)[${index}] ${this.operator} ${this.value}; // ${entity.name} ${getAKeyName(this.actionKey)}`
      }

      if (matchesTargetTag(entity, this._targetTag, config.entitiesArray)) {
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
  private _outputTags: OutputTag = OutputTag.DAMAGE
  private _directnessTag: number = ALL_DIRECTNESS_TAGS
  private _actionKind: string | undefined = undefined
  private _deferrable: boolean = false
  private readonly hitKey: HKeyValue
  private readonly value: WgslBuffValue

  constructor(hitKey: HKeyValue, value: WgslBuffValue) {
    this.hitKey = hitKey
    this.value = value
  }

  targets(t: TargetTag): this {
    this._targetTag = t
    if (t & TargetTag.SingleTarget) this._deferrable = true
    return this
  }

  damageType(d: DamageTag): this {
    // BREAK buffs should also affect SUPER_BREAK hits
    if (d & DamageTag.BREAK) d |= DamageTag.SUPER_BREAK
    this._damageTags = d
    return this
  }

  elements(e: ElementTag): this {
    this._elementTags = e
    return this
  }

  outputType(o: OutputTag): this {
    this._outputTags = o
    return this
  }

  directness(d: DirectnessTag): this {
    this._directnessTag = d
    return this
  }

  actionKind(k: string): this {
    this._actionKind = k
    return this
  }

  deferrable(): this {
    this._deferrable = true
    return this
  }

  toString(): never {
    throw new Error('HitBuffBuilder: Missing .wgsl(action) call - cannot use builder directly in template literal')
  }

  wgsl(action: OptimizerAction, indent: number = 0): string {
    const config = action.config

    // Action kind filter: skip if this action doesn't match the specified kind
    if (this._actionKind !== undefined && config.actionKind !== this._actionKind) {
      return `// Skipped: actionKind filter (${this._actionKind}) doesn't match action (${config.actionKind})`
    }

    // Deferrable: skip if character deprioritizes buffs (resolved at WGSL generation time)
    if (this._deferrable && action.config.deprioritizeBuffs) {
      return `// Skipped: deferrable buff deprioritized`
    }

    const hits = action.hits ?? []
    const lines: string[] = []
    const prefix = '  '.repeat(indent)

    // Elemental damage boosts (e.g. +Ice DMG) don't affect break damage.
    // When buffing DMG_BOOST with element filtering, exclude break hits.
    const isElementalDmgBoost = this.hitKey === HKey.DMG_BOOST && this._elementTags !== ALL_ELEMENT_TAGS
    const excludeBreakDamage = DamageTag.BREAK | DamageTag.SUPER_BREAK
    const effectiveDamageTags = isElementalDmgBoost
      ? this._damageTags & ~excludeBreakDamage
      : this._damageTags

    // Directness is determined by the primary hit - all hits in an action inherit this
    const primaryHit = hits[0]
    const actionDirectness = primaryHit?.directHit ? DirectnessTag.Direct : DirectnessTag.Indirect
    const directnessMatches = (actionDirectness & this._directnessTag) !== 0

    for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
      const entity = config.entitiesArray[entityIndex]
      const entityMatches = matchesTargetTag(entity, this._targetTag, config.entitiesArray)

      for (let hitIndex = 0; hitIndex < hits.length; hitIndex++) {
        const hit = hits[hitIndex]
        const index = getHitIndex(entityIndex, hitIndex, this.hitKey, config)
        const code = `(*p_container)[${index}] += ${this.value}; // ${entity.name} Hit${hitIndex} ${getHKeyName(this.hitKey)}`

        // Check all filters
        const damageMatches = effectiveDamageTags === ALL_DAMAGE_TAGS || (hit.damageType & effectiveDamageTags)
        const elementMatches = this._elementTags === ALL_ELEMENT_TAGS || (hit.damageElement & this._elementTags)
        const outputMatches = hit.outputTag & this._outputTags

        if (directnessMatches && entityMatches && damageMatches && elementMatches && outputMatches) {
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
  actionSet: (actionKey: AKeyValue, value: WgslBuffValue) => new ActionBuffBuilder(actionKey, value, WgslOperator.SET),
  actionMultiply: (actionKey: AKeyValue, value: WgslBuffValue) => new ActionBuffBuilder(actionKey, value, WgslOperator.MULTIPLY),
  actionMultiplicativeComplement: (actionKey: AKeyValue, value: WgslBuffValue) => new ActionBuffBuilder(actionKey, value, WgslOperator.MULTIPLICATIVE_COMPLEMENT),
  hit: (hitKey: HKeyValue, value: WgslBuffValue) => new HitBuffBuilder(hitKey, value),
}
