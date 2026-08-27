import { Sets } from 'lib/constants/constants'
import { calculateSimSets } from 'lib/scoring/dpsScore'
import { type SetsRelics } from 'lib/sets/setConfigRegistry'
import { type SimulationMetadata } from 'types/metadata'
import {
  describe,
  expect,
  it,
} from 'vitest'

const metadata = () =>
  ({
    relicSets: [
      [Sets.DreamlitActor, Sets.DreamlitActor],
      [Sets.DivinerOfDistantReach, Sets.DivinerOfDistantReach],
      [Sets.PasserbyOfWanderingCloud, Sets.KnightOfPurityPalace, Sets.LongevousDisciple],
    ],
    ornamentSets: [Sets.SprightlyVonwacq, Sets.BrokenKeel],
  }) as unknown as SimulationMetadata

describe('calculateSimSets', () => {
  it('matches a listed 4p set', () => {
    const sets = calculateSimSets(Sets.DivinerOfDistantReach, Sets.DivinerOfDistantReach, Sets.BrokenKeel, metadata())
    expect(sets.relicSet1).toBe(Sets.DivinerOfDistantReach)
    expect(sets.relicSet2).toBe(Sets.DivinerOfDistantReach)
    expect(sets.ornamentSet).toBe(Sets.BrokenKeel)
  })

  it('matches two 2p sets from the same equivalents list', () => {
    const sets = calculateSimSets(Sets.PasserbyOfWanderingCloud, Sets.KnightOfPurityPalace, Sets.SprightlyVonwacq, metadata())
    expect(sets.relicSet1).toBe(Sets.PasserbyOfWanderingCloud)
    expect(sets.relicSet2).toBe(Sets.KnightOfPurityPalace)
  })

  it('keeps a lone listed 2p set and fills the second slot with a sibling from its list', () => {
    const sets = calculateSimSets(Sets.PasserbyOfWanderingCloud, undefined, Sets.SprightlyVonwacq, metadata())
    expect(sets.relicSet1).toBe(Sets.PasserbyOfWanderingCloud)
    expect(sets.relicSet2).not.toBe(Sets.PasserbyOfWanderingCloud)
    expect([Sets.KnightOfPurityPalace, Sets.LongevousDisciple] as SetsRelics[]).toContain(sets.relicSet2)
  })

  it('falls back to the first listed set for a lone unlisted 2p set', () => {
    const sets = calculateSimSets(Sets.MusketeerOfWildWheat, undefined, Sets.SprightlyVonwacq, metadata())
    expect(sets.relicSet1).toBe(Sets.DreamlitActor)
    expect(sets.relicSet2).toBe(Sets.DreamlitActor)
  })

  it('falls back to the first listed set when no relic sets are equipped', () => {
    const sets = calculateSimSets(undefined, undefined, undefined, metadata())
    expect(sets.relicSet1).toBe(Sets.DreamlitActor)
    expect(sets.relicSet2).toBe(Sets.DreamlitActor)
    expect(sets.ornamentSet).toBe(Sets.SprightlyVonwacq)
  })
})
