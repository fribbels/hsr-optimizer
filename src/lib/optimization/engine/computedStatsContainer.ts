import {
  ADDITIONAL_DMG_TYPE,
  BASIC_DMG_TYPE,
  BREAK_DMG_TYPE,
  DamageType,
  DOT_DMG_TYPE,
  FUA_DMG_TYPE,
  MEMO_DMG_TYPE,
  SKILL_DMG_TYPE,
  SUPER_BREAK_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Namespaces } from 'lib/i18n/i18n'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { BuffSource } from 'lib/optimization/buffSource'
import { KeysType } from 'lib/optimization/computedStatsArray'
import {
  BaseComputedStatsConfig,
  baseComputedStatsObject,
  ComputedStatsConfigBaseType,
  ComputedStatsConfigType,
  ComputedStatsObject,
} from 'lib/optimization/config/computedStatsConfig'
import { getTeammateMetadata } from 'lib/optimization/context/calculateActions'
import { OptimizerContext } from 'types/optimizer'
import Resources from 'types/resources'

const keyPrefix = 'ExpandedDataPanel.BuffsAnalysisDisplay.Stats'
type Prefixed = Resources['optimizerTab']['ExpandedDataPanel']['BuffsAnalysisDisplay']['Stats']

interface tInput {
  ns: Namespaces
  key: string
  args?: Record<string, string>
}

interface SimpleLabel extends tInput {
  composite?: false
}

const createI18nKey = <K extends string>(ns: SimpleLabel['ns'], path: string, argName?: string) => (value: K): SimpleLabel =>
  argName
    ? { ns, key: path, args: { [argName]: value } }
    : { ns, key: `${path}.${value}` }

const commonReadableStat = createI18nKey<keyof Resources['common']['ReadableStats']>('common', 'ReadableStats')
const commonStat = createI18nKey<keyof Resources['common']['Stats']>('common', 'Stats')
const optimizerTabMisc = createI18nKey<keyof Prefixed['Misc']>('optimizerTab', `${keyPrefix}.Misc`)
const optimizerTabDmgTypes = createI18nKey<keyof Prefixed['DmgTypes']>('optimizerTab', `${keyPrefix}.DmgTypes`)
const optimizerTabCompositeSuffix = createI18nKey<keyof Prefixed['CompositeLabels']['Suffix']>('optimizerTab', `${keyPrefix}.CompositeLabels.Suffix`)
const optimizerTabCompositePrefix = createI18nKey<keyof Prefixed['CompositeLabels']['Prefix']>('optimizerTab', `${keyPrefix}.CompositeLabels.Prefix`)
const optimizerTabUnconvertible = createI18nKey<keyof Resources['common']['Stats']>('optimizerTab', `${keyPrefix}.Unconvertible`, 'stat')
const optimizerTabResPen = createI18nKey<keyof Resources['common']['Elements']>('optimizerTab', `${keyPrefix}.ResPen`, 'element')

export const globalStatsConfig = {}

