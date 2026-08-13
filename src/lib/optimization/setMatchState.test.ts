import { type SetKey } from 'lib/constants/constants'
import {
  ornament2p,
  relic2p,
  relic4p,
} from 'lib/optimization/setMatching'
import {
  computeSetMatches,
  computeSetMatchesInPlace,
  emptySetMatches,
  NO_SET,
  type MutableSetMatches,
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

const relicKeys = Object.keys(RelicSetKeyToIndex) as SetKey[]
const ornamentKeys = Object.keys(OrnamentSetKeyToIndex) as SetKey[]
const relicKeyAt = (index: number) => relicKeys[index]
const ornamentKeyAt = (index: number) => ornamentKeys[index]

// Independent oracle: frequency count per relic slot id, groups ordered by the slot index at
// which the id was first seen. Deliberately implemented without reusing any branch from
// computeSetMatchesInPlace so it can catch bugs in that implementation.
function oracleSetMatches(sets: number[]): SetMatches {
  const relicSlots = sets.slice(0, 4)
  const freq = new Map<number, number>()
  const firstSeenOrder: number[] = []

  for (const id of relicSlots) {
    if (!freq.has(id)) firstSeenOrder.push(id)
    freq.set(id, (freq.get(id) ?? 0) + 1)
  }

  const groups = firstSeenOrder.filter((id) => freq.get(id)! >= 2)
  const is4p = groups.length === 1 && freq.get(groups[0]) === 4

  return {
    relic2pSetA: groups[0] ?? NO_SET,
    relic2pSetB: groups[1] ?? NO_SET,
    relic4pSet: is4p ? groups[0] : NO_SET,
    ornament2pSet: sets[4] === sets[5] ? sets[4] : NO_SET,
  }
}

describe('computeSetMatches exhaustive ordered pairing', () => {
  const RELIC_IDS = [0, 1, 2]
  const ORNAMENT_IDS = [0, 1, 2]

  it('matches an independent frequency + first-seen oracle for every relic x ornament combination', () => {
    let combinations = 0

    for (const s0 of RELIC_IDS) {
      for (const s1 of RELIC_IDS) {
        for (const s2 of RELIC_IDS) {
          for (const s3 of RELIC_IDS) {
            for (const s4 of ORNAMENT_IDS) {
              for (const s5 of ORNAMENT_IDS) {
                const sets = [s0, s1, s2, s3, s4, s5]
                const actual = computeSetMatches(sets)
                const expected = oracleSetMatches(sets)

                expect(actual).toEqual(expected)
                if (actual.relic4pSet !== NO_SET) {
                  expect(actual.relic4pSet).toBe(actual.relic2pSetA)
                  expect(actual.relic2pSetB).toBe(NO_SET)
                }
                combinations++
              }
            }
          }
        }
      }
    }

    expect(combinations).toBe(RELIC_IDS.length ** 4 * ORNAMENT_IDS.length ** 2)
  })
})

describe('computeSetMatchesInPlace reuse', () => {
  it('clears every field it does not set, so no value from a prior call survives', () => {
    const target: MutableSetMatches = emptySetMatches()

    // 1. 4-piece match at raw id 32 (one past the real 0..31 relic index range), exercising the
    //    exact capacity bug this refactor fixes, alongside a matching ornament pair.
    computeSetMatchesInPlace(target, [32, 32, 32, 32, 5, 5])
    expect(target.relic2pSetA).toBe(32)
    expect(target.relic2pSetB).toBe(NO_SET)
    expect(target.relic4pSet).toBe(32)
    expect(target.ornament2pSet).toBe(5)
    expect(relic4p(relicKeyAt(0), target)).toBe(false)
    expect(relic2p(relicKeyAt(0), target)).toBe(false)
    expect(ornament2p(ornamentKeyAt(0), target)).toBe(false)

    // 2. 2+2: two distinct 2-piece groups at real indices 0 and 1, no ornament match.
    computeSetMatchesInPlace(target, [0, 0, 1, 1, 7, 8])
    expect(target.relic2pSetA).toBe(0)
    expect(target.relic2pSetB).toBe(1)
    expect(target.relic4pSet).toBe(NO_SET)
    expect(target.ornament2pSet).toBe(NO_SET)
    expect(relic4p(relicKeyAt(0), target)).toBe(false)
    expect(relic2p(relicKeyAt(0), target)).toBe(true)
    expect(relic2p(relicKeyAt(1), target)).toBe(true)
    expect(relic2p(relicKeyAt(2), target)).toBe(false)

    // 3. One 2p group only: relic2pSetB held index 1 from step 2 and must be cleared, not
    //    merely hidden behind a guard.
    computeSetMatchesInPlace(target, [0, 0, 2, 3, 9, 9])
    expect(target.relic2pSetA).toBe(0)
    expect(target.relic2pSetB).toBe(NO_SET)
    expect(relic2p(relicKeyAt(0), target)).toBe(true)
    expect(relic2p(relicKeyAt(1), target)).toBe(false)
    expect(target.ornament2pSet).toBe(9)
    expect(ornament2p(ornamentKeyAt(0), target)).toBe(false)
    expect(ornament2p(ornamentKeyAt(9), target)).toBe(true)

    // 4. No relic match at all: relic2pSetA held index 0 from step 3 and must be cleared.
    computeSetMatchesInPlace(target, [4, 5, 6, 7, 9, 9])
    expect(target.relic2pSetA).toBe(NO_SET)
    expect(target.relic2pSetB).toBe(NO_SET)
    expect(target.relic4pSet).toBe(NO_SET)
    expect(relic2p(relicKeyAt(0), target)).toBe(false)
    expect(relic4p(relicKeyAt(0), target)).toBe(false)

    // 5. Ornament mismatch: ornament2pSet held index 9 from step 4 and must be cleared.
    computeSetMatchesInPlace(target, [4, 5, 6, 7, 9, 10])
    expect(target.ornament2pSet).toBe(NO_SET)
    expect(ornament2p(ornamentKeyAt(9), target)).toBe(false)

    // 6. Ornament pair again with a fresh id, proving the field updates correctly rather than
    //    staying cleared forever.
    computeSetMatchesInPlace(target, [4, 5, 6, 7, 11, 11])
    expect(target.ornament2pSet).toBe(11)
    expect(ornament2p(ornamentKeyAt(11), target)).toBe(true)
  })
})

describe('computeSetMatches capacity regression (bitmask overflow bug)', () => {
  // Old bitmask: relicMatch2 |= (1 << setIndex) for pairs. Since `1 << 32 === 1 << 0 === 1` in
  // JS, a 33rd relic set registered at index 32 would silently alias index 0. SetMatches stores
  // raw indices directly (no bit shifting), so this class of bug cannot recur.

  it('treats raw ids 0, 32, and 63 as distinct in a 2+2+ornament combination', () => {
    const matches = computeSetMatches([0, 0, 32, 32, 63, 63])
    expect(matches.relic2pSetA).toBe(0)
    expect(matches.relic2pSetB).toBe(32)
    expect(matches.relic4pSet).toBe(NO_SET)
    expect(matches.ornament2pSet).toBe(63)
  })

  it('handles a 4-piece match at raw id 32 without colliding with id 0', () => {
    const matches = computeSetMatches([32, 32, 32, 32, 1000, 1000])
    expect(matches.relic2pSetA).toBe(32)
    expect(matches.relic2pSetA).not.toBe(0)
    expect(matches.relic4pSet).toBe(32)
    expect(matches.ornament2pSet).toBe(1000)
  })

  it('does not let a real relic key at index 0 alias a hypothetical set at raw id 32', () => {
    const matches = computeSetMatches([32, 32, 32, 32, 5, 5])
    expect(relic4p(relicKeyAt(0), matches)).toBe(false)
    expect(relic2p(relicKeyAt(0), matches)).toBe(false)
  })

  it.each([31, 63, 1000])('round-trips arbitrarily large raw id %i through a 2-piece relic and ornament match', (id) => {
    const matches = computeSetMatches([id, id, id + 1, id + 2, id, id])
    expect(matches.relic2pSetA).toBe(id)
    expect(matches.relic2pSetB).toBe(NO_SET)
    expect(matches.ornament2pSet).toBe(id)
  })
})
