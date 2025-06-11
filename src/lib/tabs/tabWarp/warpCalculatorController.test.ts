import { Metadata } from 'lib/state/metadata'
import {
  BannerRotation,
  EidolonLevel,
  NONE_WARP_INCOME_OPTION,
  simulateWarps,
  StarlightRefund,
  SuperimpositionLevel,
  WarpRequest,
  WarpStrategy,
} from 'lib/tabs/tabWarp/warpCalculatorController'
import {
  expect,
  test,
} from 'vitest'

const DEFAULT_WARP_REQUEST: WarpRequest = {
  passes: 0,
  jades: 0,
  income: [NONE_WARP_INCOME_OPTION.id],
  strategy: WarpStrategy.E0,
  starlight: StarlightRefund.REFUND_NONE,
  pityCharacter: 0,
  guaranteedCharacter: false,
  pityLightCone: 0,
  guaranteedLightCone: false,
  bannerRotation: BannerRotation.NEW,
  currentEidolonLevel: EidolonLevel.NONE,
  currentSuperimpositionLevel: SuperimpositionLevel.NONE,
}

Metadata.initialize()

test('base options', () => {
  const result = simulateWarps({ ...DEFAULT_WARP_REQUEST })
  for (const milestone of Object.values(result.milestoneResults)) {
    expect(milestone.wins).toBe(0)
  }
})

test('strategies e0', () => {
  const e0Result = simulateWarps({ ...DEFAULT_WARP_REQUEST, strategy: WarpStrategy.E0 })

  expect(Object.keys(e0Result.milestoneResults)).toEqual([
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
  const s1Result = simulateWarps({ ...DEFAULT_WARP_REQUEST, strategy: WarpStrategy.S1 })
  expect(Object.keys(s1Result.milestoneResults)).toEqual([
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
  const e6Result = simulateWarps({ ...DEFAULT_WARP_REQUEST, strategy: WarpStrategy.E6 })
  expect(Object.keys(e6Result.milestoneResults)).toEqual([
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
  const result = simulateWarps({ ...DEFAULT_WARP_REQUEST, passes: 1000 })
  const m = result.milestoneResults
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
  const result = simulateWarps({
    ...DEFAULT_WARP_REQUEST,
    passes: 200,
    guaranteedCharacter: true,
    guaranteedLightCone: true,
    pityCharacter: 50,
    pityLightCone: 50,
  })
  const m = result.milestoneResults

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
  const result = simulateWarps({
    ...DEFAULT_WARP_REQUEST,
    passes: 300,
    bannerRotation: BannerRotation.RERUN,
    currentEidolonLevel: EidolonLevel.E1,
    currentSuperimpositionLevel: SuperimpositionLevel.S1,
  })

  const m = result.milestoneResults

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

function expectedTotalWarps(actual: number, expected: number) {
  expect(actual).toEqual(expected)
}

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
