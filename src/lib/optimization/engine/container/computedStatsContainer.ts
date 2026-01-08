import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { BuffSource } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  KeyToStat,
} from 'lib/optimization/computedStatsArray'
import {
  ComputedStatsConfigBaseType,
  ComputedStatsConfigType,
} from 'lib/optimization/config/computedStatsConfig'
import {
  ACTION_STATS_LENGTH,
  AKeyValue,
  AToHKey,
  getAKeyName,
  HIT_STATS_LENGTH,
  HKeyValue,
  isHitStat,
} from 'lib/optimization/engine/config/keys'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
import {
  ALL_DAMAGE_TAGS,
  ALL_ELEMENT_TAGS,
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import {
  BuffBuilder,
  CompleteBuffBuilder,
  IncompleteBuffBuilder,
} from 'lib/optimization/engine/container/buffBuilder'
import { NamedArray } from 'lib/optimization/engine/util/namedArray'
import {
  EntityDefinition,
  Hit,
} from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

enum StatCategory {
  CD,
  NONE,
}

// Pre-calculate all actionBuff/actionSet indices for performance
// New layout: [Entity][Action Stats (56)][Hit 0 (M)][Hit 1 (M)]...
function buildActionBuffIndexCache(
  entityRegistry: NamedArray<OptimizerEntity>,
  entitiesLength: number,
  actionStatsLength: number,
  hitStatsLength: number,
  hitsLength: number,
): Record<number, number[]> {
  const cache: Record<number, number[]> = {}
  // Entity stride: action stats + (hit stats per hit)
  const entityStride = actionStatsLength + (hitsLength * hitStatsLength)

  // Get all TargetTag enum values dynamically
  const allTargetTags = Object.values(TargetTag).filter((v): v is number => typeof v === 'number')

  // For each TargetTag
  for (const targetTags of allTargetTags) {
    // For each action stat key (only action stats, not hit stats)
    for (let statKey = 0; statKey < actionStatsLength; statKey++) {
      const indices: number[] = []

      // Find matching entities
      for (let entityIndex = 0; entityIndex < entitiesLength; entityIndex++) {
        const entity = entityRegistry.get(entityIndex)!

        let matches = false
        if (targetTags & TargetTag.Self) matches = entity.primary
        else if (targetTags & TargetTag.SelfAndPet) matches = entity.primary || (entity.pet ?? false)
        else if (targetTags & TargetTag.FullTeam) matches = true
        else if (targetTags & TargetTag.SelfAndMemosprite) matches = entity.primary || entity.memosprite
        else if (targetTags & TargetTag.SummonsOnly) matches = entity.summon
        else if (targetTags === TargetTag.None) matches = false

        if (matches) {
          // Action stats start at beginning of entity block
          indices.push(entityIndex * entityStride + statKey)
        }
      }

      const cacheKey = (targetTags << 8) | statKey
      cache[cacheKey] = indices
    }
  }

  return cache
}

export const FullStatsConfig: ComputedStatsConfigType = Object.fromEntries(
  Object.entries(newStatsConfig).map(([key, value], index) => {
    const baseValue = value as ComputedStatsConfigBaseType

    return [
      key,
      {
        name: key,
        index: index,
        default: baseValue.default ?? 0,
        flat: baseValue.flat ?? false,
        whole: baseValue.whole ?? false,
        bool: baseValue.bool ?? false,
        category: baseValue.category ?? StatCategory.NONE,
        label: baseValue.label,
      },
    ]
  }),
) as ComputedStatsConfigType

export class ComputedStatsContainerConfig {
  public entityRegistry: NamedArray<OptimizerEntity>
  public entitiesArray: OptimizerEntity[] // Plain array for serialization
  public selfEntity: OptimizerEntity

  public hits: Hit[]

  public hitsLength: number
  public entitiesLength: number
  public actionStatsLength: number // 56 - all stats at action level
  public hitStatsLength: number // M - only hit stats per hit
  public entityStride: number // actionStatsLength + (hitsLength * hitStatsLength)
  public arrayLength: number

  // Register layout: [Stats...][Action Registers][Hit Registers]
  public registersOffset: number // Where registers start in array
  public actionRegistersLength: number // Number of action registers
  public hitRegistersLength: number // Number of hit registers
  public totalRegistersLength: number // action + hit registers

  public actionBuffIndices: Record<number, number[]> // Cached indices for actionBuff/actionSet

  constructor(
    action: OptimizerAction,
    context: OptimizerContext,
    entityRegistry: NamedArray<OptimizerEntity>,
  ) {
    this.actionStatsLength = ACTION_STATS_LENGTH
    this.hitStatsLength = HIT_STATS_LENGTH

    // Hits
    this.hits = action.hits!
    this.hitsLength = this.hits.length

    // Entities
    this.entityRegistry = entityRegistry
    this.entitiesArray = entityRegistry.values // Store plain array for worker transfer
    this.entitiesLength = entityRegistry.length
    this.selfEntity = this.entityRegistry.get(0)!

    // Entity stride: action stats + (hit stats per hit)
    this.entityStride = this.actionStatsLength + (this.hitsLength * this.hitStatsLength)

    // Stats section: each entity has action stats + hit stats per hit
    const statsArrayLength = this.entitiesLength * this.entityStride

    // Registers section: [Action Registers][Hit Registers]
    // Action registers: 1 per action (default + rotation)
    // Hit registers: 1 per hit across all actions
    this.registersOffset = statsArrayLength
    this.actionRegistersLength = context.allActions.length
    this.hitRegistersLength = context.outputRegistersLength
    this.totalRegistersLength = this.actionRegistersLength + this.hitRegistersLength

    // Total array length includes stats + registers
    this.arrayLength = statsArrayLength + this.totalRegistersLength

    // Pre-calculate actionBuff indices for performance
    this.actionBuffIndices = buildActionBuffIndexCache(
      entityRegistry,
      this.entitiesLength,
      this.actionStatsLength,
      this.hitStatsLength,
      this.hitsLength,
    )
  }
}

/**
 * Each combo is an array of actions
 * Each action is an array of hits
 * Each hit can have multiple damage types, elements
 * Each hit is tagged with a combination of ElementTag and AbilityTag
 * Each hit has its own damage function
 *
 * Stats are calculated once per action
 * Damage is calculated once per hit
 *
 * Rutilant Arena set buffs SKILL | BASIC
 * What if we're calculating a SKILL | ULT hit?
 * Precompute which Hits are affected by SKILL | BASIC, then apply the buff to those Hits
 *
 * Buffs are applied at the Action level, but the effects have Hit granularity
 *
 * Array structure (optimized - hit stats only stored per-hit):
 *   [Action (this container)                                           ][Output Registers]
 *   [Entity 0                              ][Entity 1                  ]...
 *   [Action stats (56)][Hit0 (M)][Hit1 (M)][Action stats (56)][Hit0...]...
 *
 * Where:
 * - Action stats: 56 floats (all AKey stats)
 * - Hit stats: M floats per hit (only HKey stats, ~20)
 * - Entity stride: 56 + (hitsLength * M)
 *
 * Key points:
 * - Each container is 1 action
 * - Multiple entities per action (e.g., Aglaea + Garmentmaker)
 * - Each entity has: 1 action-level block + N hit-level blocks
 * - Action block contains ALL stats
 * - Hit blocks contain only hit-specific stats (DMG_BOOST, DEF_PEN, etc.)
 * - Memory savings: ~62% reduction vs storing all stats per-hit
 */
export class ComputedStatsContainer {
  // @ts-ignore
  public a: Float32Array

  // @ts-ignore
  public c: BasicStatsArray

  // @ts-ignore
  public config: ComputedStatsContainerConfig
  private readonly builder: BuffBuilder

  private emptyRegisters!: Float32Array
  private registersOffset!: number

  constructor() {
    this.builder = new BuffBuilder()
  }

  // ============== Array Initialization ==============

  public initializeArrays(maxArrayLength: number, context: OptimizerContext) {
    this.a = new Float32Array(maxArrayLength)

    // Create empty registers array for efficient clearing
    const totalRegistersLength = context.allActions.length + context.outputRegistersLength
    this.emptyRegisters = new Float32Array(totalRegistersLength)
    this.registersOffset = maxArrayLength - totalRegistersLength
  }

  // ============== Precomputes ==============

  public setConfig(config: ComputedStatsContainerConfig) {
    this.config = config
    this.builder.setConfig(config)
  }

  public setPrecompute(array: Float32Array) {
    this.a.set(array)
  }

  public setBasic(basic: BasicStatsArray) {
    this.c = basic
  }

  // ============== Buffs ==============

  set(key: AKeyValue, value: number, config: BuffBuilder<true>) {
    this.internalBuff(
      key,
      value,
      this.operatorSet,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
    )
  }

  buff(key: AKeyValue, value: number, config: BuffBuilder<true>) {
    this.internalBuff(
      key,
      value,
      this.operatorAdd,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
    )
  }

  buffDynamic(key: AKeyValue, value: number, action: OptimizerAction, context: OptimizerContext, config: BuffBuilder<true>) {
    this.internalBuff(
      key,
      value,
      this.operatorAdd,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
    )
    this.internalBuffDynamic(
      key,
      value,
      action,
      context,
      this.operatorAdd,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
    )
  }

  public actionBuff(key: AKeyValue, value: number, targetTags: TargetTag = TargetTag.SelfAndPet) {
    const cacheKey = (targetTags << 8) | (key as number)
    const indices = this.config.actionBuffIndices[cacheKey]

    for (let i = 0; i < indices.length; i++) {
      this.a[indices[i]] += value
    }
  }

  public actionSet(key: AKeyValue, value: number, targetTags: TargetTag = TargetTag.SelfAndPet) {
    const cacheKey = (targetTags << 8) | (key as number)
    const indices = this.config.actionBuffIndices[cacheKey]

    for (let i = 0; i < indices.length; i++) {
      this.a[indices[i]] = value
    }
  }

  internalBuff(
    key: AKeyValue,
    value: number,
    operator: (index: number, value: number) => void,
    source: BuffSource,
    origin: number,
    target: number,
    targetTags: TargetTag,
    elementTags: ElementTag,
    damageTags: DamageTag,
  ): void {
    if (value == 0) return

    const targetEntities = this.getTargetEntities(target, targetTags)

    for (const entityIndex of targetEntities) {
      if (elementTags == ALL_ELEMENT_TAGS && damageTags == ALL_DAMAGE_TAGS) {
        operator(this.getActionIndex(entityIndex, key), value)
      } else {
        // Hit-level filtering requires a hit stat
        const hitKey = AToHKey[key]
        if (hitKey === undefined) {
          throw new Error(`Cannot apply hit-level buff to action-only stat: ${getAKeyName(key)}`)
        }
        this.applyToMatchingHits(entityIndex, hitKey, value, operator, elementTags, damageTags)
      }
    }
  }

  internalBuffDynamic(
    key: AKeyValue,
    value: number,
    action: OptimizerAction,
    context: OptimizerContext,
    operator: (index: number, value: number) => void,
    source: BuffSource,
    origin: number,
    target: number,
    targetTags: TargetTag,
    elementTags: ElementTag,
    damageTags: DamageTag,
  ): void {
    if (value == 0) return

    for (const conditional of action.conditionalRegistry[getAKeyName(key)] || []) {
      evaluateConditional(conditional, this, action, context)
    }
  }

  private getTargetEntities(target: number, targetTags: TargetTag): number[] {
    if (!targetTags) {
      return [target]
    }

    const targets: number[] = []
    for (let i = 0; i < this.config.entitiesLength; i++) {
      const entity = this.config.entityRegistry.get(i)!
      if (this.matchesTargetTags(entity, i, targetTags)) {
        targets.push(i)
      }
    }
    return targets
  }

  private applyToMatchingHits(
    entityIndex: number,
    hitKey: HKeyValue,
    value: number,
    operator: (index: number, value: number) => void,
    elementTags: ElementTag,
    damageTags: DamageTag,
  ): void {
    for (let hitIndex = 0; hitIndex < this.config.hitsLength; hitIndex++) {
      const hit = this.config.hits[hitIndex]
      if (hit.damageType & damageTags && hit.damageElement & elementTags) {
        operator(this.getHitIndex(entityIndex, hitIndex, hitKey), value)
      }
    }
  }

  private matchesTargetTags(entity: OptimizerEntity, entityIndex: number, targetTags: TargetTag): boolean {
    if (targetTags & TargetTag.Self) return entity.primary
    if (targetTags & TargetTag.SelfAndPet) return entity.primary || (entity.pet ?? false)
    if (targetTags & TargetTag.FullTeam) return true
    if (targetTags & TargetTag.SelfAndMemosprite) return entity.primary || entity.memosprite
    if (targetTags & TargetTag.SummonsOnly) return entity.summon
    return false
  }

  // ============== Operators ==============

  operatorAdd = (index: number, value: number) => {
    this.a[index] += value
  }

  operatorSet = (index: number, value: number) => {
    this.a[index] = value
  }

  // ============== Registers ==============
  // Layout: [Stats...][Action Registers][Hit Registers]
  // Indexed from end of array (using maxArrayLength for stability across actions)

  setActionRegisterValue(index: number, value: number) {
    this.a[this.registersOffset + index] = value
  }

  setHitRegisterValue(index: number, value: number) {
    this.a[this.registersOffset + this.emptyRegisters.length - this.config.hitRegistersLength + index] = value
  }

  getActionRegisterValue(index: number) {
    return this.a[this.registersOffset + index]
  }

  getHitRegisterValue(index: number) {
    return this.a[this.registersOffset + this.emptyRegisters.length - this.config.hitRegistersLength + index]
  }

  clearRegisters() {
    this.a.set(this.emptyRegisters, this.registersOffset)
  }

  // ============== Value Getters ==============

  // Returns combined action + hit value for a stat
  public getValue(key: AKeyValue, hitIndex: number) {
    const hit = this.config.hits[hitIndex]
    const sourceEntityIndex = hit.sourceEntityIndex ?? 0
    const hitKey = AToHKey[key]

    const actionValue = this.a[this.getActionIndex(sourceEntityIndex, key)]
    const hitValue = hitKey !== undefined ? this.a[this.getHitIndex(sourceEntityIndex, hitIndex, hitKey)] : 0

    return actionValue + hitValue
  }

  public getActionValue(key: AKeyValue, entityName: string): number {
    const entityIndex = this.config.entityRegistry.getIndex(entityName)
    const index = this.getActionIndex(entityIndex, key)
    return this.a[index]
  }

  public getActionValueByIndex(key: AKeyValue, entityIndex: number): number {
    const index = this.getActionIndex(entityIndex, key)
    return this.a[index]
  }

  // Get hit-level value only (requires hit stat)
  public getHitValue(hitKey: HKeyValue, hitIndex: number) {
    const hit = this.config.hits[hitIndex]
    const sourceEntityIndex = hit.sourceEntityIndex ?? 0
    const index = this.getHitIndex(sourceEntityIndex, hitIndex, hitKey)

    return this.a[index]
  }

  // ============== Indexing ==============
  // New layout: [Entity][Action Stats (56)][Hit 0 (M)][Hit 1 (M)]...
  // Where M = HIT_STATS_LENGTH

  public getActionIndex(entityIndex: number, actionStatKey: AKeyValue): number {
    return entityIndex * this.config.entityStride + actionStatKey
  }

  public getHitIndex(entityIndex: number, hitIndex: number, hitStatKey: HKeyValue): number {
    return entityIndex * this.config.entityStride
      + this.config.actionStatsLength
      + hitIndex * this.config.hitStatsLength
      + hitStatKey
  }

  // ============== Buff Builder ==============

  elements(e: ElementTag): IncompleteBuffBuilder {
    return this.builder.reset().elements(e)
  }

  damageType(d: DamageTag): IncompleteBuffBuilder {
    return this.builder.reset().damageType(d)
  }

  origin(o: string): IncompleteBuffBuilder {
    return this.builder.reset().origin(o)
  }

  target(e: string): IncompleteBuffBuilder {
    return this.builder.reset().target(e)
  }

  targets(t: TargetTag): IncompleteBuffBuilder {
    return this.builder.reset().targets(t)
  }

  source(s: BuffSource): CompleteBuffBuilder {
    return this.builder.reset().source(s)
  }
}

export type OptimizerEntity = EntityDefinition & { name: string }
