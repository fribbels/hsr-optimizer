import {
  type BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  emptySetMatches,
  type MutableSetMatches,
  NO_SET,
} from 'lib/optimization/setMatchState'
import {
  describe,
  expect,
  it,
} from 'vitest'

function makeContainerWithMatches(matches: MutableSetMatches): ComputedStatsContainer {
  const container = new ComputedStatsContainer()
  container.a = new Float64Array(4)
  const basic = new BasicStatsArrayCore(false) as BasicStatsArray
  basic.setMatches = matches
  container.c = basic
  return container
}

describe('ComputedStatsContainer.clone', () => {
  it('shallow-copies setMatches, isolating the clone from later in-place mutation of the original', () => {
    // The optimizer worker reuses a single mutable SetMatches object across permutations
    // (computeSetMatchesInPlace), storing a reference on BasicStatsArray.setMatches. Any "kept"
    // result must clone that object, not share the reference, or every kept result would end up
    // reflecting whatever permutation was evaluated last.
    const sharedMatches: MutableSetMatches = {
      relic2pSetA: 3,
      relic2pSetB: NO_SET,
      relic4pSet: NO_SET,
      ornament2pSet: 2,
    }
    const container = makeContainerWithMatches(sharedMatches)

    const clone = container.clone()

    expect(clone.c.setMatches).not.toBe(sharedMatches)
    expect(clone.c.setMatches).toEqual({
      relic2pSetA: 3,
      relic2pSetB: NO_SET,
      relic4pSet: NO_SET,
      ornament2pSet: 2,
    })

    // Simulate the worker reusing the same mutable object for the next permutation.
    sharedMatches.relic2pSetA = 99
    sharedMatches.relic2pSetB = 4
    sharedMatches.relic4pSet = 99
    sharedMatches.ornament2pSet = 77

    expect(clone.c.setMatches).toEqual({
      relic2pSetA: 3,
      relic2pSetB: NO_SET,
      relic4pSet: NO_SET,
      ornament2pSet: 2,
    })
  })

  it('produces a clone whose setMatches object is independently mutable', () => {
    const sharedMatches: MutableSetMatches = emptySetMatches()
    const container = makeContainerWithMatches(sharedMatches)

    const clone = container.clone()
    const cloneMatches = clone.c.setMatches as MutableSetMatches
    cloneMatches.relic2pSetA = 5

    expect(sharedMatches.relic2pSetA).toBe(NO_SET)
  })
})
