// Leaf module: the SetMatches data shape, with no imports.
//
// This is deliberately separate from setMatching.ts, which resolves SetKeys through
// setConfigRegistry. basicStatsArray.ts holds a SetMatches and must be able to construct
// an empty one; importing setMatching.ts there would pull in setConfigRegistry, which
// imports every set config, which imports basicStatsArray back - a cycle that leaves
// WgslStatName undefined at module evaluation time.

// Sentinel meaning "no set matched this slot". Set indices are contiguous registry
// indices starting at 0 (enforced by assertValidSetConfigList in setConfigRegistry.ts),
// so a negative value can never collide with a real set. The GPU mirror in
// lib/gpu/wgsl/structs.wgsl uses 0xFFFFFFFFu, since its fields are u32.
export const NO_SET = -1

// Explicit match representation for the relic/ornament sets equipped on a build.
// Four relic slots admit at most two distinct 2-piece sets (relic2pSetA/B) and at
// most one 4-piece set (relic4pSet, which is always equal to relic2pSetA when set).
// Two ornament slots admit at most one 2-piece set.
//
// Every field is either a real set index or NO_SET, so the fields are self-describing
// and carry no stale values between computations. Read them through the
// relic2p/relic4p/ornament2p accessors in setMatching.ts.
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
