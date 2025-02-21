import { Parts, Stats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { SimulationStatUpgrade } from 'lib/scoring/characterScorer'
import { Simulation } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form } from 'types/form'
import { DBMetadataCharacter, SimulationMetadata } from 'types/metadata'
import { Relic } from 'types/relic'

export type ScoringParams = {
  quality: number
  speedRollValue: number
  substatGoal: number
  freeRolls: number
  maxPerSub: number
  deductionPerMain: number
  baselineFreeRolls: number
  limitFlatStats: boolean
  enforcePossibleDistribution: boolean
  substatRollsModifier: (rolls: number,
    stat: string,
    relics: {
      [key: string]: Relic
    }) => number
}

export type SimulationResult = OptimizerDisplayData & {
  unpenalizedSimScore: number
  penaltyMultiplier: number
  simScore: number
  xa: Float32Array
  ca: Float32Array
}

export type SimulationScore = {
  percent: number

  originalSim: Simulation
  baselineSim: Simulation
  benchmarkSim: Simulation
  maximumSim: Simulation

  originalSimResult: SimulationResult
  baselineSimResult: SimulationResult
  benchmarkSimResult: SimulationResult
  maximumSimResult: SimulationResult

  originalSimScore: number
  baselineSimScore: number
  benchmarkSimScore: number
  maximumSimScore: number

  substatUpgrades: SimulationStatUpgrade[]
  setUpgrades: SimulationStatUpgrade[]
  mainUpgrades: SimulationStatUpgrade[]

  simulationForm: Form
  simulationMetadata: SimulationMetadata
  characterMetadata: DBMetadataCharacter

  originalSpd: number
  spdBenchmark: number | null
  simulationFlags: SimulationFlags
}

export type RelicBuild = {
  [key: string]: Relic
}

export type ScoringFunction = (result: SimulationResult, penalty?: boolean) => void

export type PartialSimulationWrapper = {
  simulation: Simulation
  finalSpeed: number
  speedRollsDeduction: number
}

export type SimulationFlags = {
  addBreakEffect: boolean
  overcapCritRate: boolean
  simPoetActive: boolean
  characterPoetActive: boolean
  forceBasicSpd: boolean
  forceBasicSpdValue: number
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

export function substatRollsModifier(rolls: number,
  stat: string,
  relics: {
    [key: string]: Relic
  }) {
  // if (stat == Stats.SPD) return rolls
  // Diminishing returns

  const mainsCount = Object.values(relics)
    .filter((x) => x.augmentedStats!.mainStat == stat)
    .length

  return stat == Stats.SPD ? spdDiminishingReturnsFormula(mainsCount, rolls) : diminishingReturnsFormula(mainsCount, rolls)
}

export function diminishingReturnsFormula(mainsCount: number, rolls: number) {
  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - (lowerLimit))
  const diminishedExcess = excess / (Math.pow(excess, 0.25))

  return lowerLimit + diminishedExcess
}

export function spdDiminishingReturnsFormula(mainsCount: number, rolls: number) {
  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - (lowerLimit))
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
  const previousValue = spdDiminishingReturnsFormula(mainsCount, previousRolls) * rollValue

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

export function cloneRelicsFillEmptySlots(displayRelics: RelicBuild) {
  const cloned: RelicBuild = TsUtils.clone(displayRelics)
  const relicsByPart: SingleRelicByPart = {} as SingleRelicByPart
  for (const part of Object.values(Parts)) {
    relicsByPart[part] = cloned[part] || {
      set: -1,
      substats: [],
      main: {
        stat: 'NONE',
        value: 0,
      },
    }
  }

  return relicsByPart
}

export function isSpdBoots(simulation: Simulation) {
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
  return bResult.simScore - aResult.simScore
}
