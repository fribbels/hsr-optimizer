import { aKeyToConvertibleStat } from 'lib/conditionals/evaluation/statConversionConfig'
import {
  Stats,
  type StatsValues,
} from 'lib/constants/constants'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  type BasicStatsArray,
  BasicStatsArrayCore,
  type Buff,
} from 'lib/optimization/basicStatsArray'
import { type BuffSource } from 'lib/optimization/buffSource'
import {
  ACTION_STATS_LENGTH,
  type AKeyType,
  type AKeyValue,
  AToHKey,
  getAKeyName,
  GLOBAL_REGISTERS_LENGTH,
  HIT_STATS_LENGTH,
  type HitAKeyValue,
  type HKeyValue,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
import {
  ALL_DAMAGE_TAGS,
  ALL_DIRECTNESS_TAGS,
  ALL_ELEMENT_TAGS,
  DamageTag,
  DirectnessTag,
  type ElementTag,
  OutputTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import {
  BuffBuilder,
  type CompleteActionBuff,
  type CompleteHitBuff,
  type IncompleteActionBuff,
  type IncompleteHitBuff,
} from 'lib/optimization/engine/container/buffBuilder'
import { NamedArray } from 'lib/optimization/engine/util/namedArray'
import type { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import {
  type BuffHit,
  type EntityDefinition,
  type Hit,
} from 'types/hitConditionalTypes'

import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export enum Operator {
  ADD,
  SET,
  MULTIPLY,
  MULTIPLICATIVE_COMPLEMENT,
  MULTIPLICATIVE_BOOST,
}

function applyOperator(a: Float64Array, index: number, operator: Operator, value: number): void {
  switch (operator) {
    case Operator.ADD:
      a[index] += value
      return
    case Operator.SET:
      a[index] = value
      return
    case Operator.MULTIPLY:
      a[index] *= value
      return
    case Operator.MULTIPLICATIVE_COMPLEMENT:
      a[index] = 1 - (1 - a[index]) * (1 - value)
      return
    case Operator.MULTIPLICATIVE_BOOST:
      a[index] = (1 + a[index]) * (1 + value) - 1
      return
  }
}

// Shared entity matching logic for target tags
function entityMatchesTargetTag(
  entity: OptimizerEntity,
  targetTags: number,
  entities: OptimizerEntity[],
): boolean {
  if (targetTags & TargetTag.FullTeam) return true
  if (targetTags & TargetTag.SingleTarget) {
    const primaryEntity = entities[SELF_ENTITY_INDEX]
    if (primaryEntity.memoBuffPriority && entities.some((e) => e.memosprite)) return entity.memosprite
    return entity.primary || (entity.pet ?? false)
  }
  return (targetTags & entity.targetMask) !== 0
}

// Precompute all actionBuff/actionSet indices
function buildActionBuffIndexCache(
  entities: OptimizerEntity[],
  actionStatsLength: number,
  hitStatsLength: number,
  hitsLength: number,
): Record<number, number[]> {
  const cache: Record<number, number[]> = {}
  const entityStride = actionStatsLength + (hitsLength * hitStatsLength)

  const allTargetTags = Object.values(TargetTag).filter((v): v is number => typeof v === 'number')

  for (const targetTags of allTargetTags) {
    for (let statKey = 0; statKey < actionStatsLength; statKey++) {
      const indices: number[] = []

      for (let entityIndex = 0; entityIndex < entities.length; entityIndex++) {
        if (entityMatchesTargetTag(entities[entityIndex], targetTags, entities)) {
          indices.push(entityIndex * entityStride + statKey)
        }
      }

      const cacheKey = (targetTags << 8) | statKey
      cache[cacheKey] = indices
    }
  }

  return cache
}

// Precompute per-TargetTag entity indices and base offsets
function buildEntityTargetCaches(
  entities: OptimizerEntity[],
  entityStride: number,
): { indices: Record<number, number[]>, offsets: Record<number, number[]> } {
  const indices: Record<number, number[]> = {}
  const offsets: Record<number, number[]> = {}
  const allTargetTags = Object.values(TargetTag).filter((v): v is number => typeof v === 'number')

  for (const targetTags of allTargetTags) {
    const matchedIndices: number[] = []
    const matchedOffsets: number[] = []
    for (let entityIndex = 0; entityIndex < entities.length; entityIndex++) {
      if (entityMatchesTargetTag(entities[entityIndex], targetTags, entities)) {
        matchedIndices.push(entityIndex)
        matchedOffsets.push(entityIndex * entityStride)
      }
    }
    indices[targetTags] = matchedIndices
    offsets[targetTags] = matchedOffsets
  }

  return { indices, offsets }
}

export class ComputedStatsContainerConfig {
  public entityRegistry: NamedArray<OptimizerEntity>
  public entitiesArray: OptimizerEntity[] // Plain array for serialization
  public selfEntity: OptimizerEntity

  public hits: Hit[]
  public actionKind: AbilityKind

  public hitsLength: number
  public entitiesLength: number
  public actionStatsLength: number // All stats at action level
  public hitStatsLength: number // Only hit stats per hit
  public entityStride: number // actionStatsLength + (hitsLength * hitStatsLength)
  public arrayLength: number

  // Register layout: [Stats...][Action Registers][Global Registers][Hit Registers]
  public registersOffset: number // Where registers start in array
  public actionRegistersLength: number // Number of action registers
  public globalRegistersLength: number // Number of global registers (e.g., COMBO_DMG)
  public hitRegistersLength: number // Number of hit registers
  public totalRegistersLength: number // action + global + hit registers

  public actionBuffIndices: Record<number, number[]> // Cached indices for actionBuff/actionSet
  public entityBaseOffsets: Record<number, number[]> // Per-TargetTag entity base offsets for loop-flipped stat writes
  public targetEntityIndices: Record<number, number[]> // Per-TargetTag entity indices for internalBuff
  public deprioritizeBuffs: boolean
  public hasMemosprite: boolean
  public hasSummons: boolean
  public enemyWeaknessBroken: boolean
  public teammateSetEffects: Record<string, boolean> = {}

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
    this.actionKind = action.actionType

    // Entities
    this.entityRegistry = entityRegistry
    this.entitiesArray = entityRegistry.values // Store plain array for worker transfer
    this.entitiesLength = entityRegistry.length
    this.selfEntity = this.entityRegistry.get(0)!

    // Entity stride: action stats + (hit stats per hit)
    this.entityStride = this.actionStatsLength + (this.hitsLength * this.hitStatsLength)

    // Stats section: each entity has action stats + hit stats per hit
    const statsArrayLength = this.entitiesLength * this.entityStride

    // Registers section: [Action Registers][Hit Registers][Global Registers]
    // Action registers: 1 per action (default + rotation)
    // Hit registers: 1 per hit across all actions
    // Global registers: fixed-size section for cross-action aggregates (e.g., COMBO_DMG)
    this.registersOffset = statsArrayLength
    this.actionRegistersLength = context.allActions.length
    this.globalRegistersLength = GLOBAL_REGISTERS_LENGTH
    this.hitRegistersLength = context.outputRegistersLength
    this.totalRegistersLength = this.actionRegistersLength + this.globalRegistersLength + this.hitRegistersLength

    // Total array length includes stats + registers
    this.arrayLength = statsArrayLength + this.totalRegistersLength

    // Precompute actionBuff indices for performance
    this.actionBuffIndices = buildActionBuffIndexCache(
      this.entitiesArray,
      this.actionStatsLength,
      this.hitStatsLength,
      this.hitsLength,
    )

    // Precompute per-TargetTag entity indices and base offsets
    const entityCaches = buildEntityTargetCaches(
      this.entitiesArray,
      this.entityStride,
    )
    this.targetEntityIndices = entityCaches.indices
    this.entityBaseOffsets = entityCaches.offsets

    this.deprioritizeBuffs = context.deprioritizeBuffs
    this.hasMemosprite = this.entitiesArray.some((e) => e.memosprite)
    this.hasSummons = this.entitiesArray.some((e) => e.summon)
    this.enemyWeaknessBroken = context.enemyWeaknessBroken
  }
}

/**
 * Rebuilds the entityRegistry from entitiesArray after deserialization.
 * Call this on the worker side after receiving the context via postMessage.
 * This is a standalone function because the config object loses its class methods after serialization.
 */
export function rebuildEntityRegistry(config: ComputedStatsContainerConfig): void {
  config.entityRegistry = new NamedArray(config.entitiesArray, (entity) => entity.name)
  config.selfEntity = config.entitiesArray[0]
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
 *   [Action stats][Hit0 (M)][Hit1 (M)][Action stats][Hit0...]...
 *
 * Where:
 * - Action stats: all AKey stats
 * - Hit stats: M floats per hit
 * - Entity stride: actionStatsLength + (hitsLength * M)
 *
 * Key points:
 * - Each container is 1 action
 * - Multiple entities per action (e.g., Aglaea + Garmentmaker)
 * - Each entity has: 1 action-level block + N hit-level blocks
 * - Action block contains ALL stats
 * - Hit blocks contain only hit-specific stats (DMG_BOOST, DEF_PEN, etc.)
 */
export class ComputedStatsContainer {
  public a!: Float64Array
  public c!: BasicStatsArray
  public config!: ComputedStatsContainerConfig
  private readonly builder: BuffBuilder

  private emptyRegisters!: Float64Array
  private registersOffset!: number

  // Buff tracing properties
  public trace: boolean = false
  public buffs: Buff[] = []
  public buffsMemo: Buff[] = []

  constructor() {
    this.builder = new BuffBuilder()
  }

  /**
   * Enable buff tracing for debugging/display purposes.
   * When enabled, all buff applications are recorded to buffs/buffsMemo arrays.
   */
  public enableTracing(): void {
    this.trace = true
    this.builder._tracing = true
    this.buffs = []
    this.buffsMemo = []
  }

  /**
   * Merge buff traces from a precomputed container into this container.
   * Called after setPrecompute to transfer traced buffs that were recorded during precomputation.
   */
  public mergePrecomputedTraces(precomputed: ComputedStatsContainer): void {
    if (!this.trace || !precomputed.trace) return
    if (precomputed.buffs.length) this.buffs.push(...precomputed.buffs)
    if (precomputed.buffsMemo.length) this.buffsMemo.push(...precomputed.buffsMemo)
  }

  // ============== Array Initialization ==============

  public initializeArrays(maxArrayLength: number, context: OptimizerContext) {
    this.a = new Float64Array(maxArrayLength)

    // Create empty registers array for efficient clearing
    const totalRegistersLength = context.allActions.length + GLOBAL_REGISTERS_LENGTH + context.outputRegistersLength
    this.emptyRegisters = new Float64Array(totalRegistersLength)
    this.registersOffset = maxArrayLength - totalRegistersLength
  }

  // ============== Cloning ==============

  /**
   * Creates a deep clone of this container for result preservation.
   * Clones arrays and metadata while sharing immutable config references.
   */
  public clone(): ComputedStatsContainer {
    const clone = new ComputedStatsContainer()

    // Clone the stats array
    clone.a = new Float64Array(this.a)

    // Clone basic stats with metadata
    const clonedBasic = new BasicStatsArrayCore(false)
    clonedBasic.a.set(this.c.a)
    clonedBasic.id = this.c.id
    clonedBasic.relicSetIndex = this.c.relicSetIndex
    clonedBasic.ornamentSetIndex = this.c.ornamentSetIndex
    clonedBasic.sets = this.c.sets
    clonedBasic.setsArray = this.c.setsArray
    clonedBasic.weight = this.c.weight
    clone.c = clonedBasic as BasicStatsArray

    // Share immutable config reference
    if (this.config) {
      clone.config = this.config
      clone.builder.setConfig(this.config)
    }

    // Copy register offsets
    if (this.emptyRegisters) {
      clone.emptyRegisters = this.emptyRegisters // Shared reference (read-only template)
      clone.registersOffset = this.registersOffset
    }

    // Copy trace data
    clone.trace = this.trace
    if (this.trace) {
      clone.buffs = [...this.buffs]
      clone.buffsMemo = [...this.buffsMemo]
    }

    return clone
  }

  /**
   * Creates a minimal container from raw arrays (for worker result reconstruction).
   * Does not include config - only suitable for array access.
   */
  public static fromArrays(xa: Float64Array, ca: Float32Array): ComputedStatsContainer {
    const container = new ComputedStatsContainer()
    container.a = xa

    const basic = new BasicStatsArrayCore(false)
    basic.a.set(ca)
    container.c = basic as BasicStatsArray

    return container
  }

  // ============== Precomputes ==============

  public setConfig(config: ComputedStatsContainerConfig) {
    this.config = config
    this.builder.setConfig(config)
  }

  public setPrecompute(array: Float64Array) {
    this.a.set(array)
  }

  public setBasic(basic: BasicStatsArray) {
    this.c = basic
  }

  // ============== Buffs ==============

  set(key: HitAKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff): void
  set(key: AKeyValue, value: number, config: CompleteActionBuff): void
  set(key: AKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff) {
    this.internalBuff(key, value, Operator.SET, config)
  }

  buff(key: HitAKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff): void
  buff(key: AKeyValue, value: number, config: CompleteActionBuff): void
  buff(key: AKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff) {
    this.internalBuff(key, value, Operator.ADD, config)
  }

  multiply(key: HitAKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff): void
  multiply(key: AKeyValue, value: number, config: CompleteActionBuff): void
  multiply(key: AKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff) {
    this.internalBuff(key, value, Operator.MULTIPLY, config)
  }

  multiplicativeComplement(key: HitAKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff): void
  multiplicativeComplement(key: AKeyValue, value: number, config: CompleteActionBuff): void
  multiplicativeComplement(key: AKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff) {
    this.internalBuff(key, value, Operator.MULTIPLICATIVE_COMPLEMENT, config)
  }

  multiplicativeBoost(key: HitAKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff): void
  multiplicativeBoost(key: AKeyValue, value: number, config: CompleteActionBuff): void
  multiplicativeBoost(key: AKeyValue, value: number, config: CompleteActionBuff | CompleteHitBuff) {
    this.internalBuff(key, value, Operator.MULTIPLICATIVE_BOOST, config)
  }

  buffDynamic(key: HitAKeyValue, value: number, action: OptimizerAction, context: OptimizerContext, config: CompleteActionBuff | CompleteHitBuff): void
  buffDynamic(key: AKeyValue, value: number, action: OptimizerAction, context: OptimizerContext, config: CompleteActionBuff): void
  buffDynamic(key: AKeyValue, value: number, action: OptimizerAction, context: OptimizerContext, config: CompleteActionBuff | CompleteHitBuff) {
    this.internalBuff(key, value, Operator.ADD, config)
    this.internalBuffDynamic(key, value, action, context, Operator.ADD)
  }

  public actionBuff(key: AKeyValue, value: number, targetTags: TargetTag = TargetTag.SelfAndPet) {
    if (this.config.entitiesLength === 1) {
      this.a[key as number] += value
      return
    }
    const cacheKey = (targetTags << 8) | (key as number)
    const indices = this.config.actionBuffIndices[cacheKey]

    for (let i = 0; i < indices.length; i++) {
      this.a[indices[i]] += value
    }
  }

  public actionSet(key: AKeyValue, value: number, targetTags: TargetTag = TargetTag.SelfAndPet) {
    if (this.config.entitiesLength === 1) {
      this.a[key as number] = value
      return
    }
    const cacheKey = (targetTags << 8) | (key as number)
    const indices = this.config.actionBuffIndices[cacheKey]

    for (let i = 0; i < indices.length; i++) {
      this.a[indices[i]] = value
    }
  }

  internalBuff(
    key: AKeyValue,
    value: number,
    operator: Operator,
    config: CompleteActionBuff | CompleteHitBuff,
  ): void {
    if (value === 0 && operator === Operator.ADD) return
    if (config._deferrable && this.config.deprioritizeBuffs) return
    if (config._actionKind !== undefined && this.config.actionKind !== config._actionKind) return

    const elementTags = config._elementTags
    const damageTags = config._damageTags
    const outputTags = config._outputTags
    const directnessTag = config._directnessTag
    const buffStatFilter = config._buffStatFilter

    const isElementalDmgBoost = key === StatKey.BOOST && elementTags !== ALL_ELEMENT_TAGS
    const excludeBreakDamage = DamageTag.BREAK | DamageTag.SUPER_BREAK
    const effectiveDamageTags = isElementalDmgBoost
      ? damageTags & ~excludeBreakDamage
      : damageTags

    const targetEntities = this.getTargetEntities(config._target, config._targetTags)

    const needsHitFiltering = elementTags !== ALL_ELEMENT_TAGS
      || effectiveDamageTags !== ALL_DAMAGE_TAGS
      || outputTags !== OutputTag.DAMAGE
      || directnessTag !== ALL_DIRECTNESS_TAGS
      || buffStatFilter !== null

    for (const entityIndex of targetEntities) {
      if (!needsHitFiltering) {
        applyOperator(this.a, this.getActionIndex(entityIndex, key), operator, value)
      } else {
        const hitKey = AToHKey[key]
        if (hitKey === undefined) {
          throw new Error(`Cannot apply hit-level buff to action-only stat: ${getAKeyName(key)}`)
        }
        this.applyToMatchingHits(entityIndex, hitKey, value, operator, elementTags, effectiveDamageTags, outputTags, directnessTag, buffStatFilter)
      }
    }

    if (this.trace && value !== 0 && outputTags !== OutputTag.BUFF) {
      let hasMemo = false
      let allMemo = true
      for (const i of targetEntities) {
        const entity = this.config.entitiesArray[i]
        if (entity?.memosprite) hasMemo = true
        else allMemo = false
      }
      const traceDamageTags = effectiveDamageTags !== ALL_DAMAGE_TAGS ? effectiveDamageTags : undefined
      if (!allMemo) {
        this.buffs.push({
          stat: getAKeyName(key),
          key: key as number,
          value: value,
          source: config._source,
          memo: false,
          damageTags: traceDamageTags,
        })
      }
      if (hasMemo) {
        this.buffsMemo.push({
          stat: getAKeyName(key),
          key: key as number,
          value: value,
          source: config._source,
          memo: true,
          damageTags: traceDamageTags,
        })
      }
    }
  }

  internalBuffDynamic(
    key: AKeyValue,
    value: number,
    action: OptimizerAction,
    context: OptimizerContext,
    operator: Operator,
  ): void {
    if (value === 0 && operator === Operator.ADD) return

    for (const conditional of action.conditionalRegistry[aKeyToConvertibleStat[key]] || []) {
      evaluateConditional(conditional, this, action, context)
    }
  }

  private getTargetEntities(target: number, targetTags: TargetTag): number[] {
    if (!targetTags) {
      return [target]
    }

    return this.config.targetEntityIndices[targetTags]
  }

  private applyToMatchingHits(
    entityIndex: number,
    hitKey: HKeyValue,
    value: number,
    operator: Operator,
    elementTags: ElementTag,
    damageTags: DamageTag,
    outputTags: OutputTag,
    directnessTag: number,
    buffStatFilter: AKeyValue | null = null,
  ): void {
    // Skip if no hits defined (some actions like non-transformed Phainon ULT have no damage hits)
    if (this.config.hitsLength === 0) {
      return
    }

    if (buffStatFilter === StatKey.ATK_P) {
      buffStatFilter = StatKey.ATK
      value = value * this.config.entitiesArray[entityIndex]!.baseAtk
    } else if (buffStatFilter === StatKey.DEF_P) {
      buffStatFilter = StatKey.DEF
      value = value * this.config.entitiesArray[entityIndex]!.baseDef
    } else if (buffStatFilter === StatKey.HP_P) {
      buffStatFilter = StatKey.HP
      value = value * this.config.entitiesArray[entityIndex]!.baseHp
    } else if (buffStatFilter === StatKey.SPD_P) {
      buffStatFilter = StatKey.SPD
      value = value * this.config.entitiesArray[entityIndex]!.baseSpd
    }

    // Directness is determined by the primary hit - all hits in an action inherit this
    const primaryHit = this.config.hits[0]
    const actionDirectness = primaryHit.directHit ? DirectnessTag.Direct : DirectnessTag.Indirect
    const directnessMatches = (actionDirectness & directnessTag) !== 0

    for (let hitIndex = 0; hitIndex < this.config.hitsLength; hitIndex++) {
      const hit = this.config.hits[hitIndex]
      // Shield/heal hits have ElementTag.None (0), so check for ALL_DAMAGE/ELEMENT_TAGS before bitwise AND
      const damageMatches = damageTags === ALL_DAMAGE_TAGS || (hit.damageType & damageTags)
      const elementMatches = elementTags === ALL_ELEMENT_TAGS || (hit.damageElement & elementTags)
      if (
        directnessMatches && damageMatches && elementMatches && (hit.outputTag & outputTags)
        && (!buffStatFilter || (hit as BuffHit).buffStat === buffStatFilter)
      ) {
        applyOperator(this.a, this.getHitIndex(entityIndex, hitIndex, hitKey), operator, value)
      }
    }
  }

  // ============== Registers ==============
  // Layout: [Stats...][Action Registers][Hit Registers][Global Registers]
  // Indexed from end of array (using maxArrayLength for stability across actions)

  setActionRegisterValue(index: number, value: number) {
    this.a[this.registersOffset + index] = value
  }

  setHitRegisterValue(index: number, value: number) {
    this.a[this.registersOffset + this.config.actionRegistersLength + index] = value
  }

  setGlobalRegisterValue(index: number, value: number) {
    this.a[this.registersOffset + this.config.actionRegistersLength + this.config.hitRegistersLength + index] = value
  }

  getActionRegisterValue(index: number) {
    return this.a[this.registersOffset + index]
  }

  getHitRegisterValue(index: number) {
    return this.a[this.registersOffset + this.config.actionRegistersLength + index]
  }

  getGlobalRegisterValue(index: number) {
    return this.a[this.registersOffset + this.config.actionRegistersLength + this.config.hitRegistersLength + index]
  }

  clearRegisters() {
    this.a.set(this.emptyRegisters, this.registersOffset)
  }

  // ============== Value Getters ==============

  // Returns combined action + hit value for a stat
  // Optional entityIndex overrides the default sourceEntityIndex from the hit
  public getValue(key: AKeyValue, hitIndex: number, entityIndex?: number) {
    const hit = this.config.hits[hitIndex]
    const resolvedEntityIndex = entityIndex ?? hit.sourceEntityIndex ?? 0
    const hitKey = AToHKey[key]

    const actionValue = this.a[this.getActionIndex(resolvedEntityIndex, key)]
    const hitValue = hitKey !== undefined ? this.a[this.getHitIndex(resolvedEntityIndex, hitIndex, hitKey)] : 0

    return actionValue + hitValue
  }

  public getActionValue(key: AKeyValue, entityName: string): number {
    const entityIndex = this.config.entityRegistry.getRequiredIndex(entityName)
    const index = this.getActionIndex(entityIndex, key)
    return this.a[index]
  }

  public getActionValueByIndex(key: AKeyValue, entityIndex: number): number {
    const index = this.getActionIndex(entityIndex, key)
    return this.a[index]
  }

  /**
   * Get action-level stat value for entity 0 (self).
   * Works without config because entity 0's array offset is always 0.
   * Use this for containers from fromArrays() that lack config.
   *
   * Mathematical basis: getActionIndex(0, key) = 0 * entityStride + key = key
   */
  public getSelfValue(key: AKeyValue): number {
    return this.a[key]
  }

  // Get hit-level value only (requires hit stat)
  public getHitValue(hitKey: HKeyValue, hitIndex: number) {
    const hit = this.config.hits[hitIndex]
    const sourceEntityIndex = hit.sourceEntityIndex ?? 0
    const index = this.getHitIndex(sourceEntityIndex, hitIndex, hitKey)

    return this.a[index]
  }

  // ============== Indexing ==============

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

  elements(e: ElementTag): IncompleteHitBuff {
    return this.builder.reset().elements(e)
  }

  damageType(d: DamageTag): IncompleteHitBuff {
    return this.builder.reset().damageType(d)
  }

  target(e: string): IncompleteActionBuff {
    return this.builder.reset().target(e)
  }

  targets(t: TargetTag): IncompleteActionBuff {
    return this.builder.reset().targets(t)
  }

  outputType(o: OutputTag): IncompleteHitBuff {
    return this.builder.reset().outputType(o)
  }

  outputBuff(stat: AKeyValue): IncompleteHitBuff {
    return this.builder.reset().outputBuff(stat)
  }

  directness(d: DirectnessTag): IncompleteHitBuff {
    return this.builder.reset().directness(d)
  }

  actionKind(k: AbilityKind): IncompleteActionBuff {
    return this.builder.reset().actionKind(k)
  }

  deferrable(): IncompleteActionBuff {
    return this.builder.reset().deferrable()
  }

  source(s: BuffSource): CompleteActionBuff {
    return this.builder.reset().source(s)
  }

  // ============== Stats Conversion ==============

  /**
   * Converts the container's entity 0 action-level stats to a ComputedStatsObjectExternal.
   * Maps from AKey indices to the external readable stat names (e.g., CR -> 'CRIT Rate').
   * Stats not present in newStatsConfig will be 0 in the result.
   */
  public toComputedStatsObject(): ComputedStatsObjectExternal {
    const result: Partial<ComputedStatsObjectExternal> = {}

    for (const key in newStatsConfig) {
      const aKey = key as AKeyType
      const externalKey = ContainerKeyToExternal[aKey] ?? aKey
      result[externalKey as keyof ComputedStatsObjectExternal] = this.a[StatKey[aKey]]
    }

    return result as ComputedStatsObjectExternal
  }
}

export type ComputedStatsObjectExternal = Record<StatsValues | AKeyType, number>

// Mapping from new AKey names to ComputedStatsObjectExternal keys
const ContainerKeyToExternal: Partial<Record<AKeyType, StatsValues>> = {
  ATK_P: Stats.ATK_P,
  ATK: Stats.ATK,
  BE: Stats.BE,
  CD: Stats.CD,
  CR: Stats.CR,
  DEF_P: Stats.DEF_P,
  DEF: Stats.DEF,
  EHR: Stats.EHR,
  ERR: Stats.ERR,
  FIRE_DMG_BOOST: Stats.Fire_DMG,
  HP_P: Stats.HP_P,
  HP: Stats.HP,
  ICE_DMG_BOOST: Stats.Ice_DMG,
  IMAGINARY_DMG_BOOST: Stats.Imaginary_DMG,
  LIGHTNING_DMG_BOOST: Stats.Lightning_DMG,
  OHB: Stats.OHB,
  PHYSICAL_DMG_BOOST: Stats.Physical_DMG,
  QUANTUM_DMG_BOOST: Stats.Quantum_DMG,
  RES: Stats.RES,
  SPD_P: Stats.SPD_P,
  SPD: Stats.SPD,
  WIND_DMG_BOOST: Stats.Wind_DMG,
  ELATION: Stats.Elation,
}

export type OptimizerEntity = EntityDefinition & {
  name: string,
  targetMask: number,
  baseAtk: number,
  baseDef: number,
  baseHp: number,
  baseSpd: number,
}
