// @vitest-environment jsdom
import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import {
  Stats,
  SubStats,
  type SubStats as SubStatsType,
} from 'lib/constants/constants'
import { StatCalculator } from 'lib/relics/statCalculator'
import {
  calculateHardBreakpointRollBudget,
  calculateMaxSubstatRollCounts,
  calculateMinSubstatRollCounts,
  calculateSubstatRollCountTotal,
} from 'lib/scoring/rollCounter'
import {
  benchmarkScoringParams,
  type BreakpointRollRequirement,
  type PartialSimulationWrapper,
} from 'lib/scoring/simScoringUtils'
import {
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import { Metadata } from 'lib/state/metadataInitializer'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { clone } from 'lib/utils/objectUtils'
import { ScoringConfigType } from 'types/metadata'
import { describe, expect, test } from 'vitest'

Metadata.initialize()

const defaultFlags = {
  overcapCritRate: false,
  simPoetActive: false,
  characterPoetActive: false,
  forceErrRope: false,
  benchmarkBasicSpdTarget: 0,
  benchmarkBasicResTarget: 0,
}

const kafkaBreakpointRequirement: BreakpointRollRequirement = {
  stat: Stats.EHR,
  requiredRolls: 4,
}

const zeroMainsMock = {
  x: {
    getActionValueByIndex: () => 0,
  },
} as unknown as Parameters<typeof calculateMaxSubstatRollCounts>[2]

function makeKafkaWrapper(overrides: Partial<PartialSimulationWrapper> = {}): PartialSimulationWrapper {
  return {
    simulation: {
      simType: StatSimTypes.SubstatRolls,
      request: {
        simRelicSet1: 'PrisonerInDeepConfinement' as any,
        simRelicSet2: 'PrisonerInDeepConfinement' as any,
        simOrnamentSet: 'FirmamentFrontlineGlamoth' as any,
        simBody: Stats.EHR,
        simFeet: Stats.SPD,
        simPlanarSphere: Stats.Lightning_DMG,
        simLinkRope: Stats.ATK_P,
        stats: StatCalculator.getZeroesSubstats(),
      },
    },
    speedRollsDeduction: 25,
    resRollsDeduction: 0,
    effectiveSubstats: [Stats.ATK_P, Stats.ATK, Stats.EHR, Stats.CR, Stats.CD],
    poolIndex: 0,
    ...overrides,
  }
}

function applyHardBudget(wrapper: PartialSimulationWrapper, scoringParams = benchmarkScoringParams) {
  const hardBudget = calculateHardBreakpointRollBudget(wrapper, clone(scoringParams))
  wrapper.speedRollsDeduction = hardBudget.speedRollsDeduction
  return hardBudget
}

describe('breakpoint enforcement', () => {
  test('Kafka metadata has EHR breakpoint at 0.75', () => {
    const metadata = getGameMetadata().characters[KafkaB1.id].scoringMetadata.simulation!
    expect(metadata.softBreakpoints).toBeUndefined()
    expect(metadata.hardBreakpoints).toBeDefined()
    expect(metadata.hardBreakpoints).toEqual([
      {
        stat: Stats.EHR,
        threshold: 0.75,
      },
    ])
    expect(metadata.substats).toContain(Stats.EHR)
  })

  test('EHR roll value math is correct', () => {
    const rollValue = StatCalculator.getMaxedSubstatValue(Stats.EHR as SubStatsType, 0.8)
    expect(rollValue).toBeCloseTo(3.456, 2)

    const scaledValue = rollValue * 0.01
    expect(scaledValue).toBeCloseTo(0.03456, 4)

    const gap = 0.75 - 0.612
    const rollsNeeded = Math.ceil(gap / scaledValue)
    expect(rollsNeeded).toBe(4)
  })

  test.each([
    [25, 24],
    [26, 24],
    [27, 24],
  ])('hard budget caps %i requested SPD to %i after EHR breakpoint', (speedRollsDeduction, expectedSpeedRolls) => {
    const wrapper = makeKafkaWrapper({
      speedRollsDeduction,
      breakpointRequirements: [kafkaBreakpointRequirement],
    })

    const hardBudget = calculateHardBreakpointRollBudget(wrapper, clone(benchmarkScoringParams))

    expect(hardBudget.speedRollsDeduction).toBe(expectedSpeedRolls)
    expect(hardBudget.feasible).toBe(true)
  })

  test('min counts enforce breakpoint EHR minimum within the 48-roll budget', () => {
    const wrapper = makeKafkaWrapper({
      breakpointRequirements: [kafkaBreakpointRequirement],
    })
    applyHardBudget(wrapper)

    const minCounts = calculateMinSubstatRollCounts(wrapper, clone(benchmarkScoringParams))

    expect(minCounts[Stats.EHR]).toBe(4)
    expect(minCounts[Stats.SPD]).toBe(24)
    expect(minCounts[Stats.ATK_P]).toBe(2)
    expect(minCounts[Stats.ATK]).toBe(2)
    expect(minCounts[Stats.CR]).toBe(2)
    expect(minCounts[Stats.CD]).toBe(2)
    expect(calculateSubstatRollCountTotal(minCounts)).toBe(benchmarkScoringParams.substatGoal)
  })

  test('min counts are unchanged when no breakpoint requirements', () => {
    const wrapper = makeKafkaWrapper()

    const minCounts = calculateMinSubstatRollCounts(wrapper, clone(benchmarkScoringParams))

    expect(minCounts[Stats.EHR]).toBe(2)
    expect(minCounts[Stats.SPD]).toBe(25)
  })

  test('max counts enforce breakpoint floor without pinning non-breakpoint stats', () => {
    const wrapper = makeKafkaWrapper({
      breakpointRequirements: [kafkaBreakpointRequirement],
    })
    applyHardBudget(wrapper)

    const maxCounts = calculateMaxSubstatRollCounts(
      wrapper,
      clone(benchmarkScoringParams),
      zeroMainsMock,
      defaultFlags,
      ScoringConfigType.DPS,
    )

    expect(maxCounts[Stats.EHR]).toBeGreaterThanOrEqual(4)
    expect(maxCounts[Stats.SPD]).toBe(24)
    for (const stat of SubStats) {
      expect(maxCounts[stat]).toBeGreaterThanOrEqual(benchmarkScoringParams.freeRolls)
    }
  })

  test('breakpoints set max floors while normal path allows optimization freedom', () => {
    const withoutBp = makeKafkaWrapper()
    const withBp = makeKafkaWrapper({
      breakpointRequirements: [kafkaBreakpointRequirement],
    })
    applyHardBudget(withBp)

    const maxWithout = calculateMaxSubstatRollCounts(
      withoutBp,
      clone(benchmarkScoringParams),
      zeroMainsMock,
      defaultFlags,
      ScoringConfigType.DPS,
    )
    const maxWith = calculateMaxSubstatRollCounts(
      withBp,
      clone(benchmarkScoringParams),
      zeroMainsMock,
      defaultFlags,
      ScoringConfigType.DPS,
    )

    expect(maxWithout[Stats.ATK_P]).toBeGreaterThan(benchmarkScoringParams.freeRolls)
    expect(maxWith[Stats.EHR]).toBeGreaterThanOrEqual(4)
    expect(maxWith[Stats.ATK_P]).toBeGreaterThanOrEqual(benchmarkScoringParams.freeRolls)
  })

  test('hard budget caps SPD after forced RES and EHR consume budget', () => {
    const wrapper = makeKafkaWrapper({
      speedRollsDeduction: 22,
      resRollsDeduction: 10,
      breakpointRequirements: [kafkaBreakpointRequirement],
    })
    const hardBudget = applyHardBudget(wrapper)

    expect(hardBudget.speedRollsDeduction).toBe(16)
    expect(hardBudget.feasible).toBe(true)

    const minCounts = calculateMinSubstatRollCounts(wrapper, clone(benchmarkScoringParams))

    expect(minCounts[Stats.SPD]).toBe(16)
    expect(minCounts[Stats.RES]).toBe(10)
    expect(minCounts[Stats.EHR]).toBe(4)
    expect(calculateSubstatRollCountTotal(minCounts)).toBe(benchmarkScoringParams.substatGoal)
  })

  test('hard budget rejects infeasible candidates when forced non-SPD costs exceed budget', () => {
    const wrapper = makeKafkaWrapper({
      speedRollsDeduction: 25,
      resRollsDeduction: 10,
      breakpointRequirements: [{ stat: Stats.EHR, requiredRolls: 27 }],
    })
    const hardBudget = calculateHardBreakpointRollBudget(wrapper, clone(benchmarkScoringParams))

    expect(hardBudget.feasible).toBe(false)
    expect(hardBudget.speedRollsDeduction).toBe(0)
  })
})
