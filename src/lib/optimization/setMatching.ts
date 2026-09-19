import {
  type SetKey,
  Sets,
} from 'lib/constants/constants'
import { type SetMatches } from 'lib/optimization/setMatchState'
import {
  OrnamentSetKeyToIndex,
  RelicSetKeyToIndex,
} from 'lib/sets/setConfigRegistry'

// SetKeys maps each key name to itself for type-safe set matching
export const SetKeys: Record<SetKey, SetKey> = Object.fromEntries(
  Object.keys(Sets).map((key) => [key, key]),
) as Record<SetKey, SetKey>

export function relic2p(key: SetKey, matches: SetMatches): boolean {
  const index = RelicSetKeyToIndex[key]
  return matches.relic2pSetA === index || matches.relic2pSetB === index
}

export function relic4p(key: SetKey, matches: SetMatches): boolean {
  return matches.relic4pSet === RelicSetKeyToIndex[key]
}

export function ornament2p(key: SetKey, matches: SetMatches): boolean {
  return matches.ornament2pSet === OrnamentSetKeyToIndex[key]
}