export const actionStatsConfig = {
  // Core stats
  HP_P: { label: commonReadableStat('HP%') },
  ATK_P: { label: commonReadableStat('ATK%') },
  DEF_P: { label: commonReadableStat('DEF%') },
  SPD_P: { label: commonReadableStat('SPD%') },
  HP: { flat: true, label: commonReadableStat('HP') },
  ATK: { flat: true, label: commonReadableStat('ATK') },
  DEF: { flat: true, label: commonReadableStat('DEF') },
  SPD: { flat: true, default: 0.0001, label: commonReadableStat('SPD') },
  CR: { label: commonReadableStat('CRIT Rate') },
  CD: { label: commonReadableStat('CRIT DMG') },
  EHR: { label: commonReadableStat('Effect Hit Rate') },
  RES: { label: commonReadableStat('Effect RES') },
  BE: { label: commonReadableStat('Break Effect') },
  ERR: { label: commonReadableStat('Energy Regeneration Rate') },
  OHB: { label: commonReadableStat('Outgoing Healing Boost') },

  // Elemental stats
  PHYSICAL_DMG_BOOST: { label: commonStat('Physical DMG Boost') },
  FIRE_DMG_BOOST: { label: commonStat('Fire DMG Boost') },
  ICE_DMG_BOOST: { label: commonStat('Ice DMG Boost') },
  LIGHTNING_DMG_BOOST: { label: commonStat('Lightning DMG Boost') },
  WIND_DMG_BOOST: { label: commonStat('Wind DMG Boost') },
  QUANTUM_DMG_BOOST: { label: commonStat('Quantum DMG Boost') },
  IMAGINARY_DMG_BOOST: { label: commonStat('Imaginary DMG Boost') },

  ELEMENTAL_DMG: { label: optimizerTabMisc('Elemental DMG') },

  // Base
  BASE_HP: { flat: true, label: optimizerTabMisc('Base HP') },
  BASE_ATK: { flat: true, label: optimizerTabMisc('Base ATK') },
  BASE_DEF: { flat: true, label: optimizerTabMisc('Base DEF') },
  BASE_SPD: { flat: true, label: optimizerTabMisc('Base SPD') },

  // Secondary conversions
  UNCONVERTIBLE_HP_BUFF: { flat: true, label: optimizerTabUnconvertible('HP') },
  UNCONVERTIBLE_ATK_BUFF: { flat: true, label: optimizerTabUnconvertible('ATK') },
  UNCONVERTIBLE_DEF_BUFF: { flat: true, label: optimizerTabUnconvertible('DEF') },
  UNCONVERTIBLE_SPD_BUFF: { flat: true, label: optimizerTabUnconvertible('SPD') },
  UNCONVERTIBLE_CR_BUFF: { label: optimizerTabUnconvertible('CRIT Rate') },
  UNCONVERTIBLE_CD_BUFF: { label: optimizerTabUnconvertible('CRIT DMG') },
  UNCONVERTIBLE_EHR_BUFF: { label: optimizerTabUnconvertible('Effect Hit Rate') },
  UNCONVERTIBLE_BE_BUFF: { label: optimizerTabUnconvertible('Break Effect') },
  UNCONVERTIBLE_OHB_BUFF: { label: optimizerTabUnconvertible('Outgoing Healing Boost') },
  UNCONVERTIBLE_RES_BUFF: { label: optimizerTabUnconvertible('Effect RES') },
  UNCONVERTIBLE_ERR_BUFF: { label: optimizerTabUnconvertible('Energy Regeneration Rate') },

  // EHP
  DMG_RED_MULTI: { default: 1, label: optimizerTabMisc('DMG reduction') }, // Dmg reduction multiplier for EHP calcs - this should be multiplied by (1 - multi) instead of additive
  EHP: { flat: true, label: optimizerTabMisc('Effective HP') },

  // Misc configs
  SUMMONS: { flat: true, label: optimizerTabMisc('Summons') },
  MEMOSPRITE: { bool: true, label: optimizerTabMisc('Memosprite') },
  ENEMY_WEAKNESS_BROKEN: { bool: true, label: optimizerTabMisc('Enemy weakness broken') },
  MEMO_BUFF_PRIORITY: { bool: true, label: optimizerTabMisc('Prioritize memosprite buffs') },
  DEPRIORITIZE_BUFFS: { bool: true, label: optimizerTabMisc('Deprioritize buffs') },
  COMBO_DMG: { flat: true, label: optimizerTabMisc('Combo DMG') },

  // DOT
  DOT_CHANCE: { label: optimizerTabMisc('Dot base chance') },
  EFFECT_RES_PEN: { label: optimizerTabMisc('Effect RES PEN') },
  DOT_SPLIT: { label: optimizerTabMisc('Dot DMG split') }, // Black Swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
  DOT_STACKS: { flat: true, label: optimizerTabMisc('Dot stacks') },

  // Heal / Shield
  HEAL_TYPE: { flat: true, label: optimizerTabMisc('Heal ability type') },
  HEAL_FLAT: { flat: true, label: optimizerTabMisc('Heal flat') },
  HEAL_SCALING: { label: optimizerTabMisc('Heal scaling') },
  HEAL_VALUE: { flat: true, label: optimizerTabMisc('Heal value') },
  SHIELD_FLAT: { flat: true, label: optimizerTabMisc('Shield flat') },
  SHIELD_SCALING: { label: optimizerTabMisc('Shield scaling') },
  SHIELD_VALUE: { flat: true, label: optimizerTabMisc('Shield value') },
  SHIELD_BOOST: { label: optimizerTabMisc('Shield boost') },

  // Elemental res pen
  PHYSICAL_RES_PEN: { label: optimizerTabResPen('Physical') },
  FIRE_RES_PEN: { label: optimizerTabResPen('Fire') },
  ICE_RES_PEN: { label: optimizerTabResPen('Ice') },
  LIGHTNING_RES_PEN: { label: optimizerTabResPen('Lightning') },
  WIND_RES_PEN: { label: optimizerTabResPen('Wind') },
  QUANTUM_RES_PEN: { label: optimizerTabResPen('Quantum') },
  IMAGINARY_RES_PEN: { label: optimizerTabResPen('Imaginary') },

  // Misc variables that don't need to be split into abilities yet
  SUPER_BREAK_DEF_PEN: { label: optimizerTabMisc('Super Break DEF PEN') },
  SUPER_BREAK_DMG_BOOST: { label: optimizerTabMisc('Super Break DMG Boost') },
  SUPER_BREAK_VULNERABILITY: { label: optimizerTabMisc('Super Break Vulnerability') },
  ADDITIONAL_DMG_BOOST: { label: optimizerTabMisc('Additional DMG boost') },
} as const

