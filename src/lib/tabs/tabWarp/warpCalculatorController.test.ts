// @vitest-environment jsdom
import { Metadata } from 'lib/state/metadataInitializer'
import { calculateWarps, normalizeWarpRequest, WarpIncomeOptions } from 'lib/tabs/tabWarp/warpCalculatorController'
import {
  DEFAULT_WARP_REQUEST,
  DEFAULT_WARP_TARGET,
  EidolonLevel,
  NONE_WARP_INCOME_OPTION,
  StarlightRefund,
  SuperimpositionLevel,
  type WarpRequest,
  type WarpTarget,
  WarpStrategy,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import {
  expect,
  test,
} from 'vitest'

// Deterministic base request for the numeric assertions: no passive income and no starlight refund, so
// the available warp budget equals exactly the `passes` each test sets.
const BASE_REQUEST: WarpRequest = {
  ...DEFAULT_WARP_REQUEST,
  income: [NONE_WARP_INCOME_OPTION.id],
  targets: [{ ...DEFAULT_WARP_TARGET }],
  starlight: StarlightRefund.REFUND_NONE,
}

Metadata.initialize()

function target(patch: Partial<WarpTarget> = {}): WarpTarget {
  return {
    ...DEFAULT_WARP_TARGET,
    ...patch,
  }
}

test('base options', () => {
  const result = calculateWarps({ ...BASE_REQUEST })
  for (const milestone of Object.values(result.targetResults[0].milestoneResults)) {
    expect(milestone.wins).toBe(0)
  }
})

test('empty target list produces no target results', () => {
  const result = calculateWarps({ ...BASE_REQUEST, targets: [] })
  expect(result.targetResults).toEqual([])
})

test('strategies e0', () => {
  const e0Result = calculateWarps({
    ...BASE_REQUEST,
    strategy: WarpStrategy.E0,
  })

  expect(Object.keys(e0Result.targetResults[0].milestoneResults)).toEqual([
    'E0S0',
    'E0S1',
    'E1S1',
    'E2S1',
    'E3S1',
    'E4S1',
    'E5S1',
    'E6S1',
    'E6S2',
    'E6S3',
    'E6S4',
    'E6S5',
  ])
})

test('strategies s1', () => {
  const s1Result = calculateWarps({
    ...BASE_REQUEST,
    strategy: WarpStrategy.S1,
  })
  expect(Object.keys(s1Result.targetResults[0].milestoneResults)).toEqual([
    'S1',
    'E0S1',
    'E1S1',
    'E2S1',
    'E3S1',
    'E4S1',
    'E5S1',
    'E6S1',
    'E6S2',
    'E6S3',
    'E6S4',
    'E6S5',
  ])
})

test('strategies e6', () => {
  const e6Result = calculateWarps({
    ...BASE_REQUEST,
    strategy: WarpStrategy.E6,
  })
  expect(Object.keys(e6Result.targetResults[0].milestoneResults)).toEqual([
    'E0S0',
    'E1S0',
    'E2S0',
    'E3S0',
    'E4S0',
    'E5S0',
    'E6S0',
    'E6S1',
    'E6S2',
    'E6S3',
    'E6S4',
    'E6S5',
  ])
})

test('expected base values', () => {
  const result = calculateWarps({ ...BASE_REQUEST, passes: 1000 })
  const m = result.targetResults[0].milestoneResults
  expectWithin3(m.E0S0.warps, 89)
  expectWithin3(m.E0S1.warps, 154)
  expectWithin3(m.E1S1.warps, 244)
  expectWithin3(m.E2S1.warps, 333)
  expectWithin3(m.E3S1.warps, 423)
  expectWithin3(m.E4S1.warps, 512)
  expectWithin3(m.E5S1.warps, 602)
  expectWithin3(m.E6S1.warps, 691)
  expectWithin3(m.E6S2.warps, 756)
  expectWithin3(m.E6S3.warps, 821)
  expectWithin3(m.E6S4.warps, 886)
  expectWithin3(m.E6S5.warps, 951)

  expectWithin1Percent(m.E0S0.wins, 1)
  expectWithin1Percent(m.E0S1.wins, 1)
  expectWithin1Percent(m.E1S1.wins, 1)
  expectWithin1Percent(m.E2S1.wins, 1)
  expectWithin1Percent(m.E3S1.wins, 1)
  expectWithin1Percent(m.E4S1.wins, 1)
  expectWithin1Percent(m.E5S1.wins, 0.99988)
  expectWithin1Percent(m.E6S1.wins, 0.99534)
  expectWithin1Percent(m.E6S2.wins, 0.976)
  expectWithin1Percent(m.E6S3.wins, 0.91937)
  expectWithin1Percent(m.E6S4.wins, 0.80764)
  expectWithin1Percent(m.E6S5.wins, 0.6434)
})

test('expected pity values', () => {
  const result = calculateWarps({
    ...BASE_REQUEST,
    passes: 200,
    guaranteedCharacter: true,
    guaranteedLightCone: true,
    pityCharacter: 50,
    pityLightCone: 50,
  })
  const m = result.targetResults[0].milestoneResults

  expectWithin3(m.E0S0.warps, 25)
  expectWithin3(m.E0S1.warps, 43)
  expectWithin3(m.E1S1.warps, 133)
  expectWithin3(m.E2S1.warps, 222)
  expectWithin3(m.E3S1.warps, 312)
  expectWithin3(m.E4S1.warps, 401)
  expectWithin3(m.E5S1.warps, 491)
  expectWithin3(m.E6S1.warps, 581)
  expectWithin3(m.E6S2.warps, 646)
  expectWithin3(m.E6S3.warps, 711)
  expectWithin3(m.E6S4.warps, 776)
  expectWithin3(m.E6S5.warps, 841)

  expectWithin1Percent(m.E0S0.wins, 1)
  expectWithin1Percent(m.E0S1.wins, 1)
  expectWithin1Percent(m.E1S1.wins, 0.90517)
  expectWithin1Percent(m.E2S1.wins, 0.36541)
  expectWithin1Percent(m.E3S1.wins, 0.05917)
  expectWithin1Percent(m.E4S1.wins, 0.00654)
  expectWithin1Percent(m.E5S1.wins, 0.00067)
  expectWithin1Percent(m.E6S1.wins, 0.0001)
  expectWithin1Percent(m.E6S2.wins, 0.00003)
  expectWithin1Percent(m.E6S3.wins, 0)
  expectWithin1Percent(m.E6S4.wins, 0)
  expectWithin1Percent(m.E6S5.wins, 0)
})

test('expected current eidolon and lightcone values', () => {
  const result = calculateWarps({
    ...BASE_REQUEST,
    passes: 300,
    targets: [target({
      currentEidolonLevel: EidolonLevel.E1,
      currentSuperimpositionLevel: SuperimpositionLevel.S1,
    })],
  })

  const m = result.targetResults[0].milestoneResults

  expectWithin3(m.E2S1.warps, 90)
  expectWithin3(m.E3S1.warps, 180)
  expectWithin3(m.E4S1.warps, 269)
  expectWithin3(m.E5S1.warps, 359)
  expectWithin3(m.E6S1.warps, 449)
  expectWithin3(m.E6S2.warps, 514)
  expectWithin3(m.E6S3.warps, 579)
  expectWithin3(m.E6S4.warps, 644)
  expectWithin3(m.E6S5.warps, 709)

  expectWithin1Percent(m.E2S1.wins, 1)
  expectWithin1Percent(m.E3S1.wins, 0.96198)
  expectWithin1Percent(m.E4S1.wins, 0.64267)
  expectWithin1Percent(m.E5S1.wins, 0.24764)
  expectWithin1Percent(m.E6S1.wins, 0.05875)
  expectWithin1Percent(m.E6S2.wins, 0.01535)
  expectWithin1Percent(m.E6S3.wins, 0.00321)
  expectWithin1Percent(m.E6S4.wins, 0.00056)
  expectWithin1Percent(m.E6S5.wins, 0.00007)
})

test('multiple targets carry cumulative pulls forward and stop at each target goal', () => {
  const result = calculateWarps({
    ...BASE_REQUEST,
    passes: 400,
    targets: [
      target({
        id: 'target-1',
        targetEidolonLevel: EidolonLevel.E0,
        targetSuperimpositionLevel: SuperimpositionLevel.NONE,
      }),
      target({
        id: 'target-2',
        targetEidolonLevel: EidolonLevel.E0,
        targetSuperimpositionLevel: SuperimpositionLevel.NONE,
      }),
    ],
  })

  expect(result.targetResults).toHaveLength(2)
  expect(Object.keys(result.targetResults[0].milestoneResults)).toEqual(['E0'])
  expect(Object.keys(result.targetResults[1].milestoneResults)).toEqual(['E0'])

  const firstTarget = result.targetResults[0].milestoneResults.E0
  const secondTarget = result.targetResults[1].milestoneResults.E0
  expectWithin3(firstTarget.warps, 89)
  expectWithin3(secondTarget.warps, 179)
  expect(secondTarget.warps).toBeGreaterThan(firstTarget.warps)
})

test('s1 target stops at the first light cone milestone without requiring eidolons', () => {
  const result = calculateWarps({
    ...BASE_REQUEST,
    strategy: WarpStrategy.E0,
    targets: [
      target({
        targetEidolonLevel: EidolonLevel.NONE,
        targetSuperimpositionLevel: SuperimpositionLevel.S1,
      }),
    ],
  })

  expect(Object.keys(result.targetResults[0].milestoneResults)).toEqual(['S1'])
})

test('split e0 and s5 target does not pull extra eidolons', () => {
  const result = calculateWarps({
    ...BASE_REQUEST,
    strategy: WarpStrategy.S1,
    targets: [
      target({
        targetEidolonLevel: EidolonLevel.E0,
        targetSuperimpositionLevel: SuperimpositionLevel.S5,
      }),
    ],
  })

  expect(Object.keys(result.targetResults[0].milestoneResults)).toEqual([
    'S1',
    'E0S1',
    'E0S2',
    'E0S3',
    'E0S4',
    'E0S5',
  ])
})

test('split none and s5 target pulls only light cone milestones', () => {
  const result = calculateWarps({
    ...BASE_REQUEST,
    strategy: WarpStrategy.S1,
    targets: [
      target({
        targetEidolonLevel: EidolonLevel.NONE,
        targetSuperimpositionLevel: SuperimpositionLevel.S5,
      }),
    ],
  })

  expect(Object.keys(result.targetResults[0].milestoneResults)).toEqual([
    'S1',
    'S2',
    'S3',
    'S4',
    'S5',
  ])
})

test('normalizeWarpRequest fills defaults for missing or empty input', () => {
  expect(normalizeWarpRequest(undefined)).toEqual(DEFAULT_WARP_REQUEST)
  expect(normalizeWarpRequest({})).toEqual(DEFAULT_WARP_REQUEST)
})

test('normalizeWarpRequest keeps known income ids and drops unknown ones', () => {
  const validId = WarpIncomeOptions[0].id
  const result = normalizeWarpRequest({ income: [validId, 'bogus-income-id'] })
  expect(result.income).toEqual([validId])
})

test('normalizeWarpRequest clamps out-of-range target levels to defaults', () => {
  const result = normalizeWarpRequest({
    targets: [{
      ...DEFAULT_WARP_TARGET,
      targetEidolonLevel: 99 as EidolonLevel,
      currentSuperimpositionLevel: -5 as SuperimpositionLevel,
    }],
  })
  expect(result.targets[0].targetEidolonLevel).toBe(DEFAULT_WARP_TARGET.targetEidolonLevel)
  expect(result.targets[0].currentSuperimpositionLevel).toBe(DEFAULT_WARP_TARGET.currentSuperimpositionLevel)
})

test('normalizeWarpRequest drops legacy fields and preserves an empty target list', () => {
  const result = normalizeWarpRequest({ bannerRotation: 1, currentEidolonLevel: 3, targets: [] })
  expect(result).toEqual(DEFAULT_WARP_REQUEST)
})

function expectWithin3(actual: number, expected: number) {
  expect(actual).toBeGreaterThanOrEqual(expected - 3)
  expect(actual).toBeLessThanOrEqual(expected + 3)
}

function expectWithin1Percent(actual: number, expected: number) {
  const diff = expected * 0.01
  if (diff > 0.01) {
    expect(actual).toBeGreaterThanOrEqual(expected - diff)
    expect(actual).toBeLessThanOrEqual(expected + diff)
  }
}
