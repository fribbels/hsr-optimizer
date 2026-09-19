import { type SetKey } from 'lib/constants/constants'
import {
  ornament2p,
  relic2p,
  relic4p,
} from 'lib/optimization/setMatching'
import {
  emptySetMatches,
  type SetMatches,
} from 'lib/optimization/setMatchState'
import {
  OrnamentSetKeyToIndex,
  RelicSetKeyToIndex,
} from 'lib/sets/setConfigRegistry'
import {
  describe,
  expect,
  it,
} from 'vitest'

// Real setKeys whose registry index is known and stable: RelicSetKeyToIndex/OrnamentSetKeyToIndex
// preserve insertion order matching the sorted (by info.index) config arrays, so the setKey at
// position i in Object.keys(...) always has index i.
const relicKeys = Object.keys(RelicSetKeyToIndex) as SetKey[]
const ornamentKeys = Object.keys(OrnamentSetKeyToIndex) as SetKey[]

const relicKeyAt = (index: number) => relicKeys[index]
const ornamentKeyAt = (index: number) => ornamentKeys[index]

function withMatches(overrides: Partial<SetMatches>): SetMatches {
  return { ...emptySetMatches(), ...overrides }
}

describe('relic2p', () => {
  it('returns false for every set when both slots are NO_SET', () => {
    const matches = emptySetMatches()
    expect(relic2p(relicKeyAt(0), matches)).toBe(false)
    expect(relic2p(relicKeyAt(1), matches)).toBe(false)
  })

  it('matches setA when only setA is populated', () => {
    const matches = withMatches({ relic2pSetA: 2 })
    expect(relic2p(relicKeyAt(2), matches)).toBe(true)
    expect(relic2p(relicKeyAt(3), matches)).toBe(false)
  })

  it('matches both setA and setB when both slots are populated', () => {
    const matches = withMatches({ relic2pSetA: 2, relic2pSetB: 3 })
    expect(relic2p(relicKeyAt(2), matches)).toBe(true)
    expect(relic2p(relicKeyAt(3), matches)).toBe(true)
    expect(relic2p(relicKeyAt(4), matches)).toBe(false)
  })
})

describe('relic4p', () => {
  it('returns false when relic4pSet is NO_SET, even if setA equals the queried index', () => {
    const matches = withMatches({ relic2pSetA: 0 })
    expect(relic4p(relicKeyAt(0), matches)).toBe(false)
  })

  it('returns true only for the set held in relic4pSet', () => {
    const matches = withMatches({ relic2pSetA: 5, relic4pSet: 5 })
    expect(relic4p(relicKeyAt(5), matches)).toBe(true)
    expect(relic4p(relicKeyAt(6), matches)).toBe(false)
  })
})

describe('ornament2p', () => {
  it('returns false when ornament2pSet is NO_SET', () => {
    const matches = emptySetMatches()
    expect(ornament2p(ornamentKeyAt(1), matches)).toBe(false)
  })

  it('matches the set held in ornament2pSet', () => {
    const matches = withMatches({ ornament2pSet: 1 })
    expect(ornament2p(ornamentKeyAt(1), matches)).toBe(true)
    expect(ornament2p(ornamentKeyAt(0), matches)).toBe(false)
  })
})

describe('capacity: no aliasing between raw index 0 and a hypothetical raw index 32', () => {
  // The bitmask this replaces stored membership as `1 << setIndex`. Since JS shifts are mod-32,
  // `1 << 32 === 1 << 0 === 1`, so a 33rd relic set (index 32) would have silently matched index 0.
  // SetMatches stores raw indices instead of bit positions, so no such aliasing is possible.
  it('a real setKey at index 0 never matches a match state describing a hypothetical set at raw index 32', () => {
    const matches = withMatches({ relic2pSetA: 32, relic4pSet: 32, ornament2pSet: 32 })

    expect(relic4p(relicKeyAt(0), matches)).toBe(false)
    expect(relic2p(relicKeyAt(0), matches)).toBe(false)
    expect(ornament2p(ornamentKeyAt(0), matches)).toBe(false)
  })
})
