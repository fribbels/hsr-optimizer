import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'

// ============== Types ==============

export type AKeyType = keyof typeof newStatsConfig

// Branded types for type safety
declare const AKeyBrand: unique symbol
declare const HKeyBrand: unique symbol

export type AKeyValue = number & { readonly [AKeyBrand]: true }
export type HKeyValue = number & { readonly [HKeyBrand]: true }

// ============== AKey (all stats, indices 0-N) ==============

export const AKey: Record<AKeyType, AKeyValue> = Object.keys(newStatsConfig).reduce(
  (acc, key, index) => {
    acc[key as AKeyType] = index as AKeyValue
    return acc
  },
  {} as Record<AKeyType, AKeyValue>,
)

const AKeyNames = Object.keys(newStatsConfig) as AKeyType[]

export function getAKeyName(key: AKeyValue): AKeyType {
  return AKeyNames[key]
}

// ============== HKey (only hit stats, indices 0-M) ==============

const hitStatEntries = Object.entries(newStatsConfig)
  .filter(([_, value]) => (value as { hit?: boolean }).hit === true)

// HKeyType is the subset of AKeyType that has hit: true
export type HKeyType = (typeof hitStatEntries)[number][0]

export const HKey = hitStatEntries.reduce(
  (acc, [key], index) => {
    acc[key] = index as HKeyValue
    return acc
  },
  {} as Record<string, HKeyValue>,
) as Record<HKeyType, HKeyValue>

const HKeyNames = hitStatEntries.map(([key]) => key)

export function getHKeyName(key: HKeyValue): HKeyType {
  return HKeyNames[key] as HKeyType
}

// ============== Mapping AKey <-> HKey ==============

// Map from AKey index to HKey index (for stats that are hit stats)
export const AToHKey: Partial<Record<AKeyValue, HKeyValue>> = hitStatEntries.reduce(
  (acc, [key], hitIndex) => {
    const actionIndex = AKey[key as AKeyType]
    acc[actionIndex] = hitIndex as HKeyValue
    return acc
  },
  {} as Partial<Record<AKeyValue, HKeyValue>>,
)

// Map from HKey index to AKey index
export const HToAKey: Record<HKeyValue, AKeyValue> = hitStatEntries.reduce(
  (acc, [key], hitIndex) => {
    const actionIndex = AKey[key as AKeyType]
    acc[hitIndex as HKeyValue] = actionIndex
    return acc
  },
  {} as Record<HKeyValue, AKeyValue>,
)

// Helper to check if a stat is a hit stat
export function isHitStat(key: AKeyValue): boolean {
  return AToHKey[key] !== undefined
}

// ============== Lengths ==============

export const ACTION_STATS_LENGTH = Object.keys(newStatsConfig).length
export const HIT_STATS_LENGTH = hitStatEntries.length

// ============== Legacy aliases (for migration) ==============

/** @deprecated Use AKey instead */
export const StatKey = AKey
/** @deprecated Use AKeyType instead */
export type StatKeyType = AKeyType
/** @deprecated Use AKeyValue instead */
export type StatKeyValue = AKeyValue
/** @deprecated Use getAKeyName instead */
export const getStatKeyName = getAKeyName
