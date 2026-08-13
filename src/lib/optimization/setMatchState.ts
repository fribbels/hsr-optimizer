// Leaf module: the SetMatches data shape, with no imports.
//
// This is deliberately separate from setMatching.ts, which resolves SetKeys through
// setConfigRegistry. basicStatsArray.ts holds a SetMatches and must be able to construct
// an empty one; importing setMatching.ts there would pull in setConfigRegistry, which
// imports every set config, which imports basicStatsArray back - a cycle that leaves
// WgslStatName undefined at module evaluation time.

// Sentinel meaning "no set matched this slot". Registry indices start at 0, so a
// negative value cannot collide with a real set.
export const NO_SET = -1

// Explicit match representation for the relic/ornament sets equipped on a build.
// Four relic slots admit at most two distinct 2-piece sets (relic2pSetA/B) and at
// most one 4-piece set (relic4pSet, which is always equal to relic2pSetA when set).
// Two ornament slots admit at most one 2-piece set.
//
// Set-definition code uses the key-based accessors in setMatching.ts. Stat dispatch
// reads these indices directly after checking NO_SET.
export type SetMatches = {
  readonly relic2pSetA: number, // NO_SET when unmatched
  readonly relic2pSetB: number, // NO_SET when unmatched
  readonly relic4pSet: number, // NO_SET when no 4-piece set; otherwise equals relic2pSetA
  readonly ornament2pSet: number, // NO_SET when unmatched
}

export type MutableSetMatches = { -readonly [K in keyof SetMatches]: SetMatches[K] }

export function emptySetMatches(): MutableSetMatches {
  return {
    relic2pSetA: NO_SET,
    relic2pSetB: NO_SET,
    relic4pSet: NO_SET,
    ornament2pSet: NO_SET,
  }
}

export function computeSetMatchesInPlace(
  target: MutableSetMatches,
  sets: readonly number[],
): void {
  const headSet = sets[0]
  const handsSet = sets[1]
  const bodySet = sets[2]
  const feetSet = sets[3]
  const planarSet = sets[4]
  const ropeSet = sets[5]

  if (headSet === handsSet && handsSet === bodySet && bodySet === feetSet) {
    target.relic2pSetA = headSet
    target.relic2pSetB = NO_SET
    target.relic4pSet = headSet
  } else {
    target.relic4pSet = NO_SET
    target.relic2pSetA = NO_SET
    target.relic2pSetB = NO_SET

    const headRepeats = headSet === handsSet || headSet === bodySet || headSet === feetSet
    const handsRepeats = handsSet === bodySet || handsSet === feetSet
    const bodyRepeats = bodySet === feetSet
    const handsSeenEarlier = handsSet === headSet
    const bodySeenEarlier = bodySet === headSet || bodySet === handsSet

    // Four relic slots can contain at most two distinct 2-piece matches.
    if (headRepeats) {
      target.relic2pSetA = headSet
    }

    if (handsRepeats && !handsSeenEarlier) {
      if (target.relic2pSetA === NO_SET) {
        target.relic2pSetA = handsSet
      } else {
        target.relic2pSetB = handsSet
      }
    }

    if (bodyRepeats && !bodySeenEarlier) {
      if (target.relic2pSetA === NO_SET) {
        target.relic2pSetA = bodySet
      } else {
        target.relic2pSetB = bodySet
      }
    }
  }

  target.ornament2pSet = planarSet === ropeSet ? planarSet : NO_SET
}

export function computeSetMatches(sets: readonly number[]): SetMatches {
  const target = emptySetMatches()
  computeSetMatchesInPlace(target, sets)
  return target
}
