import { ElementTag } from 'lib/optimization/engine/config/tag'
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
  toughnessDmg?: number
  activeHit: boolean
  // Common scaling properties (optional for all hit types)
  atkScaling?: number
  hpScaling?: number
  defScaling?: number
}

// Crit hits (default for most abilities)
export interface CritHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Crit
}

// DOT hits with specialized properties
export interface DotHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Dot
  // DOT-specific properties (moved from stats)
  dotBaseChance: number
  dotSplit?: number
  dotStacks?: number
}

// Break hits
export interface BreakHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Break
  specialScaling?: number
}

// Super Break hits
export interface SuperBreakHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.SuperBreak
}

// Additional damage hits
export interface AdditionalHitDefinition extends BaseHitDefinition {
  damageFunctionType: DamageFunctionType.Additional
}

// Union type for all hit definitions
export type HitDefinition =
  | CritHitDefinition
  | DotHitDefinition
  | BreakHitDefinition
  | SuperBreakHitDefinition
  | AdditionalHitDefinition

// Specialized Hit types (definition + runtime fields)
export type CritHit = CritHitDefinition & HitRuntime
export type DotHit = DotHitDefinition & HitRuntime
export type BreakHit = BreakHitDefinition & HitRuntime
export type SuperBreakHit = SuperBreakHitDefinition & HitRuntime
export type AdditionalHit = AdditionalHitDefinition & HitRuntime

// Union type for all hits (definition + runtime fields)
export type Hit = CritHit | DotHit | BreakHit | SuperBreakHit | AdditionalHit

// Type guards for Hit (runtime)
export function isDotHit(hit: Hit): hit is DotHit {
  return hit.damageFunctionType === DamageFunctionType.Dot
}

export function isCritHit(hit: Hit): hit is CritHit {
  return hit.damageFunctionType === DamageFunctionType.Crit
}

export interface EntityDefinition {
  primary: boolean
  summon: boolean
  memosprite: boolean
  pet?: boolean

  teammate?: boolean

  memoBaseAtkFlat?: number
  memoBaseHpFlat?: number
  memoBaseDefFlat?: number
  memoBaseSpdFlat?: number

  memoBaseAtkScaling?: number
  memoBaseHpScaling?: number
  memoBaseDefScaling?: number
  memoBaseSpdScaling?: number
}
