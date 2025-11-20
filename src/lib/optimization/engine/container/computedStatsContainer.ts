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
  SELF_ENTITY,
} from 'lib/optimization/engine/config/tag'
import {
  BuffBuilder,
  CompleteBuffBuilder,
  IncompleteBuffBuilder,
} from 'lib/optimization/engine/container/buffBuilder'
import { NamedArray } from 'lib/optimization/engine/util/namedArray'
import { Hit } from 'types/hitConditionalTypes'
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
  ) {
    this.statsLength = STATS_LENGTH

    // Hits

    this.hits = action.hits!
    this.hitsLength = this.hits.length

    // Entities
    this.entitiesLength = context.entities!.length
    this.entityRegistry = new NamedArray(context.entities!, (entity) => entity.name)
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
 *   [Action]
 *   [[Entity][Entity]]
 *   [[[Hit][Hit][Hit][Hit]]]
 *   [[[[Stat,Stat,Stat,...],...],...]]
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
    this.builder = new BuffBuilder(this)
  }

  setConfig(config: ComputedStatsContainerConfig) {
    this.config = config
    this.a = new Float32Array(this.config.arrayLength)
  }

  setRegisters(context: OptimizerContext) {
    const hitRegistersLength = context.outputRegistersLength
    const actionRegistersLength = context.actionDeclarations.length

    this.o = new Float32Array(hitRegistersLength + actionRegistersLength)
  }

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

  buff(key: StatKeyValue, value: number, config: BuffBuilder<true>) {
    this.internalBuff(
      key,
      value,
      config._source,
      config._origin,
      config._target,
      config._elementTags,
      config._damageTags,
    )
  }

  internalBuff(
    key: StatKeyValue,
    value: number,
    source: BuffSource,
    origin: number,
    target: number,
    elementTags: ElementTag,
    damageTags: DamageTag,
  ): void {
    if (value == 0) return

    if (elementTags == ALL_ELEMENT_TAGS && damageTags == ALL_DAMAGE_TAGS) {
      const index = this.getActionIndex(target, key)
      this.a[index] = value
      return
    }

    for (let hitIndex = 0; hitIndex < this.config.hitsLength; hitIndex++) {
      const hit = this.config.hits[hitIndex]

      if (hit.damageType & damageTags && hit.damageElement & elementTags) {
        const index = this.getHitIndex(target, hitIndex, key)
        this.a[index] = value
      }
    }
  }

  public getValue(key: StatKeyValue, hitIndex: number) {
    return this.a[this.getActionIndex(SELF_ENTITY, key)] + this.a[this.getHitIndex(SELF_ENTITY, hitIndex, key)]
  }

  public setRegister(index: number) {
  }

  public getActionIndex(entityIndex: number, statIndex: number): number {
    return entityIndex * (this.config.statsLength * (this.config.hitsLength + 1))
      + statIndex
  }

  public getHitIndex(entityIndex: number, hitIndex: number, statIndex: number): number {
    return entityIndex * (this.config.statsLength * (this.config.hitsLength + 1))
      + (hitIndex + 1) * this.config.statsLength
      + statIndex
  }

  elements(e: ElementTag): IncompleteBuffBuilder {
    return this.builder.reset().elements(e)
  }

  damageType(d: DamageTag): IncompleteBuffBuilder {
    return this.builder.reset().damageType(d)
  }

  origin(e: string): IncompleteBuffBuilder {
    return this.builder.reset().origin(e)
  }

  target(e: string): IncompleteBuffBuilder {
    return this.builder.reset().target(e)
  }

  source(s: BuffSource): CompleteBuffBuilder {
    return this.builder.reset().source(s)
  }

  public getHit(key: StatKeyValue, hitIndex: number) {
    const index = this.getHitIndex(0, hitIndex, key)

    return this.a[index]
  }

  public buffHit(key: StatKeyValue, damageType: number, value: number, source: BuffSource, origin?: string, destination?: string) {
    for (let damageTypeIndex = 0; damageTypeIndex < this.damageTypes.length; damageTypeIndex++) {
      const type = this.damageTypes[damageTypeIndex]

      if (damageType & type) {
        if (destination == EntityType.SELF) {
          const entityIndex = 0
          const index = this.getIndex(entityIndex, damageTypeIndex, key)

          this.a[index] += value
        }
      }
    }
  }

  public set(key: ActionKeyValue, value: number, source: BuffSource, origin?: string, destination?: string) {
    if (!destination || destination == EntityType.SELF) {
      this.a[key] = value
    }
  }

  // // Array structure
  // // [action stats]
  // // [entity0 damageType0 hitStats]
  // // [entity0 damageType1 hitStats]
  // // [entity1 damageType0 hitStats]
  // // [entity1 damageType1 hitStats]
  // public getIndex(entityIndex: number, damageTypeIndex: number, statIndex: number): number {
  //   return entityIndex * (this.damageTypesLength * this.statsLength)
  //     + damageTypeIndex * this.statsLength
  //     + statIndex
  //     + this.actionStatsLength
  // }

  public setPrecompute(array: Float32Array) {
    this.a.set(array)
  }

  public setBasic(basic: BasicStatsArray) {
    this.c = basic
  }
}

export const EntityType = {
  SELF: 'SELF',
  TEAM: 'TEAM',
} as const

export interface OptimizerEntity {
  name: string
  primary: boolean
  summon: boolean
  memosprite: boolean
}