export const hitStatsConfig = {
  ATK_SCALING: { separated: true, label: optimizerTabCompositeSuffix('ATK scaling') },
  DEF_SCALING: { separated: true, label: optimizerTabCompositeSuffix('DEF scaling') },
  HP_SCALING: { separated: true, label: optimizerTabCompositeSuffix('HP scaling') },
  SPECIAL_SCALING: { separated: true, label: optimizerTabCompositeSuffix('Special scaling') },

  ATK_P_BOOST: { label: optimizerTabCompositeSuffix('ATK % boost') },
  CR_BOOST: { label: optimizerTabCompositeSuffix('Crit Rate boost') },
  CD_BOOST: { label: optimizerTabCompositeSuffix('Crit DMG boost') },
  DMG_BOOST: { separated: true, label: optimizerTabCompositeSuffix('DMG boost') }, // When merged this is just ELEMENTAL_DMG

  VULNERABILITY: { label: optimizerTabCompositeSuffix('Vulnerability') },
  RES_PEN: { label: optimizerTabCompositeSuffix('RES PEN') },
  DEF_PEN: { label: optimizerTabCompositeSuffix('DEF PEN') },
  BREAK_DEF_PEN: { label: optimizerTabCompositeSuffix('Break DEF PEN') },

  TOUGHNESS_DMG: { flat: true, separated: true, label: optimizerTabCompositeSuffix('Toughness DMG') },
  SUPER_BREAK_MODIFIER: { label: optimizerTabCompositeSuffix('Super Break multiplier') },
  BREAK_EFFICIENCY_BOOST: { label: optimizerTabCompositeSuffix('Break Efficiency boost') },

  TRUE_DMG_MODIFIER: { label: optimizerTabCompositeSuffix('True DMG multiplier') },
  FINAL_DMG_BOOST: { label: optimizerTabCompositeSuffix('Final DMG multiplier') },
  BREAK_DMG_MODIFIER: { separated: true, label: optimizerTabCompositeSuffix('Break DMG multiplier') },

  ADDITIONAL_DMG_SCALING: { separated: true, label: optimizerTabCompositeSuffix('Additional DMG scaling') },
  ADDITIONAL_DMG: { flat: true, separated: true, label: optimizerTabCompositeSuffix('Additional DMG') },

  DMG: { flat: true, label: optimizerTabCompositeSuffix('DMG') },
} as const

