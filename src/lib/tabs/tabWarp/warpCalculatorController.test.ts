// @vitest-environment jsdom
import { Metadata } from 'lib/state/metadataInitializer'
import {
  calculateWarps,
  createSimpleWarpRequest,
  normalizeWarpRequest,
  WarpIncomeOptions,
} from 'lib/tabs/tabWarp/warpCalculatorController'
import {
  DEFAULT_WARP_REQUEST,
  DEFAULT_WARP_TARGET,
  EidolonLevel,
  NONE_WARP_INCOME_OPTION,
  PlannerMode,
  StarlightRefund,
  SuperimpositionLevel,
  type WarpRequest,
  WarpStrategy,
  type WarpTarget,
  WarpTargetKind,
  type WarpTargetResult,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import {
  createSkinTarget,
  SKIN_BANNERS,
  skinChancePercent,
} from 'lib/tabs/tabWarp/warpSkinBanners'
import * as skinBanners from 'lib/tabs/tabWarp/warpSkinBanners'
import {
  afterEach,
  describe,
  expect,
  test,
  vi,
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

afterEach(() => vi.restoreAllMocks())

function target(patch: Partial<WarpTarget> = {}): WarpTarget {
  return {
    ...DEFAULT_WARP_TARGET,
    ...patch,
  }
}

function warpMilestones(result: WarpTargetResult) {
  if (result.kind !== WarpTargetKind.WARP) throw new Error('Expected a warp target')
  return result.milestoneResults
}

function skinMilestones(result: WarpTargetResult) {
  if (result.kind !== WarpTargetKind.SKIN) throw new Error('Expected a skin target')
  return result.milestoneResults
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
  const m = warpMilestones(result.targetResults[0])
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
  const m = warpMilestones(result.targetResults[0])

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

  const m = warpMilestones(result.targetResults[0])

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

  const firstTarget = warpMilestones(result.targetResults[0]).E0
  const secondTarget = warpMilestones(result.targetResults[1]).E0
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
  expect(result.targets[0]).toMatchObject({
    targetEidolonLevel: DEFAULT_WARP_TARGET.targetEidolonLevel,
    currentSuperimpositionLevel: DEFAULT_WARP_TARGET.currentSuperimpositionLevel,
  })
})

test('normalizeWarpRequest drops legacy fields and preserves an empty target list', () => {
  const result = normalizeWarpRequest({ bannerRotation: 1, currentEidolonLevel: 3, targets: [] })
  expect(result).toEqual(DEFAULT_WARP_REQUEST)
})

const STAR_LOTTO = SKIN_BANNERS[0].id
const DRAW_LABELS = ['Draw1', 'Draw2', 'Draw3', 'Draw4', 'Draw5', 'Draw6', 'Draw7', 'Draw8']

// Hand-calculated reference: 8000 jades + 176 passes, character pity 62, E0 -> E2 with no light cone.
const SKIN_REQUEST: WarpRequest = {
  ...BASE_REQUEST,
  jades: 8000,
  passes: 176,
  pityCharacter: 62,
}

const E2_TARGET = target({
  id: 'e2',
  targetEidolonLevel: EidolonLevel.E2,
  targetSuperimpositionLevel: SuperimpositionLevel.NONE,
})

function skinTarget(drawsDone = 0, drawTarget = 8, id = 'skin') {
  return createSkinTarget(id, { bannerId: STAR_LOTTO, drawsDone, drawTarget })
}

describe('skin target', () => {
  test.each([
    { name: 'no refund', patch: {}, e2: 51.8, both: 12.0 },
    { name: 'average refund', patch: { starlight: StarlightRefund.REFUND_AVG }, e2: 59.1, both: 13.9 },
    { name: 'guaranteed', patch: { guaranteedCharacter: true }, e2: 67.3, both: 17.0 },
  ])('the last affordable draw row matches the hand calculation with $name', ({ patch, e2, both }) => {
    const request = { ...SKIN_REQUEST, ...patch }

    const [e2Result, skinAfterE2] = calculateWarps({ ...request, targets: [E2_TARGET, skinTarget()] }).targetResults

    expect(Object.keys(e2Result.milestoneResults)).toEqual(['E0', 'E1', 'E2'])
    expect(Object.keys(skinAfterE2.milestoneResults)).toEqual(DRAW_LABELS)
    expectPercent(e2Result.milestoneResults.E2.wins, e2)
    // 8000 jade can't pay for draw 8 (8700), so draw 7 is the last row with a chance
    expectPercent(skinAfterE2.milestoneResults.Draw7.wins, both)
    expect(skinAfterE2.milestoneResults.Draw8).toMatchObject({ wins: 0, unaffordable: true })
  })

  test('draw rows show cumulative drop chances and jade costs', () => {
    const expected = [
      [0.05, 0],
      [0.30, 300],
      [1.30, 800],
      [2.78, 1600],
      [4.72, 2800],
      [9.49, 4300],
      [32.11, 6300],
      [100, 8700],
    ]

    const [skin] = calculateWarps({ ...SKIN_REQUEST, jades: 100_000, targets: [skinTarget()] }).targetResults

    DRAW_LABELS.forEach((label, index) => {
      const milestone = skinMilestones(skin)[label]
      const [chance, jades] = expected[index]
      expectPercent(milestone.wins, chance)
      expect(milestone.jades).toBe(jades)
    })
  })

  test('draws already done start the banner at the next draw and skip the sunk cost', () => {
    const [skin] = calculateWarps({ ...SKIN_REQUEST, jades: 100_000, targets: [skinTarget(6)] }).targetResults
    const { Draw7, Draw8 } = skinMilestones(skin)

    expect(Object.keys(skin.milestoneResults)).toEqual(['Draw7', 'Draw8'])
    expectPercent(Draw7.wins, 25)
    expectPercent(Draw8.wins, 100)
    expect(Draw7.jades).toBe(2000)
    expect(Draw8.jades).toBe(4400)

    const [shortOfWorstCase] = calculateWarps({ ...SKIN_REQUEST, jades: 4399, passes: 0, targets: [skinTarget(6)] }).targetResults

    expectPercent(shortOfWorstCase.milestoneResults.Draw7.wins, 25)
    expect(shortOfWorstCase.milestoneResults.Draw8).toMatchObject({ wins: 0, unaffordable: true })
  })

  test('the draw target limits the rows, and later targets count only plans where the outfit dropped', () => {
    const [skin, e2] = calculateWarps({ ...SKIN_REQUEST, jades: 100_000, targets: [skinTarget(0, 7), E2_TARGET] }).targetResults
    const [e2Alone] = calculateWarps({ ...SKIN_REQUEST, jades: 100_000, targets: [E2_TARGET] }).targetResults

    expect(Object.keys(skin.milestoneResults)).toEqual(DRAW_LABELS.slice(0, 7))
    expect(e2.milestoneResults.E2.wins).toBeCloseTo(skin.milestoneResults.Draw7.wins * e2Alone.milestoneResults.E2.wins, 6)
  })

  test('earlier targets are unchanged and the joint chance does not depend on order', () => {
    const [noSkin] = calculateWarps({ ...SKIN_REQUEST, targets: [E2_TARGET] }).targetResults
    const [e2First, skinLast] = calculateWarps({ ...SKIN_REQUEST, targets: [E2_TARGET, skinTarget()] }).targetResults
    const [, e2Last] = calculateWarps({ ...SKIN_REQUEST, targets: [skinTarget(), E2_TARGET] }).targetResults

    expect(e2First.milestoneResults).toEqual(noSkin.milestoneResults)
    expect(e2Last.milestoneResults.E2.wins).toBeCloseTo(skinLast.milestoneResults.Draw7.wins, 10)
  })

  test('outcomes costing more jade than available fail, and passes cannot pay for invites', () => {
    const noJade = calculateWarps({ ...SKIN_REQUEST, jades: 0, passes: 10_000, targets: [skinTarget()] })

    expect(noJade.targetResults[0].milestoneResults.Draw1.wins).toBeCloseTo(0.0005, 10) // only the free first draw
    expect(noJade.targetResults[0].milestoneResults.Draw2).toMatchObject({ wins: 0, unaffordable: true })

    const enoughJade = calculateWarps({ ...SKIN_REQUEST, jades: 8700, passes: 0, targets: [skinTarget()] })

    expect(enoughJade.targetResults[0].milestoneResults.Draw8.wins).toBeCloseTo(1, 10)
  })

  test.each([
    { jades: 6459, unaffordable: true },
    { jades: 6460, unaffordable: false },
  ])('draw affordability includes earlier warp costs at $jades jade', ({ jades, unaffordable }) => {
    const e0 = target({ id: 'e0', targetEidolonLevel: EidolonLevel.E0, targetSuperimpositionLevel: SuperimpositionLevel.NONE })

    // Draw 7 costs 6300 jade and the earlier E0 needs at least one 160-jade warp.
    const [, tight] = calculateWarps({ ...SKIN_REQUEST, jades, passes: 0, targets: [e0, skinTarget()] }).targetResults

    expect(skinMilestones(tight).Draw6.unaffordable).toBe(false)
    expect(skinMilestones(tight).Draw7.unaffordable).toBe(unaffordable)
  })

  test('the free first draw is never unaffordable, even when nothing else fits', () => {
    const e0 = target({ id: 'e0', targetEidolonLevel: EidolonLevel.E0, targetSuperimpositionLevel: SuperimpositionLevel.NONE })

    const [, skin] = calculateWarps({ ...SKIN_REQUEST, jades: 0, passes: 0, targets: [e0, skinTarget()] }).targetResults

    expect(skinMilestones(skin).Draw1.unaffordable).toBe(false)
    expect(skinMilestones(skin).Draw2.unaffordable).toBe(true)
  })

  test.each([
    { passes: 9, unaffordable: true },
    { passes: 10, unaffordable: false },
  ])('paid skin draws use refunds from the remaining $passes passes', ({ passes, unaffordable }) => {
    const combined = target({ targetSuperimpositionLevel: SuperimpositionLevel.S3 })

    const [, skin] = calculateWarps({
      ...BASE_REQUEST,
      jades: 300,
      passes,
      starlight: StarlightRefund.REFUND_HIGH,
      targets: [combined, skinTarget(0, 2)],
    }).targetResults

    // E6S3 needs at least ten warps. After the skin cost, nine passes earn no refund and ten earn one.
    expect(skinMilestones(skin).Draw2.unaffordable).toBe(unaffordable)
  })

  test.each([7, 8])('later joint chances retain early skin wins when the draw target is %s', (drawTarget) => {
    const e0 = target({ targetEidolonLevel: EidolonLevel.E0, targetSuperimpositionLevel: SuperimpositionLevel.NONE })

    const [skin, character] = calculateWarps({
      ...BASE_REQUEST,
      jades: 2160,
      passes: 0,
      pityCharacter: 89,
      guaranteedCharacter: true,
      targets: [skinTarget(6, drawTarget), e0],
    }).targetResults

    // Draw 7 spends 2000 jade even on a miss. Only its 25% win chance contributes to the joint goal.
    expect(skin.milestoneResults.Draw7.wins).toBeCloseTo(0.25, 10)
    expect(character.milestoneResults.E0.wins).toBeCloseTo(0.25, 10)
    if (drawTarget === 8) expect(skinMilestones(skin).Draw8).toMatchObject({ wins: 0, unaffordable: true })
  })

  test('skin chances round half up to one decimal despite float error', () => {
    expect([0.0005, 0.0003, 0.0025, 0.32114].map(skinChancePercent)).toEqual([0.1, 0, 0.3, 32.1])

    const [skin] = calculateWarps({ ...SKIN_REQUEST, jades: 100_000, targets: [skinTarget()] }).targetResults
    expect(skinChancePercent(skin.milestoneResults.Draw1.wins)).toBe(0.1)
  })

  test('disabled skin banners preserve saved goals without affecting character or light cone results', () => {
    const lightCone = target({ id: 'lc', targetEidolonLevel: EidolonLevel.NONE, targetSuperimpositionLevel: SuperimpositionLevel.S1 })
    const request = { ...SKIN_REQUEST, targets: [skinTarget(3, 7), E2_TARGET, lightCone] }
    const savedTargets = structuredClone(request.targets)
    const expected = calculateWarps({ ...request, targets: [E2_TARGET, lightCone] })
    const banner = SKIN_BANNERS[0]
    const getSkinBanner = skinBanners.getSkinBanner
    vi.spyOn(skinBanners, 'getSkinBanner').mockImplementation((id) => id === banner.id ? { ...banner, enabled: false } : getSkinBanner(id))

    const result = calculateWarps(request)

    expect(result.targetResults).toEqual(expected.targetResults)
    expect(result.request.targets).toEqual(savedTargets)
    expect(request.targets).toEqual(savedTargets)
    expect(normalizeWarpRequest(request).targets).toEqual(savedTargets)
  })

  test('a repeated skin target for the same banner is only counted once', () => {
    const result = calculateWarps({ ...SKIN_REQUEST, targets: [skinTarget(), skinTarget(0, 8, 'skin-2')] })

    expect(Object.keys(result.targetResults[0].milestoneResults)).toEqual(DRAW_LABELS)
    expect(result.targetResults).toHaveLength(1)
  })
})

test.each([true, false])('the first known skin reserves the only slot when enabled is %s', (enabled) => {
  const banners = [STAR_LOTTO, 'second'].map((id) => ({
    ...SKIN_BANNERS[0],
    id,
    enabled: id === STAR_LOTTO ? enabled : true,
    draws: [{ inviteCost: 1, rate: 0.5 }, { inviteCost: 2, rate: 1 }],
  }))
  const getSkinBanner = skinBanners.getSkinBanner
  vi.spyOn(skinBanners, 'getSkinBanner').mockImplementation((id) => banners.find((banner) => banner.id === id) ?? getSkinBanner(id))
  const skins = banners.map((banner) => createSkinTarget(banner.id, { bannerId: banner.id, drawsDone: 0, drawTarget: 2 }))
  const e0 = target({ targetEidolonLevel: EidolonLevel.E0, targetSuperimpositionLevel: SuperimpositionLevel.NONE })

  const request = {
    ...BASE_REQUEST,
    jades: 400,
    passes: 0,
    pityCharacter: 89,
    guaranteedCharacter: true,
    targets: [...skins, e0],
  }

  const normalized = normalizeWarpRequest({ ...request, targets: [skins[0], skinTarget(), e0] })
  const { targetResults } = calculateWarps(request)

  expect(normalized.targets).toEqual([skins[0], e0])
  expect(targetResults.map((result) => result.target.id)).toEqual(enabled ? [STAR_LOTTO, e0.id] : [e0.id])
  // The joint skin-and-E0 goal succeeds only on the early win, which leaves enough jade for a warp.
  expect(targetResults.at(-1)!.milestoneResults.E0.wins).toBeCloseTo(enabled ? 0.5 : 1, 10)
})

describe('Simple skin planning', () => {
  test.each([WarpStrategy.E0, WarpStrategy.S1])('off preserves the original Simple results for strategy %s', (strategy) => {
    const multiTargets = [E2_TARGET]
    const request = { ...SKIN_REQUEST, strategy, targets: multiTargets, simpleSkinGoal: null }

    const simpleRequest = createSimpleWarpRequest(request)
    const expected = calculateWarps({ ...request, targets: [{ ...DEFAULT_WARP_TARGET, id: 'quick-combined' }] })

    expect(calculateWarps(simpleRequest).targetResults).toEqual(expected.targetResults)
    expect(request.targets).toBe(multiTargets)
  })

  test('skin is first, shares jade with the combined goal, and preserves the Multi plan', () => {
    const multiTargets = [E2_TARGET, skinTarget(2, 5, 'multi-skin')]
    const simpleSkinGoal = skinTarget(6, 7).skin
    const request = {
      ...BASE_REQUEST,
      jades: 2160,
      passes: 0,
      pityCharacter: 89,
      guaranteedCharacter: true,
      plannerMode: PlannerMode.SIMPLE,
      simpleSkinGoal,
      targets: multiTargets,
    }

    const simpleRequest = createSimpleWarpRequest(request)
    const [skin, combined] = calculateWarps(simpleRequest).targetResults

    expect(simpleRequest.targets.map((goal) => goal.id)).toEqual(['quick-skin', 'quick-combined'])
    expect(simpleRequest.targets[0]).toMatchObject({ kind: WarpTargetKind.SKIN, skin: simpleSkinGoal })
    expect(skin.milestoneResults.Draw7).toMatchObject({ wins: 0.25, jades: 2000 })
    expect(combined.milestoneResults.E0S0.wins).toBeCloseTo(0.25, 10)

    const tooLittleJade = createSimpleWarpRequest({ ...request, jades: 1999, passes: 10000 })

    expect(calculateWarps(tooLittleJade).targetResults[1].milestoneResults.E0S0.wins).toBe(0)

    const withoutSkin = createSimpleWarpRequest({ ...request, simpleSkinGoal: null })

    expect(calculateWarps(withoutSkin).targetResults[0].milestoneResults.E0S0.wins).toBeCloseTo(1, 10)
    expect(request.targets).toBe(multiTargets)
    expect(request.simpleSkinGoal).toBe(simpleSkinGoal)
    expect(calculateWarps({ ...request, plannerMode: PlannerMode.MULTI }).targetResults.map((result) => result.target))
      .toEqual(multiTargets)
  })

  test('disabled Simple skin is ignored without deleting its saved progress', () => {
    const simpleSkinGoal = skinTarget(6, 7).skin
    const request = { ...SKIN_REQUEST, simpleSkinGoal, targets: [E2_TARGET] }
    const expected = calculateWarps(createSimpleWarpRequest({ ...request, simpleSkinGoal: null }))
    const banner = SKIN_BANNERS[0]
    const getSkinBanner = skinBanners.getSkinBanner
    vi.spyOn(skinBanners, 'getSkinBanner').mockImplementation((id) => id === banner.id ? { ...banner, enabled: false } : getSkinBanner(id))

    const simpleRequest = createSimpleWarpRequest(request)

    expect(calculateWarps(simpleRequest).targetResults).toEqual(expected.targetResults)
    expect(simpleRequest.simpleSkinGoal).toBe(simpleSkinGoal)
    expect(normalizeWarpRequest(request).simpleSkinGoal).toEqual(simpleSkinGoal)
  })

  test('normalization restores independent Simple and Multi goals and rejects unknown Simple banners', () => {
    const request = { ...SKIN_REQUEST, simpleSkinGoal: skinTarget(6, 7).skin, targets: [skinTarget(2, 5), E2_TARGET] }

    const restored = normalizeWarpRequest(JSON.parse(JSON.stringify(request)))

    expect(restored.simpleSkinGoal).toEqual(request.simpleSkinGoal)
    expect(restored.targets).toEqual(request.targets)
    expect(normalizeWarpRequest({ simpleSkinGoal: { bannerId: STAR_LOTTO, drawsDone: 6, drawTarget: 2 } }).simpleSkinGoal)
      .toEqual({ bannerId: STAR_LOTTO, drawsDone: 6, drawTarget: 7 })
    expect(normalizeWarpRequest({ simpleSkinGoal: { bannerId: 'unknown', drawsDone: 0, drawTarget: 8 } }).simpleSkinGoal).toBeNull()
    expect(normalizeWarpRequest({}).simpleSkinGoal).toBeNull()
  })

  test('legacy Simple skin progress migrates unless the new field is explicitly set', () => {
    const legacyGoal = skinTarget(6, 7).skin
    const currentGoal = skinTarget(2, 5).skin

    const migrated = normalizeWarpRequest({ simpleSkin: legacyGoal })
    const cleared = normalizeWarpRequest({ simpleSkin: legacyGoal, simpleSkinGoal: null })
    const updated = normalizeWarpRequest({ simpleSkin: legacyGoal, simpleSkinGoal: currentGoal })

    expect(migrated.simpleSkinGoal).toEqual(legacyGoal)
    expect(migrated).not.toHaveProperty('simpleSkin')
    expect(cleared.simpleSkinGoal).toBeNull()
    expect(updated.simpleSkinGoal).toEqual(currentGoal)
  })
})

test.each([
  { drawsDone: 9, drawTarget: 3.5, expected: { drawsDone: 0, drawTarget: 8 } },
  { drawsDone: 5, drawTarget: 2, expected: { drawsDone: 5, drawTarget: 6 } },
])('normalization clamps skin progress $drawsDone to $drawTarget', ({ drawsDone, drawTarget, expected }) => {
  const result = normalizeWarpRequest({
    targets: [{ ...skinTarget(), skin: { bannerId: STAR_LOTTO, drawsDone, drawTarget } }],
  })

  expect(result.targets).toEqual([createSkinTarget('skin', { bannerId: STAR_LOTTO, ...expected })])
})

test('unknown skins do not reserve the slot before a valid compact skin target', () => {
  const unknown = createSkinTarget('unknown', { bannerId: 'unknown-banner', drawsDone: 0, drawTarget: 8 })
  const valid = skinTarget(3, 7)
  const request = { ...SKIN_REQUEST, targets: [unknown, valid] }

  const normalized = normalizeWarpRequest(JSON.parse(JSON.stringify(request)))
  const result = calculateWarps(request)

  expect(normalized.targets).toEqual([valid])
  expect(result.targetResults.map((result) => result.target)).toEqual([valid])
  expect(valid).toEqual({ kind: WarpTargetKind.SKIN, id: 'skin', skin: { bannerId: STAR_LOTTO, drawsDone: 3, drawTarget: 7 } })
})

test('legacy mixed goals remain warp targets and do not reserve the skin slot', () => {
  const { kind: _kind, ...legacyWarp } = target({ id: 'legacy', targetEidolonLevel: EidolonLevel.E0 })
  const skin = skinTarget()

  const result = normalizeWarpRequest({ targets: [{ ...legacyWarp, skin: skin.skin }, skin] })

  expect(result.targets).toEqual([{ ...legacyWarp, kind: WarpTargetKind.WARP }, skin])
})

test('tagged warp targets ignore stale skin data', () => {
  const warp = target({ targetEidolonLevel: EidolonLevel.NONE, targetSuperimpositionLevel: SuperimpositionLevel.NONE })
  const skin = skinTarget()

  const result = normalizeWarpRequest({ targets: [{ ...warp, skin: skin.skin }, skin] })

  expect(result.targets).toEqual([warp, skin])
})

test('legacy skin targets migrate without retaining their empty warp fields', () => {
  const legacySkin = {
    id: 'legacy-skin',
    targetEidolonLevel: EidolonLevel.NONE,
    targetSuperimpositionLevel: SuperimpositionLevel.NONE,
    skin: skinTarget(2, 5).skin,
  }

  const result = normalizeWarpRequest({ targets: [legacySkin] })

  expect(result.targets).toEqual([skinTarget(2, 5, 'legacy-skin')])
})

test.each(['2', NaN, Infinity, -2, 0.5, null, undefined])('saved numeric fields reject invalid value %s', (value) => {
  const skin = { bannerId: STAR_LOTTO, drawsDone: value, drawTarget: value }
  const result = normalizeWarpRequest({
    simpleSkinGoal: skin,
    targets: [
      {
        ...DEFAULT_WARP_TARGET,
        targetEidolonLevel: value,
        targetSuperimpositionLevel: value,
        currentEidolonLevel: value,
        currentSuperimpositionLevel: value,
      },
      { kind: WarpTargetKind.SKIN, id: 'skin', skin },
    ],
  })

  expect(result.targets).toEqual([DEFAULT_WARP_TARGET, skinTarget()])
  expect(result.simpleSkinGoal).toEqual(skinTarget().skin)
})

function expectPercent(actual: number, expectedPercent: number) {
  expect(Math.abs(actual * 100 - expectedPercent)).toBeLessThanOrEqual(0.06)
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
