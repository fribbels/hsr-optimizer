import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { Stats } from 'lib/constants/constants'
import {
  BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { BuffSource } from 'lib/optimization/buffSource'
import {
  Buff,
  ComputedStatsArray,
  ComputedStatsObjectExternal,
  KeyToStat,
} from 'lib/optimization/computedStatsArray'
import {
  ComputedStatsConfigBaseType,
  ComputedStatsConfigType,
} from 'lib/optimization/config/computedStatsConfig'
import {
  ACTION_STATS_LENGTH,
  AKeyType,
  AKeyValue,
  AToHKey,
  getAKeyName,
  HIT_STATS_LENGTH,
  HKeyValue,
  isHitStat,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
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

export enum Operator {
  ADD,
  SET,
  MULTIPLY,
  MULTIPLICATIVE_COMPLEMENT,
}

type Operation = (a: Float32Array, index: number, value: number) => void

const OPERATOR_MAP: Record<Operator, Operation> = {
  [Operator.ADD]: (a, i, v) => {
    a[i] += v
  },
  [Operator.SET]: (a, i, v) => {
    a[i] = v
  },
  [Operator.MULTIPLY]: (a, i, v) => {
    a[i] *= v
  },
  [Operator.MULTIPLICATIVE_COMPLEMENT]: (a, i, v) => {
    // Composes damage reductions multiplicatively: 1 - (1 - current) * (1 - new)
    // Default 0 means no reduction. 0.08 means 8% reduction.
    // Two 8% + 10% reductions: 1 - (1-0)*(1-0.08) = 0.08, then 1 - (1-0.08)*(1-0.10) = 0.172
    a[i] = 1 - (1 - a[i]) * (1 - v)
  },
}

// Shared entity matching logic for target tags
function entityMatchesTargetTag(
  entity: OptimizerEntity,
  targetTags: number,
  entityRegistry: NamedArray<OptimizerEntity>,
  entitiesLength: number,
): boolean {
  if (targetTags & TargetTag.Self) return entity.primary
  else if (targetTags & TargetTag.SelfAndPet) return entity.primary || (entity.pet ?? false)
  else if (targetTags & TargetTag.FullTeam) return true
  else if (targetTags & TargetTag.SelfAndMemosprite) return entity.primary || entity.memosprite
  else if (targetTags & TargetTag.SummonsOnly) return entity.summon
  else if (targetTags & TargetTag.SelfAndSummon) return entity.primary || entity.summon
  else if (targetTags & TargetTag.MemospritesOnly) return entity.memosprite
  else if (targetTags & TargetTag.SingleTarget) {
    const primaryEntity = entityRegistry.get(SELF_ENTITY_INDEX)!
    const hasMemosprite = Array.from({ length: entitiesLength }, (_, i) => entityRegistry.get(i)!).some((e) => e.memosprite)
    if (primaryEntity.memoBuffPriority && hasMemosprite) return entity.memosprite
    else return entity.primary || (entity.pet ?? false)
  } else if (targetTags === TargetTag.None) return false
  return false
}

// Precompute all actionBuff/actionSet indices
function buildActionBuffIndexCache(
  entityRegistry: NamedArray<OptimizerEntity>,
  entitiesLength: number,
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

      for (let entityIndex = 0; entityIndex < entitiesLength; entityIndex++) {
        const entity = entityRegistry.get(entityIndex)!
        if (entityMatchesTargetTag(entity, targetTags, entityRegistry, entitiesLength)) {
          indices.push(entityIndex * entityStride + statKey)
        }
      }

      const cacheKey = (targetTags << 8) | statKey
      cache[cacheKey] = indices
    }
  }

  return cache
}