enum StatCategory {
  CD,
  NONE,
}

export const FullStatsConfig: ComputedStatsConfigType = Object.fromEntries(
  [...Object.entries(actionStatsConfig), ...Object.entries(hitStatsConfig)].map(([key, value], index) => {
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
 * Each hit can have multiple damage types
 * Each hit has its own damage function
 *
 * Stats are calculated once per action
 * Damage is calculated once per hit
 *
 * Each individual damage type has its own container of stats. e.g. SKILL VULNERABILITY, ULT DEF PEN, etc
 *
 * Rutilant Arena set buffs SKILL | BASIC
 * What if we're calculating a SKILL | ULT hit?
 * Store every possible damage type from a character
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

  constructor(public context: OptimizerContext) {
    // ===== Hits =====

    const hitActions = context.hitActions ?? []
    const activeDamageTypes = new Set<number>()

    for (let i = 1; i < hitActions.length; i++) {
      const hitAction = hitActions[i]
      for (const hit of hitAction.hits) {
        activeDamageTypes.add(hit.damageType)
      }
    }

    // ===== Entities =====

    this.actionStatsLength = Object.keys(actionStatsConfig).length
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

  public buffHit(key: HitKeyValue, damageType: number, value: number, source: BuffSource, origin?: string, destination?: string) {
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

  public setPrecompute(container: ComputedStatsContainer) {
    this.a.set(container.a)
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

export type StatKeyType = keyof typeof FullStatsConfig
export type ActionKeyType = keyof typeof actionStatsConfig
export type HitKeyType = keyof typeof hitStatsConfig

export const StatKey: Record<StatKeyType, number> = Object.keys(FullStatsConfig).reduce(
  (acc, key, index) => {
    acc[key as StatKeyType] = index
    return acc
  },
  {} as Record<StatKeyType, number>,
)

declare const ActionKeyBrand: unique symbol
declare const HitKeyBrand: unique symbol

export type ActionKeyValue = number & { readonly [ActionKeyBrand]: true }
export type HitKeyValue = number & { readonly [HitKeyBrand]: true }

export const ActionKey: Record<ActionKeyType, ActionKeyValue> = Object.keys(actionStatsConfig).reduce(
  (acc, key, index) => {
    acc[key as ActionKeyType] = index as ActionKeyValue // Add type assertion here
    return acc
  },
  {} as Record<ActionKeyType, ActionKeyValue>,
)

export const HitKey: Record<HitKeyType, HitKeyValue> = Object.keys(hitStatsConfig).reduce(
  (acc, key, index) => {
    acc[key as HitKeyType] = index as HitKeyValue // Add type assertion here
    return acc
  },
  {} as Record<HitKeyType, HitKeyValue>,
)

export class NamedArray<T> {
  private readonly items: T[] = []
  private readonly nameToIndex = new Map<string, number>()

  constructor(
    items: T[],
    private getKey: (item: T) => string,
  ) {
    items.forEach((item, index) => {
      this.items[index] = item
      this.nameToIndex.set(this.getKey(item), index)
    })
  }

  // Array-like access
  get(index: number): T | undefined {
    return this.items[index]
  }

  // Map-like access
  getByKey(key: string): T | undefined {
    const index = this.nameToIndex.get(key)
    return index !== undefined ? this.items[index] : undefined
  }

  getIndex(key: string): number {
    return this.nameToIndex.get(key) ?? -1
  }

  has(key: string): boolean {
    return this.nameToIndex.has(key)
  }

  get length(): number {
    return this.items.length
  }

  get keys(): string[] {
    return Array.from(this.nameToIndex.keys())
  }

  get values(): T[] {
    return [...this.items]
  }

  forEach(callback: (item: T, index: number, key: string) => void): void {
    this.items.forEach((item, index) => {
      callback(item, index, this.getKey(item))
    })
  }

  find(predicate: (item: T, index: number) => boolean): T | undefined {
    return this.items.find(predicate)
  }

  findIndex(predicate: (item: T, index: number) => boolean): number {
    return this.items.findIndex(predicate)
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.items
  }
}
