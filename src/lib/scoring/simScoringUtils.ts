import type {
  ElementName,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import {
  ElementToStatKeyDmgBoost,
  Sets,
  Stats,
} from 'lib/constants/constants'
import type { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import type { AKeyValue } from 'lib/optimization/engine/config/keys'
import {
  GlobalRegister,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { StatCalculator } from 'lib/relics/statCalculator'
import type { SimulationSets } from 'lib/scoring/dpsScore'
import type { SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import type {
  RunStatSimulationsResult,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import { isFlat } from 'lib/utils/statUtils'
import type { Form } from 'types/form'
import type {
  DBMetadataCharacter,
  SimulationMetadata,
} from 'types/metadata'
import type { Relic } from 'types/relic'

// Stats string to StatKey mapping - defined here to avoid circular dependency with keys.ts
export const StatsToStatKey: Record<StatsValues, AKeyValue> = {
  [Stats.ATK_P]: StatKey.ATK_P,
  [Stats.ATK]: StatKey.ATK,
  [Stats.BE]: StatKey.BE,
  [Stats.CD]: StatKey.CD,
  [Stats.CR]: StatKey.CR,
  [Stats.DEF_P]: StatKey.DEF_P,
  [Stats.DEF]: StatKey.DEF,
  [Stats.EHR]: StatKey.EHR,
  [Stats.ERR]: StatKey.ERR,
  [Stats.Fire_DMG]: StatKey.FIRE_DMG_BOOST,
  [Stats.HP_P]: StatKey.HP_P,
  [Stats.HP]: StatKey.HP,
  [Stats.Ice_DMG]: StatKey.ICE_DMG_BOOST,
  [Stats.Imaginary_DMG]: StatKey.IMAGINARY_DMG_BOOST,
  [Stats.Lightning_DMG]: StatKey.LIGHTNING_DMG_BOOST,
  [Stats.OHB]: StatKey.OHB,
  [Stats.Physical_DMG]: StatKey.PHYSICAL_DMG_BOOST,
  [Stats.Quantum_DMG]: StatKey.QUANTUM_DMG_BOOST,
  [Stats.RES]: StatKey.RES,
  [Stats.SPD_P]: StatKey.SPD_P,
  [Stats.SPD]: StatKey.SPD,
  [Stats.Wind_DMG]: StatKey.WIND_DMG_BOOST,
  [Stats.Elation]: StatKey.ELATION,
}

// Get combined elemental DMG from the Container for the self entity
// DMG_BOOST (generic) + element-specific boost (e.g., ICE_DMG_BOOST)
// Uses getSelfValue() to work with containers from fromArrays() that lack config
export function getElementalDmgFromContainer(x: ComputedStatsContainer, element: ElementName): number {
  const dmgBoost = x.getSelfValue(StatKey.DMG_BOOST)
  const elementBoost = x.getSelfValue(ElementToStatKeyDmgBoost[element])
  return dmgBoost + elementBoost
}

export enum ScoringType {
  COMBAT_SCORE,
  SUBSTAT_SCORE,
  NONE,
}

export type ScoringParams = {
  quality: number,
  speedRollValue: number,
  substatGoal: number,
  freeRolls: number,
  maxPerSub: number,
  deductionPerMain: number,
  baselineFreeRolls: number,
  limitFlatStats: boolean,
  enforcePossibleDistribution: boolean,
  substatRollsModifier: (
    rolls: number,
    stat: string,
    sim: Simulation,
  ) => number,
}

export type SimulationResult = OptimizerDisplayData & {
  unpenalizedSimScore: number,
  penaltyMultiplier: number,
  simScore: number,
  xa: Float32Array,
  ca: Float32Array,
}

export type SimulationScore = {
  percent: number,

  originalSim: Simulation,
  baselineSim: Simulation,
  benchmarkSim: Simulation,
  maximumSim: Simulation,

  originalSimResult: RunStatSimulationsResult,
  baselineSimResult: RunStatSimulationsResult,
  benchmarkSimResult: RunStatSimulationsResult,
  maximumSimResult: RunStatSimulationsResult,

  originalSimScore: number,
  baselineSimScore: number,
  benchmarkSimScore: number,
  maximumSimScore: number,

  substatUpgrades: SimulationStatUpgrade[],
  setUpgrades: SimulationStatUpgrade[],
  mainUpgrades: SimulationStatUpgrade[],

  simulationForm: Form,
  simulationMetadata: SimulationMetadata,
  characterMetadata?: DBMetadataCharacter,

  originalSpd: number,
  spdBenchmark: number | undefined,
  simulationFlags: SimulationFlags,
}

export type RelicBuild = {
  [key: string]: Relic,
}

export type PartialSimulationWrapper = {
  simulation: Simulation,
  speedRollsDeduction: number,
  effectiveSubstats: string[],
  poolIndex: number,
}

export type PoolComboState = {
  sets: SimulationSets,
  baselineScore: number,
  combatSpdTarget: number,
  basicSpdTarget: number,
  flags: SimulationFlags,
}

export type SimulationFlags = {
  overcapCritRate: boolean,
  simPoetActive: boolean,
  characterPoetActive: boolean,
  forceErrRope: boolean,
  benchmarkBasicSpdTarget: number,
}

export const benchmarkScoringParams: ScoringParams = {
  quality: 0.8,
  speedRollValue: 2.3,
  substatGoal: 48,
  freeRolls: 2,
  maxPerSub: 30,
  deductionPerMain: 5,
  baselineFreeRolls: 2,
  limitFlatStats: true,
  enforcePossibleDistribution: false,
  substatRollsModifier: substatRollsModifier,
}

export const baselineScoringParams: ScoringParams = benchmarkScoringParams

export const originalScoringParams: ScoringParams = {
  ...benchmarkScoringParams,
  substatRollsModifier: (rolls: number) => rolls,
}

export const maximumScoringParams: ScoringParams = {
  quality: 1.0,
  speedRollValue: 2.6,
  substatGoal: 54,
  freeRolls: 0,
  maxPerSub: 36,
  deductionPerMain: 6,
  baselineFreeRolls: 0,
  limitFlatStats: false,
  enforcePossibleDistribution: true,
  substatRollsModifier: (rolls: number) => rolls,
}

export function substatRollsModifier(
  rolls: number,
  stat: string,
  sim: Simulation,
  customDiminishingReturnsFormula?: (mainsCount: number, rolls: number) => number,
) {
  const mainsCount = [
    sim.request.simBody,
    sim.request.simFeet,
    sim.request.simPlanarSphere,
    sim.request.simLinkRope,
  ].filter((x) => x == stat).length

  return stat == Stats.SPD
    ? spdDiminishingReturnsFormula(mainsCount, rolls)
    : (
      customDiminishingReturnsFormula
        ? customDiminishingReturnsFormula(mainsCount, rolls)
        : diminishingReturnsFormula(mainsCount, rolls)
    )
}

export function diminishingReturnsFormula(mainsCount: number, rolls: number) {
  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - lowerLimit)
  const diminishedExcess = excess / (Math.pow(excess, 0.25))

  return lowerLimit + diminishedExcess
}

export function spdDiminishingReturnsFormula(mainsCount: number, rolls: number) {
  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - lowerLimit)
  const diminishedExcess = excess / (Math.pow(excess, 0.10))

  return lowerLimit + diminishedExcess
}

export function invertDiminishingReturnsSpdFormula(mainsCount: number, target: number, rollValue: number) {
  let current = 0
  let rolls = 0

  while (current < target) {
    rolls++
    current = spdDiminishingReturnsFormula(mainsCount, rolls) * rollValue
  }

  const previousRolls = rolls - 1

  if (current === target) {
    return rolls
  }

  // Narrow down interpolation of fractional rolls by binary search
  let low = previousRolls
  let high = rolls
  let mid = 0
  const precision = 1e-6

  while (high - low > precision) {
    mid = (low + high) / 2
    const interpolatedValue = spdDiminishingReturnsFormula(mainsCount, mid) * rollValue

    if (interpolatedValue < target) {
      low = mid
    } else {
      high = mid
    }
  }

  return mid
}

function isSpdBoots(simulation: Simulation) {
  return simulation.request.simFeet == Stats.SPD
}

export function spdRollsCap(
  simulation: Simulation,
  scoringParams: ScoringParams,
) {
  const spdBoots = isSpdBoots(simulation)

  if (scoringParams.substatGoal == 48) {
    return spdBoots ? 25 : 26
  } else {
    return spdBoots ? 30 : 36
  }
}

export function simSorter(a: Simulation, b: Simulation) {
  const aResult = a.result
  const bResult = b.result

  if (!aResult && !bResult) return 0
  if (!aResult) return 1
  if (!bResult) return -1

  return bResult.simScore - aResult.simScore
}

export function calculateScorePercent(
  score: number,
  baseline: number,
  benchmark: number,
  perfection: number,
): number {
  const clampedPerfection = Math.max(perfection, benchmark)
  if (score >= benchmark) {
    const range = clampedPerfection - benchmark
    return range > 0 ? 1 + (score - benchmark) / range : 1
  }
  const range = benchmark - baseline
  return range > 0 ? (score - baseline) / range : 0
}

export function applyScoringFunction(result: RunStatSimulationsResult, metadata: SimulationMetadata, penalty = true, user = false) {
  if (!result) return

  const unpenalizedSimScore = result.x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG)
  const penaltyMultiplier = calculatePenaltyMultiplier(result, metadata, user)
  result.simScore = unpenalizedSimScore * (penalty ? penaltyMultiplier : 1)
}

function calculatePenaltyMultiplier(
  simulationResult: RunStatSimulationsResult,
  metadata: SimulationMetadata,
  user = false,
) {
  const x = simulationResult.x
  let newPenaltyMultiplier = 1
  if (metadata.breakpoints) {
    for (const stat of Object.keys(metadata.breakpoints)) {
      const statValue = x.getSelfValue(StatsToStatKey[stat as StatsValues])
      if (stat == Stats.SPD && statValue < metadata.breakpoints[stat]) {
        if (user) {
          // Cyrene case
          newPenaltyMultiplier *= 0.75
        }
      } else if (isFlat(stat)) {
        // Flats are penalized by their percentage
        newPenaltyMultiplier *= (Math.min(1, statValue / metadata.breakpoints[stat]) + 1) / 2
      } else {
        // Percents are penalize by half of the missing stat's breakpoint roll percentage
        newPenaltyMultiplier *= Math.min(
          1,
          1
            - (metadata.breakpoints[stat] - statValue)
              / StatCalculator.getMaxedSubstatValue(stat as SubStats, 1.0),
        )
      }
    }
  }

  return newPenaltyMultiplier
}

export function cloneSimResult(result: RunStatSimulationsResult) {
  const x = result.x.clone()
  result.x = x
  result.xa = x.a
  result.ca = x.c.a
  // primaryActionStats and actionDamage are simple objects, shallow copy is sufficient
  if (result.primaryActionStats) {
    result.primaryActionStats = { ...result.primaryActionStats }
  }
  if (result.actionDamage) {
    result.actionDamage = { ...result.actionDamage }
  }
  if (result.rotationDamage) {
    result.rotationDamage = [...result.rotationDamage]
  }

  return result
}

// Reconstructs container from worker result arrays (no config available)
export function cloneWorkerResult(result: RunStatSimulationsResult) {
  const xa = new Float32Array(result.xa)
  const ca = new Float32Array(result.ca)

  result.x = ComputedStatsContainer.fromArrays(xa, ca)
  result.xa = xa
  result.ca = ca

  return result
}

export function requestToSets(request: SimulationRequest): SimulationSets {
  return {
    relicSet1: request.simRelicSet1,
    relicSet2: request.simRelicSet2,
    ornamentSet: request.simOrnamentSet,
  }
}

export function isPoetSet(sets: SimulationSets): boolean {
  return sets.relicSet1 === Sets.PoetOfMourningCollapse
      && sets.relicSet2 === Sets.PoetOfMourningCollapse
}

export function setsEqual(a: SimulationSets, b: SimulationSets): boolean {
  const [ar1, ar2] = [a.relicSet1, a.relicSet2].sort()
  const [br1, br2] = [b.relicSet1, b.relicSet2].sort()
  return ar1 === br1 && ar2 === br2 && a.ornamentSet === b.ornamentSet
}

function deduplicateSets(pool: SimulationSets[]): SimulationSets[] {
  return pool.filter((s, i) => pool.findIndex((other) => setsEqual(s, other)) === i)
}

export function buildCandidateSetPool(
  defaultSets: SimulationSets,
  originalSimRequest: SimulationRequest,
): SimulationSets[] {
  const pool: SimulationSets[] = [defaultSets]

  const userR1 = originalSimRequest.simRelicSet1
  const userR2 = originalSimRequest.simRelicSet2
  const userO = originalSimRequest.simOrnamentSet
  const userRelicValid = userR1 != null && userR2 != null
  const userOrnamentValid = userO != null

  // User's actual equipped combo
  if (userRelicValid && userOrnamentValid) {
    pool.push({ relicSet1: userR1, relicSet2: userR2, ornamentSet: userO })
  } else if (userRelicValid) {
    pool.push({ relicSet1: userR1, relicSet2: userR2, ornamentSet: defaultSets.ornamentSet })
  } else if (userOrnamentValid) {
    pool.push({ relicSet1: defaultSets.relicSet1, relicSet2: defaultSets.relicSet2, ornamentSet: userO })
  }

  // Cross-products (remove this block to disable)
  if (userRelicValid && userOrnamentValid) {
    pool.push(
      { relicSet1: defaultSets.relicSet1, relicSet2: defaultSets.relicSet2, ornamentSet: userO },
      { relicSet1: userR1, relicSet2: userR2, ornamentSet: defaultSets.ornamentSet },
    )
  }

  return deduplicateSets(pool)
}
