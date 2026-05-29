// @vitest-environment jsdom
import { Metadata } from 'lib/state/metadataInitializer'
import {
  BannerRotation,
  calculateWarps,
  EidolonLevel,
  NONE_WARP_INCOME_OPTION,
  normalizeWarpTargets,
  StarlightRefund,
  SuperimpositionLevel,
  type WarpRequest,
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
  targets: [{
    id: 'target-1',
    characterId: null,
    targetEidolonLevel: EidolonLevel.E6,
    targetSuperimpositionLevel: SuperimpositionLevel.S5,
    strategy: WarpStrategy.E0,
    currentEidolonLevel: EidolonLevel.NONE,
    currentSuperimpositionLevel: SuperimpositionLevel.NONE,
  }],
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

function target(patch: Partial<WarpRequest['targets'][number]> = {}): WarpRequest['targets'][number] {
  return {
    ...DEFAULT_WARP_REQUEST.targets[0],
    ...patch,
  }
}

test('base options', () => {
  const result = calculateWarps({ ...DEFAULT_WARP_REQUEST })
  for (const milestone of Object.values(result.milestoneResults)) {
    expect(milestone.wins).toBe(0)
  }
})

test('strategies e0', () => {
  const e0Result = calculateWarps({
    ...DEFAULT_WARP_REQUEST,
    strategy: WarpStrategy.E0,
    targets: [target({ strategy: WarpStrategy.E0 })],
  })

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
  const s1Result = calculateWarps({
    ...DEFAULT_WARP_REQUEST,
    strategy: WarpStrategy.S1,
    targets: [target({ strategy: WarpStrategy.S1 })],
  })
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
  const e6Result = calculateWarps({
    ...DEFAULT_WARP_REQUEST,
    strategy: WarpStrategy.E6,
    targets: [target({ strategy: WarpStrategy.E6 })],
  })
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
  const result = calculateWarps({ ...DEFAULT_WARP_REQUEST, passes: 1000 })
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
  const result = calculateWarps({
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
  const result = calculateWarps({
    ...DEFAULT_WARP_REQUEST,
    passes: 300,
    bannerRotation: BannerRotation.RERUN,
    currentEidolonLevel: EidolonLevel.E1,
    currentSuperimpositionLevel: SuperimpositionLevel.S1,
    targets: [target({
      currentEidolonLevel: EidolonLevel.E1,
      currentSuperimpositionLevel: SuperimpositionLevel.S1,
    })],
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

test('multiple targets carry cumulative pulls forward and stop at each target goal', () => {
  const result = calculateWarps({
    ...DEFAULT_WARP_REQUEST,
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
  expect(Object.keys(result.targetResults[0].milestoneResults)).toEqual(['E0S0'])
  expect(Object.keys(result.targetResults[1].milestoneResults)).toEqual(['E0S0'])

  const firstTarget = result.targetResults[0].milestoneResults.E0S0
  const secondTarget = result.targetResults[1].milestoneResults.E0S0
  expectWithin3(firstTarget.warps, 89)
  expectWithin3(secondTarget.warps, 179)
  expect(secondTarget.warps).toBeGreaterThan(firstTarget.warps)
})

test('s1 target stops at the first light cone milestone without requiring eidolons', () => {
  const result = calculateWarps({
    ...DEFAULT_WARP_REQUEST,
    targets: [
      target({
        targetEidolonLevel: EidolonLevel.NONE,
        targetSuperimpositionLevel: SuperimpositionLevel.S1,
        strategy: WarpStrategy.E0,
      }),
    ],
  })

  expect(Object.keys(result.targetResults[0].milestoneResults)).toEqual(['S1'])
})

test('split e0 and s5 target does not pull extra eidolons', () => {
  const result = calculateWarps({
    ...DEFAULT_WARP_REQUEST,
    targets: [
      target({
        targetEidolonLevel: EidolonLevel.E0,
        targetSuperimpositionLevel: SuperimpositionLevel.S5,
        strategy: WarpStrategy.S1,
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
    ...DEFAULT_WARP_REQUEST,
    targets: [
      target({
        targetEidolonLevel: EidolonLevel.NONE,
        targetSuperimpositionLevel: SuperimpositionLevel.S5,
        strategy: WarpStrategy.S1,
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

test('legacy s1 target is normalized to light cone only', () => {
  const result = calculateWarps({
    ...DEFAULT_WARP_REQUEST,
    targets: [{
      id: 'target-1',
      characterId: null,
      target: 'S1',
      strategy: WarpStrategy.E0,
      currentEidolonLevel: EidolonLevel.NONE,
      currentSuperimpositionLevel: SuperimpositionLevel.NONE,
    } as unknown as WarpRequest['targets'][number]],
  })

  expect(result.request.targets[0].targetEidolonLevel).toBe(EidolonLevel.NONE)
  expect(result.request.targets[0].targetSuperimpositionLevel).toBe(SuperimpositionLevel.S1)
  expect(Object.keys(result.targetResults[0].milestoneResults)).toEqual(['S1'])
})

test('target normalization preserves legacy goals when split target values are invalid', () => {
  const normalizedTargets = normalizeWarpTargets({
    ...DEFAULT_WARP_REQUEST,
    targets: [target({
      target: 'E2S1',
      targetEidolonLevel: 99 as EidolonLevel,
      targetSuperimpositionLevel: 99 as SuperimpositionLevel,
      currentEidolonLevel: 99 as EidolonLevel,
      currentSuperimpositionLevel: 99 as SuperimpositionLevel,
    })],
  })

  expect(normalizedTargets[0].targetEidolonLevel).toBe(EidolonLevel.E2)
  expect(normalizedTargets[0].targetSuperimpositionLevel).toBe(SuperimpositionLevel.S1)
  expect(normalizedTargets[0].currentEidolonLevel).toBe(EidolonLevel.NONE)
  expect(normalizedTargets[0].currentSuperimpositionLevel).toBe(SuperimpositionLevel.NONE)
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
