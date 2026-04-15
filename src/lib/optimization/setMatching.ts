import {
  type SetKey,
  Sets,
} from 'lib/constants/constants'
import {
  OrnamentSetKeyToIndex,
  RelicSetKeyToIndex,
} from 'lib/sets/setConfigRegistry'

// SetKeys maps each key name to itself for type-safe set matching
export const SetKeys: Record<SetKey, SetKey> = Object.fromEntries(
  Object.keys(Sets).map((key) => [key, key]),
) as Record<SetKey, SetKey>

export type SetCounts = {
  relicMatch2: number,
  relicMatch4: number,
  ornamentMatch2: number,
}

export function ornament2p(key: SetKey, sets: SetCounts) {
  return (sets.ornamentMatch2 >> OrnamentSetKeyToIndex[key]) & 1
}

export function relic4p(key: SetKey, sets: SetCounts) {
  return (sets.relicMatch4 >> RelicSetKeyToIndex[key]) & 1
}
