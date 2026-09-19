import {
  ConditionalActivation,
  ConditionalType,
} from 'lib/constants/constants'
import { type DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { type BasicStatsArray } from 'lib/optimization/basicStatsArray'
import {
  calculateBasicSetEffects,
  evaluateDynamicSetConditionals,
  evaluateTerminalSetConditionals,
  executeNonDynamicCombatSets,
} from 'lib/optimization/calculateStats'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { emptySetMatches } from 'lib/optimization/setMatchState'
import {
  ornamentIndexToSetConfig,
  relicIndexToSetConfig,
} from 'lib/sets/setConfigRegistry'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import { type SetConditionals } from 'types/setConfig'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// Replaces the real relic/ornament registries with a small, fully-controlled fixture so
// dispatch order can be observed without depending on any real character set's behavior.
vi.mock('lib/sets/setConfigRegistry', () => {
  const relicIndexToSetConfig = [{ conditionals: {} }, { conditionals: {} }]
  const ornamentIndexToSetConfig = [{ conditionals: {} }]
  return { relicIndexToSetConfig, ornamentIndexToSetConfig }
})

const RELIC_A = 0
const RELIC_B = 1
const ORNAMENT = 0

let order: string[]

function spyConditionals(label: string): SetConditionals {
  const dynamicConditional: DynamicConditional = {
    id: `${label}Dynamic`,
    type: ConditionalType.SET,
    activation: ConditionalActivation.SINGLE,
    dependsOn: [],
    chainsTo: [],
    condition: () => {
      order.push(`${label}.dynamicCondition`)
      return true
    },
    effect: () => {
      order.push(`${label}.dynamicEffect`)
    },
    gpu: () => '',
  }

  return {
    p2c: () => {
      order.push(`${label}.p2c`)
    },
    p4c: () => {
      order.push(`${label}.p4c`)
    },
    p2x: () => {
      order.push(`${label}.p2x`)
    },
    p4x: () => {
      order.push(`${label}.p4x`)
    },
    p2t: () => {
      order.push(`${label}.p2t`)
    },
    p4t: () => {
      order.push(`${label}.p4t`)
    },
    dynamicConditionals: [dynamicConditional],
  }
}

const fakeContainer = {} as unknown as ComputedStatsContainer
const fakeContext = {} as unknown as OptimizerContext
const fakeBasicStats = {} as unknown as BasicStatsArray
const setConditionals: SetConditional = {}
let fakeAction: OptimizerAction

beforeEach(() => {
  order = []
  // conditionalState is reset per test - evaluateConditional marks SINGLE-activation
  // conditionals as fired there, so a shared object would suppress re-firing across tests.
  fakeAction = {
    conditionalState: {},
    setConditionals,
  } as unknown as OptimizerAction
  relicIndexToSetConfig[RELIC_A].conditionals = spyConditionals('A')
  relicIndexToSetConfig[RELIC_B].conditionals = spyConditionals('B')
  ornamentIndexToSetConfig[ORNAMENT].conditionals = spyConditionals('O')
})

describe('calculateBasicSetEffects dispatch order', () => {
  it('2+2+ornament: relic A p2c, relic B p2c, then ornament p2c (no p4c)', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic2pSetB: RELIC_B, ornament2pSet: ORNAMENT }
    calculateBasicSetEffects(fakeBasicStats, fakeContext, matches)
    expect(order).toEqual(['A.p2c', 'B.p2c', 'O.p2c'])
  })

  it('4p+ornament: relic A p2c then p4c immediately, then ornament p2c (no relic B)', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic4pSet: RELIC_A, ornament2pSet: ORNAMENT }
    calculateBasicSetEffects(fakeBasicStats, fakeContext, matches)
    expect(order).toEqual(['A.p2c', 'A.p4c', 'O.p2c'])
  })
})

describe('executeNonDynamicCombatSets dispatch order', () => {
  it('2+2+ornament: ornament p2x first, then relic A p2x, then relic B p2x', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic2pSetB: RELIC_B, ornament2pSet: ORNAMENT }
    executeNonDynamicCombatSets(fakeContainer, fakeContext, setConditionals, matches)
    expect(order).toEqual(['O.p2x', 'A.p2x', 'B.p2x'])
  })

  it('4p+ornament: ornament p2x first, then relic A p2x immediately followed by p4x', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic4pSet: RELIC_A, ornament2pSet: ORNAMENT }
    executeNonDynamicCombatSets(fakeContainer, fakeContext, setConditionals, matches)
    expect(order).toEqual(['O.p2x', 'A.p2x', 'A.p4x'])
  })
})

describe('evaluateTerminalSetConditionals dispatch order', () => {
  it('2+2+ornament: only ornament p2t fires (no relic terminal without a 4-piece match)', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic2pSetB: RELIC_B, ornament2pSet: ORNAMENT }
    evaluateTerminalSetConditionals(fakeContainer, new Float64Array(0), matches, fakeAction, fakeContext)
    expect(order).toEqual(['O.p2t'])
  })

  it('4p+ornament: ornament p2t first, then relic A p4t', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic4pSet: RELIC_A, ornament2pSet: ORNAMENT }
    evaluateTerminalSetConditionals(fakeContainer, new Float64Array(0), matches, fakeAction, fakeContext)
    expect(order).toEqual(['O.p2t', 'A.p4t'])
  })
})

describe('evaluateDynamicSetConditionals dispatch order', () => {
  it('2+2+ornament: only the ornament dynamic conditional fires, relic state is ignored', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic2pSetB: RELIC_B, ornament2pSet: ORNAMENT }
    evaluateDynamicSetConditionals(fakeContainer, matches, fakeAction, fakeContext)
    expect(order).toEqual(['O.dynamicCondition', 'O.dynamicEffect'])
  })

  it('4p+ornament: only the ornament dynamic conditional fires, relic 4p state is ignored', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic4pSet: RELIC_A, ornament2pSet: ORNAMENT }
    evaluateDynamicSetConditionals(fakeContainer, matches, fakeAction, fakeContext)
    expect(order).toEqual(['O.dynamicCondition', 'O.dynamicEffect'])
  })

  it('does not fire when there is no ornament match', () => {
    const matches = { ...emptySetMatches(), relic2pSetA: RELIC_A, relic2pSetB: RELIC_B }
    evaluateDynamicSetConditionals(fakeContainer, matches, fakeAction, fakeContext)
    expect(order).toEqual([])
  })
})
