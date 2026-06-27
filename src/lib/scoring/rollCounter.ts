import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { StatCalculator } from 'lib/relics/statCalculator'
import { SCORING_CONFIG_REGISTRY } from 'lib/scoring/scoringConfig'
import {
  StatsToStatKey,
  type BreakpointRollRequirement,
  type PartialSimulationWrapper,
  type ScoringParams,
  type SimulationFlags,
} from 'lib/scoring/simScoringUtils'
import type {
  RunStatSimulationsResult,
  SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import {
  isFlat,
  isSubstat,
} from 'lib/utils/statUtils'
import type {
  ScoringConfigType,
  SimulationMetadata,
} from 'types/metadata'

function computeResRollTarget(
  partialSimulationWrapper: PartialSimulationWrapper,
  scoringParams: ScoringParams,
): number {
  const resTarget = computeForcedResRollTarget(partialSimulationWrapper, scoringParams)
  const resBudget = scoringParams.substatGoal - Math.ceil(partialSimulationWrapper.speedRollsDeduction) - 10 * scoringParams.freeRolls
  return Math.min(
    resTarget,
    Math.max(resBudget, scoringParams.freeRolls),
  )
}

function computeForcedResRollTarget(
  partialSimulationWrapper: PartialSimulationWrapper,
  scoringParams: ScoringParams,
): number {
  return Math.max(Math.ceil(partialSimulationWrapper.resRollsDeduction), scoringParams.freeRolls)
}

export function calculateSubstatRollCountTotal(counts: SubstatCounts): number {
  return SubStats.reduce((sum, stat) => sum + (counts[stat] ?? 0), 0)
}

// Converts hard breakpoint metadata into concrete roll requirements using the zero-substat simulation result.
// SPD is excluded — it's handled by the existing speed deduction system.
export function calculateBreakpointRollRequirements(
  simulationResult: RunStatSimulationsResult,
  metadata: SimulationMetadata,
  scoringParams: Pick<ScoringParams, 'quality' | 'freeRolls'>,
): BreakpointRollRequirement[] {
  const hardBreakpoints = metadata.hardBreakpoints ?? []

  const requirements: BreakpointRollRequirement[] = []

  for (const { stat, threshold } of hardBreakpoints) {
    if (stat === Stats.SPD) continue
    const statValue = simulationResult.x.getActionValueByIndex(StatsToStatKey[stat], SELF_ENTITY_INDEX)
    const gap = threshold - statValue
    if (gap <= 0) continue

    const baseRollValue = StatCalculator.getMaxedSubstatValue(stat, scoringParams.quality)
    const rollValue = isFlat(stat) ? baseRollValue : baseRollValue * 0.01
    const requiredRolls = Math.ceil(gap / rollValue)
    if (requiredRolls <= scoringParams.freeRolls) continue

    requirements.push({ stat, requiredRolls })
  }

  return requirements
}

export type HardBreakpointRollBudget = {
  speedRollsDeduction: number,
  feasible: boolean,
}

function buildMinSubstatRollCounts(
  speedRollsDeduction: number,
  breakpointRequirements: BreakpointRollRequirement[] | undefined,
  scoringParams: ScoringParams,
  resMin: number,
): SubstatCounts {
  const counts: SubstatCounts = {
    [Stats.HP_P]: scoringParams.freeRolls,
    [Stats.ATK_P]: scoringParams.freeRolls,
    [Stats.DEF_P]: scoringParams.freeRolls,
    [Stats.HP]: scoringParams.freeRolls,
    [Stats.ATK]: scoringParams.freeRolls,
    [Stats.DEF]: scoringParams.freeRolls,
    [Stats.SPD]: speedRollsDeduction,
    [Stats.CR]: scoringParams.freeRolls,
    [Stats.CD]: scoringParams.freeRolls,
    [Stats.EHR]: scoringParams.freeRolls,
    [Stats.RES]: resMin,
    [Stats.BE]: scoringParams.freeRolls,
  }

  if (breakpointRequirements) {
    for (const req of breakpointRequirements) {
      counts[req.stat] = Math.max(counts[req.stat], req.requiredRolls)
    }
  }

  return counts
}

// Caps SPD to fit within the roll budget after non-SPD forced costs (freeRolls, RES, breakpoints).
// Returns feasible=false when forced non-SPD costs alone exceed the budget.
export function calculateHardBreakpointRollBudget(
  partialSimulationWrapper: PartialSimulationWrapper,
  scoringParams: ScoringParams,
): HardBreakpointRollBudget {
  const forcedResRollTarget = computeForcedResRollTarget(partialSimulationWrapper, scoringParams)
  const minCountsWithoutSpeed = buildMinSubstatRollCounts(
    0,
    partialSimulationWrapper.breakpointRequirements,
    scoringParams,
    forcedResRollTarget,
  )
  const totalWithoutSpeed = calculateSubstatRollCountTotal(minCountsWithoutSpeed)
  const speedRollsDeduction = Math.min(
    partialSimulationWrapper.speedRollsDeduction,
    Math.max(0, scoringParams.substatGoal - totalWithoutSpeed),
  )
  const totalForcedRolls = totalWithoutSpeed + speedRollsDeduction

  return {
    speedRollsDeduction,
    feasible: totalForcedRolls <= scoringParams.substatGoal,
  }
}

// Detects hard breakpoints, caps SPD, and mutates the wrapper. Returns false if infeasible.
export function applyHardBreakpoints(
  partialSimulationWrapper: PartialSimulationWrapper,
  simulationResult: RunStatSimulationsResult,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
): boolean {
  const breakpointReqs = calculateBreakpointRollRequirements(simulationResult, metadata, scoringParams)
  if (!breakpointReqs.length) return true

  partialSimulationWrapper.breakpointRequirements = breakpointReqs
  const hardBudget = calculateHardBreakpointRollBudget(partialSimulationWrapper, scoringParams)
  if (!hardBudget.feasible) return false

  partialSimulationWrapper.speedRollsDeduction = hardBudget.speedRollsDeduction
  return true
}

export function calculateMinSubstatRollCounts(
  partialSimulationWrapper: PartialSimulationWrapper,
  scoringParams: ScoringParams,
): SubstatCounts {
  return buildMinSubstatRollCounts(
    partialSimulationWrapper.speedRollsDeduction,
    partialSimulationWrapper.breakpointRequirements,
    scoringParams,
    computeResRollTarget(partialSimulationWrapper, scoringParams),
  )
}

export function calculateMaxSubstatRollCounts(
  partialSimulationWrapper: PartialSimulationWrapper,
  scoringParams: ScoringParams,
  zeroMainsStatResult: RunStatSimulationsResult,
  simulationFlags: SimulationFlags,
  configType: ScoringConfigType,
): SubstatCounts {
  const request = partialSimulationWrapper.simulation.request
  const maxCounts: Record<string, number> = {
    [Stats.HP_P]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.ATK]: 0,
    [Stats.DEF]: 0,
    [Stats.SPD]: 0,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  }

  // Only account for desired subs
  for (const substat of partialSimulationWrapper.effectiveSubstats) {
    maxCounts[substat] = scoringParams.maxPerSub
  }

  // Every main stat deducts some potential rolls
  if (isSubstat(request.simBody)) maxCounts[request.simBody] -= scoringParams.deductionPerMain
  if (isSubstat(request.simFeet)) maxCounts[request.simFeet] -= scoringParams.deductionPerMain
  if (isSubstat(request.simPlanarSphere)) maxCounts[request.simPlanarSphere] -= scoringParams.deductionPerMain
  if (isSubstat(request.simLinkRope)) maxCounts[request.simLinkRope] -= scoringParams.deductionPerMain

  const reservedRolls = 11 * scoringParams.freeRolls
    + Math.max(0, Math.ceil(partialSimulationWrapper.speedRollsDeduction) - scoringParams.freeRolls)
    + Math.max(0, Math.ceil(partialSimulationWrapper.resRollsDeduction) - scoringParams.freeRolls)
  for (const stat of SubStats) {
    maxCounts[stat] = Math.min(
      maxCounts[stat],
      scoringParams.substatGoal - reservedRolls,
    )
    maxCounts[stat] = Math.max(maxCounts[stat], scoringParams.freeRolls)
  }

  // For DPS, flat stats are always outcompeted by multiplicative stats — cap at 10 to reduce search space.
  // For non-DPS (buffer/heal/shield), flat stats can be the primary scaling stat, so don't cap.
  if (SCORING_CONFIG_REGISTRY[configType].capFlatSubstats) {
    maxCounts[Stats.ATK] = Math.min(10, maxCounts[Stats.ATK])
    maxCounts[Stats.HP] = Math.min(10, maxCounts[Stats.HP])
    maxCounts[Stats.DEF] = Math.min(10, maxCounts[Stats.DEF])
  }

  // Force speed
  maxCounts[Stats.SPD] = partialSimulationWrapper.speedRollsDeduction

  // Force RES when equalized, capped to available budget
  if (partialSimulationWrapper.resRollsDeduction > 0) {
    maxCounts[Stats.RES] = computeResRollTarget(partialSimulationWrapper, scoringParams)
  }

  // The simplifications should not go below 6 rolls otherwise it interferes with possible build enforcement
  // These should only apply to the 200% benchmark as it doesn't have diminishing returns to account for

  // Simplify crit rate so the sim is not wasting permutations
  // Overcapped 30 * 3.24 + 5 = 102.2% crit
  // Main stat  20 * 3.24 + 32.4 + 5 = 102.2% crit
  // Assumes maximum 100 CR is needed ever
  if (!simulationFlags.overcapCritRate && scoringParams.quality == 1.0) {
    const critValue = StatCalculator.getMaxedSubstatValue(Stats.CR, scoringParams.quality)
    const missingCrit = Math.max(0, 100 - zeroMainsStatResult.x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) * 100)
    maxCounts[Stats.CR] = maxCounts[Stats.CR] == 0
      ? 0
      : Math.max(
        scoringParams.baselineFreeRolls,
        Math.max(
          scoringParams.enforcePossibleDistribution
            ? 6
            : 0,
          Math.min(
            request.simBody == Stats.CR
              ? Math.ceil((missingCrit - 32.4) / critValue)
              : Math.ceil(missingCrit / critValue),
            maxCounts[Stats.CR],
          ),
        ),
      )
  }

  // Simplify EHR so the sim is not wasting permutations
  // Assumes 20 enemy effect RES
  // Assumes maximum 120 EHR is needed ever
  if (scoringParams.quality == 1.0) {
    const ehrValue = StatCalculator.getMaxedSubstatValue(Stats.EHR, scoringParams.quality)
    const missingEhr = Math.max(0, 120 - zeroMainsStatResult.x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX) * 100)
    maxCounts[Stats.EHR] = maxCounts[Stats.EHR] == 0
      ? 0
      : Math.max(
        scoringParams.baselineFreeRolls,
        Math.max(
          scoringParams.enforcePossibleDistribution
            ? 6
            : 0,
          Math.min(
            request.simBody == Stats.EHR
              ? Math.ceil((missingEhr - 43.2) / ehrValue)
              : Math.ceil(missingEhr / ehrValue),
            maxCounts[Stats.EHR],
          ),
        ),
      )
  }

  // Approximate: a stat present on all 6 relics gets up to 6 base rolls (1 per piece) that don't
  // consume upgrade slots. Only forced rolls beyond that are upgrades that displace other stats.
  const BASE_ROLLS_PER_STAT = 6
  const spdUpgrades = Math.max(0, Math.ceil(partialSimulationWrapper.speedRollsDeduction) - BASE_ROLLS_PER_STAT)
  const resUpgrades = Math.max(0, Math.ceil(partialSimulationWrapper.resRollsDeduction) - BASE_ROLLS_PER_STAT)
  const totalDeductions = spdUpgrades + resUpgrades
  for (const stat of SubStats) {
    if (stat == Stats.SPD) continue
    if (stat == Stats.RES && partialSimulationWrapper.resRollsDeduction > 0) continue
    maxCounts[stat] = Math.max(scoringParams.baselineFreeRolls, Math.min(maxCounts[stat], 36 - totalDeductions))
  }

  if (partialSimulationWrapper.breakpointRequirements) {
    for (const req of partialSimulationWrapper.breakpointRequirements) {
      maxCounts[req.stat] = Math.max(maxCounts[req.stat], req.requiredRolls)
    }
  }

  return maxCounts
}
