import {BasicStatsArray} from 'lib/optimization/basicStatsArray'
import {BuffSource} from 'lib/optimization/buffSource'
import {ComputedStatsConfigBaseType, ComputedStatsConfigType,} from 'lib/optimization/config/computedStatsConfig'
import {newStatsConfig} from 'lib/optimization/engine/config/statsConfig'
import {Hit} from 'types/hitConditionalTypes'
import {OptimizerContext} from 'types/optimizer'
import {NamedArray} from "lib/optimization/engine/util/namedArray";

enum StatCategory {
  CD,
  NONE,
}

enum AbilityTag {
  BASIC = 1 << 0,
  SKILL = 1 << 1,
  ULTIMATE = 1 << 2,
  TALENT = 1 << 3,
}

enum ElementTag {
  Physical = 1 << 0,
  Fire = 1 << 1,
  Ice = 1 << 2,
  Lightning = 1 << 3,
  Wind = 1 << 4,
  Quantum = 1 << 5,
  Imaginary = 1 << 6,
}

type Tag = ElementTag | AbilityTag

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
 */
export class ComputedStatsContainer {
  public damageTypes: number[] = []

  public entityRegistry: NamedArray<OptimizerEntity>
  public selfEntity: OptimizerEntity

  public a: Float32Array
  // @ts-ignore
  public c: BasicStatsArray

  public actionStatsLength: number
  public entityLength: number
  public damageTypesLength: number
  public statsLength: number
  public arrayLength: number

  public damageTypeIndexLookup: Record<number, number> = {}

  constructor(context: OptimizerContext) {
    // ===== Hits =====

    this.damageTypes = [...activeDamageTypes]
    for (let i = 0; i < this.damageTypes.length; i++) {
      this.damageTypeIndexLookup[this.damageTypes[i]] = i
    }

    // ===== Entities =====

    this.actionStatsLength = Object.keys(newStatsConfig).length
    this.entityLength = context.entities!.length
    this.damageTypesLength = this.damageTypes.length
    this.statsLength = Object.keys(FullStatsConfig).length
    this.arrayLength = this.entityLength * this.damageTypesLength * this.statsLength
    const array = new Float32Array(this.arrayLength)

    this.a = array

    this.entityRegistry = new NamedArray(context.entities!, (entity) => entity.name)
    this.selfEntity = this.entityRegistry.get(0)!
  }

  public buff(key: ActionKeyValue, value: number, source: BuffSource, origin: string, destination: string) {
    if (destination == EntityType.SELF) {
      this.a[key] += value
    }
  }

  public getHit(key: StatKeyValue, hit: Hit) {
    const damageTypeIndex = this.damageTypeIndexLookup[hit.damageType]
    const index = this.getIndex(0, damageTypeIndex, key)

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

  public setHit(key: StatKeyValue, damageType: number, value: number, source: BuffSource, origin?: string, destination?: string) {
    for (let damageTypeIndex = 0; damageTypeIndex < this.damageTypes.length; damageTypeIndex++) {
      const type = this.damageTypes[damageTypeIndex]

      if (damageType & type) {
        if (destination == EntityType.SELF) {
          const entityIndex = 0
          const index = this.getIndex(entityIndex, damageTypeIndex, key)

          this.a[index] = value
        }
      }
    }
  }

  public getActionStat(key: ActionKeyValue) {
  }
  // public getHitStat(key: HitKeyValue, damageType: number) {
  //   const index = this.getIndex(entityIndex, damageTypeIndex, key)
  // }

  // Array structure
  // [action stats]
  // [entity0 damageType0 hitStats]
  // [entity0 damageType1 hitStats]
  // [entity1 damageType0 hitStats]
  // [entity1 damageType1 hitStats]
  public getIndex(entityIndex: number, damageTypeIndex: number, statIndex: number): number {
    return entityIndex * (this.damageTypesLength * this.statsLength)
      + damageTypeIndex * this.statsLength
      + statIndex
      + this.actionStatsLength
  }

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