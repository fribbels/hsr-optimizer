import { Sets } from 'lib/constants/constants'
import type { SimulationSets } from 'lib/scoring/dpsScore'
import {
  buildCandidateSetPool,
  setsEqual,
} from 'lib/scoring/simScoringUtils'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import {
  describe,
  expect,
  test,
} from 'vitest'

function makeRequest(
  relicSet1: string | undefined,
  relicSet2: string | undefined,
  ornamentSet: string | undefined,
): SimulationRequest {
  return {
    simRelicSet1: relicSet1,
    simRelicSet2: relicSet2,
    simOrnamentSet: ornamentSet,
  } as SimulationRequest
}

const DEFAULT_SETS: SimulationSets = {
  relicSet1: Sets.PoetOfMourningCollapse,
  relicSet2: Sets.PoetOfMourningCollapse,
  ornamentSet: Sets.BoneCollectionsSereneDemesne,
}

describe('setsEqual', () => {
  test('identical sets are equal', () => {
    const a: SimulationSets = { relicSet1: Sets.PoetOfMourningCollapse, relicSet2: Sets.PoetOfMourningCollapse, ornamentSet: Sets.BoneCollectionsSereneDemesne }
    const b: SimulationSets = { relicSet1: Sets.PoetOfMourningCollapse, relicSet2: Sets.PoetOfMourningCollapse, ornamentSet: Sets.BoneCollectionsSereneDemesne }
    expect(setsEqual(a, b)).toBe(true)
  })

  test('swapped relic order is equal', () => {
    const a: SimulationSets = { relicSet1: Sets.PoetOfMourningCollapse, relicSet2: Sets.LongevousDisciple, ornamentSet: Sets.BoneCollectionsSereneDemesne }
    const b: SimulationSets = { relicSet1: Sets.LongevousDisciple, relicSet2: Sets.PoetOfMourningCollapse, ornamentSet: Sets.BoneCollectionsSereneDemesne }
    expect(setsEqual(a, b)).toBe(true)
  })

  test('different ornament is not equal', () => {
    const a: SimulationSets = { relicSet1: Sets.PoetOfMourningCollapse, relicSet2: Sets.PoetOfMourningCollapse, ornamentSet: Sets.BoneCollectionsSereneDemesne }
    const b: SimulationSets = { relicSet1: Sets.PoetOfMourningCollapse, relicSet2: Sets.PoetOfMourningCollapse, ornamentSet: Sets.RutilantArena }
    expect(setsEqual(a, b)).toBe(false)
  })

  test('different relic is not equal', () => {
    const a: SimulationSets = { relicSet1: Sets.PoetOfMourningCollapse, relicSet2: Sets.PoetOfMourningCollapse, ornamentSet: Sets.BoneCollectionsSereneDemesne }
    const b: SimulationSets = { relicSet1: Sets.LongevousDisciple, relicSet2: Sets.LongevousDisciple, ornamentSet: Sets.BoneCollectionsSereneDemesne }
    expect(setsEqual(a, b)).toBe(false)
  })
})

describe('buildCandidateSetPool', () => {
  test('user matches both dimensions — pool size 1', () => {
    const request = makeRequest(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne)
    const pool = buildCandidateSetPool(DEFAULT_SETS, request)
    expect(pool).toHaveLength(1)
    expect(setsEqual(pool[0], DEFAULT_SETS)).toBe(true)
  })

  test('user matches relic only — pool size 2', () => {
    const request = makeRequest(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.RutilantArena)
    const pool = buildCandidateSetPool(DEFAULT_SETS, request)
    expect(pool).toHaveLength(2)
    expect(setsEqual(pool[0], DEFAULT_SETS)).toBe(true)
    expect(pool[1].ornamentSet).toBe(Sets.RutilantArena)
    expect(pool[1].relicSet1).toBe(Sets.PoetOfMourningCollapse)
  })

  test('user matches ornament only — pool size 2', () => {
    const request = makeRequest(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne)
    const pool = buildCandidateSetPool(DEFAULT_SETS, request)
    expect(pool).toHaveLength(2)
    expect(setsEqual(pool[0], DEFAULT_SETS)).toBe(true)
    expect(pool[1].relicSet1).toBe(Sets.LongevousDisciple)
    expect(pool[1].ornamentSet).toBe(Sets.BoneCollectionsSereneDemesne)
  })

  test('user matches neither — pool size 4 with cross-products', () => {
    const request = makeRequest(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.RutilantArena)
    const pool = buildCandidateSetPool(DEFAULT_SETS, request)
    expect(pool).toHaveLength(4)
    // Default
    expect(setsEqual(pool[0], DEFAULT_SETS)).toBe(true)
    // User combo
    expect(pool[1].relicSet1).toBe(Sets.LongevousDisciple)
    expect(pool[1].ornamentSet).toBe(Sets.RutilantArena)
    // Cross-product: default relic + user ornament
    expect(pool[2].relicSet1).toBe(Sets.PoetOfMourningCollapse)
    expect(pool[2].ornamentSet).toBe(Sets.RutilantArena)
    // Cross-product: user relic + default ornament
    expect(pool[3].relicSet1).toBe(Sets.LongevousDisciple)
    expect(pool[3].ornamentSet).toBe(Sets.BoneCollectionsSereneDemesne)
  })

  test('undefined relic sets with different ornament — pool size 2', () => {
    const request = makeRequest(undefined, undefined, Sets.RutilantArena)
    const pool = buildCandidateSetPool(DEFAULT_SETS, request)
    expect(pool).toHaveLength(2)
    expect(setsEqual(pool[0], DEFAULT_SETS)).toBe(true)
    expect(pool[1].relicSet1).toBe(Sets.PoetOfMourningCollapse)
    expect(pool[1].ornamentSet).toBe(Sets.RutilantArena)
  })

  test('undefined relic sets with same ornament — pool size 1', () => {
    const request = makeRequest(undefined, undefined, Sets.BoneCollectionsSereneDemesne)
    const pool = buildCandidateSetPool(DEFAULT_SETS, request)
    expect(pool).toHaveLength(1)
  })

  test('undefined ornament set — pool size 2', () => {
    const request = makeRequest(Sets.LongevousDisciple, Sets.LongevousDisciple, undefined)
    const pool = buildCandidateSetPool(DEFAULT_SETS, request)
    expect(pool).toHaveLength(2)
    expect(setsEqual(pool[0], DEFAULT_SETS)).toBe(true)
    expect(pool[1].relicSet1).toBe(Sets.LongevousDisciple)
    expect(pool[1].ornamentSet).toBe(Sets.BoneCollectionsSereneDemesne)
  })

  test('all undefined — pool size 1 (default only)', () => {
    const request = makeRequest(undefined, undefined, undefined)
    const pool = buildCandidateSetPool(DEFAULT_SETS, request)
    expect(pool).toHaveLength(1)
  })

  test('deduplication with swapped relic order', () => {
    const defaults: SimulationSets = {
      relicSet1: Sets.LongevousDisciple,
      relicSet2: Sets.PoetOfMourningCollapse,
      ornamentSet: Sets.BoneCollectionsSereneDemesne,
    }
    const request = makeRequest(Sets.PoetOfMourningCollapse, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne)
    const pool = buildCandidateSetPool(defaults, request)
    expect(pool).toHaveLength(1)
  })
})
