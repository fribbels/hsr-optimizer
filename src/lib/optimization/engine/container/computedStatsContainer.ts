import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { BuffSource } from 'lib/optimization/buffSource'
import {
  ComputedStatsConfigBaseType,
  ComputedStatsConfigType,
} from 'lib/optimization/config/computedStatsConfig'
import { StatKeyValue } from 'lib/optimization/engine/config/keys'
import {
  newStatsConfig,
  STATS_LENGTH,
} from 'lib/optimization/engine/config/statsConfig'
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
  public entitiesArray: OptimizerEntity[]  // Plain array for serialization
  public selfEntity: OptimizerEntity

  public hits: Hit[]

  public hitsLength: number
  public entitiesLength: number
  public statsLength: number
  public arrayLength: number
  public outputRegistersLength: number

  constructor(
    action: OptimizerAction,
    context: OptimizerContext,
    entityRegistry: NamedArray<OptimizerEntity>,
  ) {
    this.statsLength = STATS_LENGTH

    // Hits
    this.hits = action.hits!
    this.hitsLength = this.hits.length

    // Entities
    this.entityRegistry = entityRegistry
    this.entitiesArray = entityRegistry.values  // Store plain array for worker transfer
    this.entitiesLength = entityRegistry.length
    this.selfEntity = this.entityRegistry.get(0)!

    // Each entity x stats x hits, plus the action stats
    this.arrayLength = this.entitiesLength * this.statsLength * (this.hitsLength + 1)
    this.outputRegistersLength = context.outputRegistersLength
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
 * Array structure
 *   [Action (this container)                                                 ...]
 *   [Entity 0                   ][Entity 1                    ][Entity 2    ]...
 *   [Action stats][Hit 0][Hit 1][Hit 2][Action stats][Hit 0][Hit 1][Hit 2]......
 *   [ATK, DEF, HP, SPD, CR, CD, BE, RES, EHR, OHB, ERR, DMG_BOOST, DEF_PEN].....
 *
 * Key points:
 * - Each container is 1 action
 * - Multiple entities per action (e.g., Aglaea + Garmentmaker)
 * - Each entity has: 1 action-level + N hit-scope stat blocks
 * - Each block contains all stats (ATK, DEF, DMG_BOOST, etc.)
 * - Hit definitions are shared, but each entity has its own stat values
 */
export class ComputedStatsContainer {
  // @ts-ignore
  public a: Float32Array

  // @ts-ignore
  public o: Float32Array

  // @ts-ignore
  public c: BasicStatsArray

  // @ts-ignore
  public config: ComputedStatsContainerConfig
  private readonly builder: BuffBuilder

  constructor() {
    this.builder = new BuffBuilder()
  }

  // ============== Array Initialization ==============

  public initializeArrays(maxArrayLength: number, context: OptimizerContext) {
    this.a = new Float32Array(maxArrayLength)
    this.setRegisters(context)
  }

  // ============== Precomputes ==============

  public setConfig(config: ComputedStatsContainerConfig) {
    this.config = config
    // Reuse existing array - don't recreate (performance optimization)
    this.builder.setConfig(config)
  }

  public setPrecompute(array: Float32Array) {
    this.a.set(array)
  }

  public setBasic(basic: BasicStatsArray) {
    this.c = basic
  }

  public setRegisters(context: OptimizerContext) {
    const hitRegistersLength = context.outputRegistersLength
    const actionRegistersLength = context.actionDeclarations.length

    this.o = new Float32Array(hitRegistersLength + actionRegistersLength)
  }

  // ============== Buffs ==============

  set(key: StatKeyValue, value: number, config: BuffBuilder<true>) {
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

  buff(key: StatKeyValue, value: number, config: BuffBuilder<true>) {
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

  public actionBuff(key: StatKeyValue, value: number, targetTags: TargetTag = TargetTag.SelfAndPet) {
    const entities = this.getTargetEntities(0, targetTags)
    for (const entityIndex of entities) {
      this.a[this.getActionIndex(entityIndex, key)] += value
    }
  }

  public actionSet(key: StatKeyValue, value: number, targetTags: TargetTag = TargetTag.SelfAndPet) {
    const entities = this.getTargetEntities(0, targetTags)
    for (const entityIndex of entities) {
      this.a[this.getActionIndex(entityIndex, key)] = value
    }
  }

  internalBuff(
    key: StatKeyValue,
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
        this.applyToMatchingHits(entityIndex, key, value, operator, elementTags, damageTags)
      }
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
    key: StatKeyValue,
    value: number,
    operator: (index: number, value: number) => void,
    elementTags: ElementTag,
    damageTags: DamageTag,
  ): void {
    for (let hitIndex = 0; hitIndex < this.config.hitsLength; hitIndex++) {
      const hit = this.config.hits[hitIndex]
      if (hit.damageType & damageTags && hit.damageElement & elementTags) {
        operator(this.getHitIndex(entityIndex, hitIndex, key), value)
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

  setHitRegisterValue(index: number, value: number) {
    this.o[index] = value
  }

  setActionRegisterValue(index: number, value: number) {
    this.o[this.config.outputRegistersLength + index] = value
  }

  getHitRegisterValue(index: number) {
    return this.o[index]
  }

  getActionRegisterValue(index: number) {
    return this.o[this.config.outputRegistersLength + index]
  }

  // ============== Value Getters ==============

  public getValue(key: StatKeyValue, hitIndex: number) {
    const hit = this.config.hits[hitIndex]
    const sourceEntityIndex = hit.sourceEntityIndex ?? 0

    const actionValue = this.a[this.getActionIndex(sourceEntityIndex, key)]
    const hitValue = this.a[this.getHitIndex(sourceEntityIndex, hitIndex, key)]

    return actionValue + hitValue
  }

  public getActionValue(key: StatKeyValue, entityName: string): number {
    const entityIndex = this.config.entityRegistry.getIndex(entityName)
    return this.a[this.getActionIndex(entityIndex, key)]
  }

  public getHitValue(key: StatKeyValue, hitIndex: number) {
    const hit = this.config.hits[hitIndex]
    const sourceEntityIndex = hit.sourceEntityIndex ?? 0

    return this.a[this.getHitIndex(sourceEntityIndex, hitIndex, key)]
  }

  // ============== Indexing ==============

  public getActionIndex(entityIndex: number, statIndex: number): number {
    return entityIndex * (this.config.statsLength * (this.config.hitsLength + 1))
      + statIndex
  }

  public getHitIndex(entityIndex: number, hitIndex: number, statIndex: number): number {
    return entityIndex * (this.config.statsLength * (this.config.hitsLength + 1))
      + (hitIndex + 1) * this.config.statsLength
      + statIndex
  }

  // ============== Buff builder ==============

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

export const EntityType = {
  SELF: 'SELF',
  TEAM: 'TEAM',
} as const

export type OptimizerEntity = EntityDefinition & { name: string }
