import { Stats, SubStats } from 'lib/constants/constants'
import { Key } from 'lib/optimization/computedStatsArray'
import { StatCalculator } from 'lib/relics/statCalculator'
import { PartialSimulationWrapper, ScoringParams, SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import { SimulationStats } from 'lib/simulations/statSimulationController'
import { SimulationMetadata } from 'types/metadata'

export function calculateMinSubstatRollCounts(
  partialSimulationWrapper: PartialSimulationWrapper,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
) {
  const minCounts: SimulationStats = {
    [Stats.HP_P]: scoringParams.freeRolls,
    [Stats.ATK_P]: scoringParams.freeRolls,
    [Stats.DEF_P]: scoringParams.freeRolls,
    [Stats.HP]: scoringParams.freeRolls,
    [Stats.ATK]: scoringParams.freeRolls,
    [Stats.DEF]: scoringParams.freeRolls,
    [Stats.SPD]: partialSimulationWrapper.speedRollsDeduction,
    [Stats.CR]: scoringParams.freeRolls,
    [Stats.CD]: scoringParams.freeRolls,
    [Stats.EHR]: scoringParams.freeRolls,
    [Stats.RES]: scoringParams.freeRolls,
    [Stats.BE]: scoringParams.freeRolls,
  }

  return minCounts
}

export function calculateMaxSubstatRollCounts(
  partialSimulationWrapper: PartialSimulationWrapper,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
  baselineSimResult: SimulationResult,
  simulationFlags: SimulationFlags,
): SimulationStats {
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
  for (const substat of metadata.substats) {
    maxCounts[substat] = scoringParams.maxPerSub
  }

  // Every main stat deducts some potential rolls
  maxCounts[request.simBody] -= scoringParams.deductionPerMain
  maxCounts[request.simFeet] -= scoringParams.deductionPerMain
  maxCounts[request.simPlanarSphere] -= scoringParams.deductionPerMain
  maxCounts[request.simLinkRope] -= scoringParams.deductionPerMain

  for (const stat of SubStats) {
    // What does this do?
    maxCounts[stat] = Math.min(maxCounts[stat], scoringParams.substatGoal - 10 * scoringParams.freeRolls - Math.ceil(partialSimulationWrapper.speedRollsDeduction))
    maxCounts[stat] = Math.max(maxCounts[stat], scoringParams.freeRolls)
    if (metadata.maxBonusRolls?.[stat] != undefined) {
      maxCounts[stat] = Math.min(maxCounts[stat], metadata.maxBonusRolls[stat] + scoringParams.freeRolls)
    }
  }

  // If enabled, don't let flat stats be chosen aside from the free rolls
  if (scoringParams.limitFlatStats) {
    maxCounts[Stats.ATK] = scoringParams.freeRolls
    maxCounts[Stats.HP] = scoringParams.freeRolls
    maxCounts[Stats.DEF] = scoringParams.freeRolls
  }

  // Naively assume flat stats won't be chosen more than 10 times. Are there real scenarios for flat atk?
  maxCounts[Stats.ATK] = Math.min(10, maxCounts[Stats.ATK])
  maxCounts[Stats.HP] = Math.min(10, maxCounts[Stats.HP])
  maxCounts[Stats.DEF] = Math.min(10, maxCounts[Stats.DEF])

  // Force speed
  maxCounts[Stats.SPD] = partialSimulationWrapper.speedRollsDeduction

  // The simplifications should not go below 6 rolls otherwise it interferes with possible build enforcement

  // Simplify crit rate so the sim is not wasting permutations
  // Overcapped 30 * 3.24 + 5 = 102.2% crit
  // Main stat  20 * 3.24 + 32.4 + 5 = 102.2% crit
  // Assumes maximum 100 CR is needed ever
  if (!simulationFlags.overcapCritRate) {
    const critValue = StatCalculator.getMaxedSubstatValue(Stats.CR, scoringParams.quality)
    const missingCrit = Math.max(0, 100 - baselineSimResult.xa[Key.CR] * 100)
    maxCounts[Stats.CR] = Math.max(scoringParams.baselineFreeRolls, Math.max(scoringParams.enforcePossibleDistribution
      ? 6
      : 0, Math.min(
      request.simBody == Stats.CR
        ? Math.ceil((missingCrit - 32.4) / critValue)
        : Math.ceil(missingCrit / critValue),
      maxCounts[Stats.CR],
    )))
  }

  // Simplify EHR so the sim is not wasting permutations
  // Assumes 20 enemy effect RES
  // Assumes maximum 120 EHR is needed ever
  const ehrValue = StatCalculator.getMaxedSubstatValue(Stats.EHR, scoringParams.quality)
  const missingEhr = Math.max(0, 120 - baselineSimResult.xa[Key.EHR] * 100)
  maxCounts[Stats.EHR] = maxCounts[Stats.EHR] == 0
    ? 0
    : Math.max(scoringParams.baselineFreeRolls, Math.max(scoringParams.enforcePossibleDistribution
      ? 6
      : 0, Math.min(
      request.simBody == Stats.EHR
        ? Math.ceil((missingEhr - 43.2) / ehrValue)
        : Math.ceil(missingEhr / ehrValue),
      maxCounts[Stats.EHR],
    )))

  // Forced speed rolls will take up slots from the 36 potential max rolls of other stats
  const nonSpeedSubsCapDeduction = Math.ceil(partialSimulationWrapper.speedRollsDeduction) - 6
  for (const stat of SubStats) {
    if (stat == Stats.SPD) continue
    maxCounts[stat] = Math.max(scoringParams.baselineFreeRolls, Math.min(maxCounts[stat], 36 - nonSpeedSubsCapDeduction))
  }
  return maxCounts
}
