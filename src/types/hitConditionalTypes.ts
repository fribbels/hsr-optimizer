import {
  ElementTag,
  OutputTag,
} from 'lib/optimization/engine/config/tag'
import {
  DamageFunctionType,
} from 'lib/optimization/engine/damage/damageCalculator'

export interface AbilityDefinition {
  hits: HitDefinition[]
}

// Runtime fields added to all hits during execution
interface HitRuntime {
  localHitIndex: number
  registerIndex: number
  sourceEntityIndex: number
}

// Base properties shared by all hit types
interface BaseHitDefinition {
  sourceEntity?: string
  referenceHit?: Hit
  damageFunctionType: DamageFunctionType
  damageType: number
  damageElement: ElementTag
  outputTag: OutputTag
  toughnessDmg?: number
  fixedToughnessDmg?: number // For super break: added without break efficiency multiplier
  activeHit: boolean
  // Common scaling properties (optional for all hit types)
  atkScaling?: number
  hpScaling?: number
  defScaling?: number
}

// Crit hits (default for most abilities)
export interface CritHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Crit
  beScaling?: number // BE-based ATK scaling
  beCap?: number // Maximum BE value for scaling
}

export interface DotHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Dot
  dotBaseChance: number
  dotSplit?: number
  dotStacks?: number
}

export interface BreakHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Break
  specialScaling?: number
}

export interface SuperBreakHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.SuperBreak
  extraSuperBreakModifier?: number
}

export interface AdditionalHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Additional
  crOverride?: number
  cdOverride?: number
}

export interface HealHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Heal
  outputTag: OutputTag.HEAL
  flatHeal?: number
}

export interface ShieldHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Shield
  outputTag: OutputTag.SHIELD
  flatShield?: number
}

// Union type for all hit definitions
export type HitDefinition =
  | CritHitDefinition
  | DotHitDefinition
  | BreakHitDefinition
  | SuperBreakHitDefinition
  | AdditionalHitDefinition
  | HealHitDefinition
  | ShieldHitDefinition

// Specialized Hit types (definition + runtime fields)
export type CritHit = CritHitDefinition & HitRuntime
export type DotHit = DotHitDefinition & HitRuntime
export type BreakHit = BreakHitDefinition & HitRuntime
export type SuperBreakHit = SuperBreakHitDefinition & HitRuntime
export type AdditionalHit = AdditionalHitDefinition & HitRuntime
export type HealHit = HealHitDefinition & HitRuntime
export type ShieldHit = ShieldHitDefinition & HitRuntime

// Union type for all hits (definition + runtime fields)
export type Hit = CritHit | DotHit | BreakHit | SuperBreakHit | AdditionalHit | HealHit | ShieldHit

export interface EntityDefinition {
  primary: boolean
  summon: boolean
  memosprite: boolean
  pet?: boolean

  teammate?: boolean

  memoBuffPriority?: boolean

  memoBaseAtkFlat?: number
  memoBaseHpFlat?: number
  memoBaseDefFlat?: number
  memoBaseSpdFlat?: number

  memoBaseAtkScaling?: number
  memoBaseHpScaling?: number
  memoBaseDefScaling?: number
  memoBaseSpdScaling?: number
}