// Precompute entity base offsets per TargetTag for loop-flipped stat writes
function buildEntityBaseOffsets(
  entityRegistry: NamedArray<OptimizerEntity>,
  entitiesLength: number,
  entityStride: number,
): Record<number, number[]> {
  const offsets: Record<number, number[]> = {}
  const allTargetTags = Object.values(TargetTag).filter((v): v is number => typeof v === 'number')

  for (const targetTags of allTargetTags) {
    const matched: number[] = []
    for (let entityIndex = 0; entityIndex < entitiesLength; entityIndex++) {
      const entity = entityRegistry.get(entityIndex)!
      if (entityMatchesTargetTag(entity, targetTags, entityRegistry, entitiesLength)) {
        matched.push(entityIndex * entityStride)
      }
    }
    offsets[targetTags] = matched
  }

  return offsets
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
  public actionKind: string // The action type (e.g., 'BASIC', 'SKILL', 'ULT')

  public hitsLength: number
  public entitiesLength: number
  public actionStatsLength: number // All stats at action level
  public hitStatsLength: number // Only hit stats per hit
  public entityStride: number // actionStatsLength + (hitsLength * hitStatsLength)
  public arrayLength: number

  // Register layout: [Stats...][Action Registers][Hit Registers]
  public registersOffset: number // Where registers start in array
  public actionRegistersLength: number // Number of action registers
  public hitRegistersLength: number // Number of hit registers
  public totalRegistersLength: number // action + hit registers

  public actionBuffIndices: Record<number, number[]> // Cached indices for actionBuff/actionSet
  public entityBaseOffsets: Record<number, number[]> // Per-TargetTag entity base offsets for loop-flipped stat writes
  public deprioritizeBuffs: boolean

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

    // Registers section: [Action Registers][Hit Registers]
    // Action registers: 1 per action (default + rotation)
    // Hit registers: 1 per hit across all actions
    this.registersOffset = statsArrayLength
    this.actionRegistersLength = context.allActions.length
    this.hitRegistersLength = context.outputRegistersLength
    this.totalRegistersLength = this.actionRegistersLength + this.hitRegistersLength

    // Total array length includes stats + registers
    this.arrayLength = statsArrayLength + this.totalRegistersLength

    // Precompute actionBuff indices for performance
    this.actionBuffIndices = buildActionBuffIndexCache(
      entityRegistry,
      this.entitiesLength,
      this.actionStatsLength,
      this.hitStatsLength,
      this.hitsLength,
    )

    // Precompute entity base offsets per TargetTag for loop-flipped stat writes
    this.entityBaseOffsets = buildEntityBaseOffsets(
      entityRegistry,
      this.entitiesLength,
      this.entityStride,
    )

    this.deprioritizeBuffs = context.deprioritizeBuffs
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
  public a!: Float32Array
  public c!: BasicStatsArray
  public config!: ComputedStatsContainerConfig
  private readonly builder: BuffBuilder

  private emptyRegisters!: Float32Array
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
    this.a = new Float32Array(maxArrayLength)

    // Create empty registers array for efficient clearing
    const totalRegistersLength = context.allActions.length + context.outputRegistersLength
    this.emptyRegisters = new Float32Array(totalRegistersLength)
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
    clone.a = new Float32Array(this.a)

    // Clone basic stats with metadata
    const clonedBasic = new BasicStatsArrayCore(false)
    clonedBasic.a.set(this.c.a)
    clonedBasic.id = this.c.id
    clonedBasic.relicSetIndex = this.c.relicSetIndex
    clonedBasic.ornamentSetIndex = this.c.ornamentSetIndex
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
  public static fromArrays(xa: Float32Array, ca: Float32Array): ComputedStatsContainer {
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
      Operator.SET,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
      config._outputTags,
      config._directnessTag,
      config._actionKind,
      config._deferrable,
    )
  }

  buff(key: AKeyValue, value: number, config: BuffBuilder<true>) {
    this.internalBuff(
      key,
      value,
      Operator.ADD,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
      config._outputTags,
      config._directnessTag,
      config._actionKind,
      config._deferrable,
    )
  }

  multiply(key: AKeyValue, value: number, config: BuffBuilder<true>) {
    this.internalBuff(
      key,
      value,
      Operator.MULTIPLY,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
      config._outputTags,
      config._directnessTag,
      config._actionKind,
      config._deferrable,
    )
  }

  multiplicativeComplement(key: AKeyValue, value: number, config: BuffBuilder<true>) {
    this.internalBuff(
      key,
      value,
      Operator.MULTIPLICATIVE_COMPLEMENT,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
      config._outputTags,
      config._directnessTag,
      config._actionKind,
      config._deferrable,
    )
  }

  buffDynamic(key: AKeyValue, value: number, action: OptimizerAction, context: OptimizerContext, config: BuffBuilder<true>) {
    this.internalBuff(
      key,
      value,
      Operator.ADD,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
      config._outputTags,
      config._directnessTag,
      config._actionKind,
      config._deferrable,
    )
    this.internalBuffDynamic(
      key,
      value,
      action,
      context,
      Operator.ADD,
      config._source,
      config._origin,
      config._target,
      config._targetTags,
      config._elementTags,
      config._damageTags,
      config._outputTags,
    )
  }

  public actionBuff(key: AKeyValue, value: number, targetTags: TargetTag = TargetTag.SelfAndPet) {
    // Optimization temporarily disabled
    // if (this.config.entitiesLength === 1) {
    //   this.a[key as number] += value
    //   return
    // }
    const cacheKey = (targetTags << 8) | (key as number)
    const indices = this.config.actionBuffIndices[cacheKey]

    for (let i = 0; i < indices.length; i++) {
      this.a[indices[i]] += value
    }
  }

  public actionSet(key: AKeyValue, value: number, targetTags: TargetTag = TargetTag.SelfAndPet) {
    // Optimization temporarily disabled
    // if (this.config.entitiesLength === 1) {
    //   this.a[key as number] = value
    //   return
    // }
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
    source: BuffSource,
    origin: number,
    target: number,
    targetTags: TargetTag,
    elementTags: ElementTag,
    damageTags: DamageTag,
    outputTags: OutputTag,
    directnessTag: number,
    actionKind: string | undefined,
    deferrable: boolean = false,
  ): void {
    if (value == 0 && operator == Operator.ADD) return

    // Deferrable buffs are skipped when the character deprioritizes buffs (subdps)
    if (deferrable && this.config.deprioritizeBuffs) return

    // Action kind filter: skip if this action doesn't match the specified kind
    if (actionKind !== undefined && this.config.actionKind !== actionKind) return

    // Elemental damage boosts (e.g. +Ice DMG) don't affect break damage.
    // When buffing DMG_BOOST with element filtering, exclude break hits.
    const isElementalDmgBoost = key === StatKey.DMG_BOOST && elementTags !== ALL_ELEMENT_TAGS
    const excludeBreakDamage = DamageTag.BREAK | DamageTag.SUPER_BREAK
    const effectiveDamageTags = isElementalDmgBoost
      ? damageTags & ~excludeBreakDamage
      : damageTags

    const targetEntities = this.getTargetEntities(target, targetTags)
    const operation = OPERATOR_MAP[operator]

    // Check if we need hit-level filtering
    const needsHitFiltering = elementTags !== ALL_ELEMENT_TAGS
      || effectiveDamageTags !== ALL_DAMAGE_TAGS
      || outputTags !== OutputTag.DAMAGE
      || directnessTag !== ALL_DIRECTNESS_TAGS

    for (const entityIndex of targetEntities) {
      if (!needsHitFiltering) {
        // Fast path: no filtering needed for standard damage buffs
        operation(this.a, this.getActionIndex(entityIndex, key), value)
      } else {
        // Hit-level filtering requires a hit stat
        const hitKey = AToHKey[key]
        if (hitKey === undefined) {
          throw new Error(`Cannot apply hit-level buff to action-only stat: ${getAKeyName(key)}`)
        }
        this.applyToMatchingHits(entityIndex, hitKey, value, operator, elementTags, effectiveDamageTags, outputTags, directnessTag)
      }
    }

    // Record trace once per buff call (outside entity loop to avoid duplicates from multi-entity targeting).
    // - buffs goes to the main character trace (recorded unless targeting exclusively memosprites)
    // - buffsMemo goes to the memosprite trace (recorded when any target is a memosprite)
    if (this.trace && value !== 0) {
      let hasMemo = false
      let allMemo = true
      for (const i of targetEntities) {
        const entity = this.config.entitiesArray[i]
        if (entity?.memosprite) hasMemo = true
        else allMemo = false
      }
      if (!allMemo) {
        this.buffs.push({ stat: getAKeyName(key), key: key as number, value: value, source: source, memo: false })
      }
      if (hasMemo) {
        this.buffsMemo.push({ stat: getAKeyName(key), key: key as number, value: value, source: source, memo: true })
      }
    }
  }

  internalBuffDynamic(
    key: AKeyValue,
    value: number,
    action: OptimizerAction,
    context: OptimizerContext,
    operator: Operator,
    source: BuffSource,
    origin: number,
    target: number,
    targetTags: TargetTag,
    elementTags: ElementTag,
    damageTags: DamageTag,
    outputTags: OutputTag,
  ): void {
    if (value == 0 && operator == Operator.ADD) return

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
      const entity = this.config.entitiesArray[i]
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
    operator: Operator,
    elementTags: ElementTag,
    damageTags: DamageTag,
    outputTags: OutputTag,
    directnessTag: number,
  ): void {
    // Skip if no hits defined (some actions like non-transformed Phainon ULT have no damage hits)
    if (this.config.hitsLength === 0) {
      return
    }

    // Directness is determined by the primary hit - all hits in an action inherit this
    const primaryHit = this.config.hits[0]
    const actionDirectness = primaryHit.directHit ? DirectnessTag.Direct : DirectnessTag.Indirect
    const directnessMatches = (actionDirectness & directnessTag) !== 0
    const operation = OPERATOR_MAP[operator]

    for (let hitIndex = 0; hitIndex < this.config.hitsLength; hitIndex++) {
      const hit = this.config.hits[hitIndex]
      if (directnessMatches && hit.damageType & damageTags && hit.damageElement & elementTags && hit.outputTag & outputTags) {
        operation(this.a, this.getHitIndex(entityIndex, hitIndex, hitKey), value)
      }
    }
  }

  private matchesTargetTags(entity: OptimizerEntity, entityIndex: number, targetTags: TargetTag): boolean {
    if (targetTags & TargetTag.Self) return entity.primary
    if (targetTags & TargetTag.SelfAndPet) return entity.primary || (entity.pet ?? false)
    if (targetTags & TargetTag.FullTeam) return true
    if (targetTags & TargetTag.SelfAndMemosprite) return entity.primary || entity.memosprite
    if (targetTags & TargetTag.SummonsOnly) return entity.summon
    if (targetTags & TargetTag.SelfAndSummon) return entity.primary || entity.summon
    if (targetTags & TargetTag.MemospritesOnly) return entity.memosprite
    if (targetTags & TargetTag.SingleTarget) {
      const primaryEntity = this.config.entitiesArray[SELF_ENTITY_INDEX]
      if (primaryEntity.memoBuffPriority && this.config.entitiesArray.some((e) => e.memosprite)) return entity.memosprite
      return entity.primary || (entity.pet ?? false)
    }
    return false
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
    const entityIndex = this.config.entitiesArray.findIndex((e) => e.name === entityName)
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

  outputType(o: OutputTag): IncompleteBuffBuilder {
    return this.builder.reset().outputType(o)
  }

  directness(d: DirectnessTag): IncompleteBuffBuilder {
    return this.builder.reset().directness(d)
  }

  actionKind(k: string): IncompleteBuffBuilder {
    return this.builder.reset().actionKind(k)
  }

  deferrable(): IncompleteBuffBuilder {
    return this.builder.reset().deferrable()
  }

  source(s: BuffSource): CompleteBuffBuilder {
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

// Mapping from new AKey names to ComputedStatsObjectExternal keys
const ContainerKeyToExternal: Partial<Record<AKeyType, keyof ComputedStatsObjectExternal>> = {
  ATK_P: Stats.ATK_P as keyof ComputedStatsObjectExternal,
  ATK: Stats.ATK as keyof ComputedStatsObjectExternal,
  BE: Stats.BE as keyof ComputedStatsObjectExternal,
  CD: Stats.CD as keyof ComputedStatsObjectExternal,
  CR: Stats.CR as keyof ComputedStatsObjectExternal,
  DEF_P: Stats.DEF_P as keyof ComputedStatsObjectExternal,
  DEF: Stats.DEF as keyof ComputedStatsObjectExternal,
  EHR: Stats.EHR as keyof ComputedStatsObjectExternal,
  ERR: Stats.ERR as keyof ComputedStatsObjectExternal,
  FIRE_DMG_BOOST: Stats.Fire_DMG as keyof ComputedStatsObjectExternal,
  HP_P: Stats.HP_P as keyof ComputedStatsObjectExternal,
  HP: Stats.HP as keyof ComputedStatsObjectExternal,
  ICE_DMG_BOOST: Stats.Ice_DMG as keyof ComputedStatsObjectExternal,
  IMAGINARY_DMG_BOOST: Stats.Imaginary_DMG as keyof ComputedStatsObjectExternal,
  LIGHTNING_DMG_BOOST: Stats.Lightning_DMG as keyof ComputedStatsObjectExternal,
  OHB: Stats.OHB as keyof ComputedStatsObjectExternal,
  PHYSICAL_DMG_BOOST: Stats.Physical_DMG as keyof ComputedStatsObjectExternal,
  QUANTUM_DMG_BOOST: Stats.Quantum_DMG as keyof ComputedStatsObjectExternal,
  RES: Stats.RES as keyof ComputedStatsObjectExternal,
  SPD_P: Stats.SPD_P as keyof ComputedStatsObjectExternal,
  SPD: Stats.SPD as keyof ComputedStatsObjectExternal,
  WIND_DMG_BOOST: Stats.Wind_DMG as keyof ComputedStatsObjectExternal,
  ELATION_DMG_BOOST: Stats.Elation_DMG as keyof ComputedStatsObjectExternal,
}

export type OptimizerEntity = EntityDefinition & { name: string }
