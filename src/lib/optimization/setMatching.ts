import {
  Constants,
  Sets,
} from 'lib/constants/constants'

const { SetsRelics, SetsOrnaments } = Constants

// SetKeyType is a union of all set key names (e.g. 'SpaceSealingStation' | 'MusketeerOfWildWheat' | ...)
export type SetKeyType = keyof typeof Sets

// SetKeys maps each key name to itself for type-safe set matching
export const SetKeys: Record<SetKeyType, SetKeyType> = Object.fromEntries(
  Object.keys(Sets).map((key) => [key, key]),
) as Record<SetKeyType, SetKeyType>

export type SetCounts = {
  relicMatch2: number
  relicMatch4: number
  ornamentMatch2: number
}

// Bitmask-based set matching — mirrors GPU relic2p/relic4p/ornament2p
const OrnamentSetBitIndex: Record<string, number> = Object.fromEntries(
  Object.keys(SetsOrnaments).map((key, i) => [key, i]),
)
const RelicSetBitIndex: Record<string, number> = Object.fromEntries(
  Object.keys(SetsRelics).map((key, i) => [key, i]),
)

export function ornament2p(key: SetKeyType, sets: SetCounts) {
  return (sets.ornamentMatch2 >> OrnamentSetBitIndex[key]) & 1
}

export function relic2p(key: SetKeyType, sets: SetCounts) {
  return (sets.relicMatch2 >> RelicSetBitIndex[key]) & 1
}

export function relic4p(key: SetKeyType, sets: SetCounts) {
  return (sets.relicMatch4 >> RelicSetBitIndex[key]) & 1
}
