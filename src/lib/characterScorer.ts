import { Character } from 'types/Character'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { CUSTOM_TEAM, Parts, Sets, Stats, SubStats } from 'lib/constants'
import { calculateOrnamentSets, calculateRelicSets, convertRelicsToSimulation, runSimulations, Simulation, SimulationRequest, SimulationStats } from 'lib/statSimulationController'
import { getDefaultForm } from 'lib/defaultForm'
import { CharacterConditionals } from 'lib/characterConditionals'
import { Utils } from 'lib/utils'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { emptyRelic } from 'lib/optimizer/optimizerUtils'
import { Form } from 'types/Form'
import { Relic } from 'types/Relic'
import DB from 'lib/db'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { StatCalculator } from 'lib/statCalculator'
import { Conditional } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'

const cachedSims: { [key: string]: SimulationScore } = {}

export type ScoringParams = {
  quality: number
  speedRollValue: number
  substatGoal: number
  freeRolls: number
  maxPerSub: number
  deductionPerMain: number
  baselineFreeRolls: number
  limitFlatStats: boolean
  substatRollsModifier: (rolls: number, stat: string, relics: { [key: string]: Relic }) => number
}

const benchmarkScoringParams: ScoringParams = {
  quality: 0.8,
  speedRollValue: 2.3,
  substatGoal: 48,
  freeRolls: 2,
  maxPerSub: 30,
  deductionPerMain: 5,
  baselineFreeRolls: 2,
  limitFlatStats: true,
  substatRollsModifier: substatRollsModifier,
}

const originalScoringParams: ScoringParams = {
  ...benchmarkScoringParams,
  substatRollsModifier: (rolls: number) => rolls,
}

const maximumScoringParams: ScoringParams = {
  quality: 1.0,
  speedRollValue: 2.6,
  substatGoal: 54,
  freeRolls: 0,
  maxPerSub: 36,
  deductionPerMain: 6,
  baselineFreeRolls: 0,
  limitFlatStats: false,
  substatRollsModifier: (rolls: number) => rolls,
}

function substatRollsModifier(rolls: number, stat: string, relics: { [key: string]: Relic }) {
  if (stat == Stats.SPD) return rolls
  // Diminishing returns

  const mainsCount = Object.values(relics)
    .filter((x) => x.augmentedStats.mainStat == stat)
    .length

  const lowerLimit = 18 - 3 * mainsCount
  const diminishingScale = 0.2

  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - (lowerLimit))
  const diminishedExcess = excess / (1 + diminishingScale * Math.pow(excess, 0.5))

  return lowerLimit + diminishedExcess
}

export type SimulationResult = ComputedStatsObject & {
  BASIC: number
  SKILL: number
  ULT: number
  FUA: number
  DOT: number
  BREAK: number
  unpenalizedSimScore: number
  penaltyMultiplier: number
  simScore: number
  stat: string
  x: ComputedStatsObject
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

  simulationForm: Form
  simulationMetadata: SimulationMetadata
  characterMetadata: CharacterMetadata
}

function cloneRelicsFillEmptySlots(displayRelics: RelicBuild) {
  const cloned: RelicBuild = TsUtils.clone(displayRelics)
  const relicsByPart = {}
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

export type CharacterMetadata = {
  scoringMetadata: ScoringMetadata
}

export type ScoringMetadata = {
  stats: {
    [stat: string]: number
  }
  parts: {
    [part: string]: string[]
  }
  presets: (() => void)[]
  sortOption: string
  simulation: SimulationMetadata
}

export type SimulationMetadata = {
  parts: {
    [part: string]: string[]
  }
  substats: string[]
  breakpoints: {
    [stat: string]: number
  }
  formula: {
    BASIC: number
    SKILL: number
    ULT: number
    FUA: number
    DOT: number
    BREAK: number
  }
  relicSets: string[][]
  ornamentSets: string[]
  maxBonusRolls: {
    [stat: string]: number
  }
  teammates: {
    characterId: string
    lightCone: string
    characterEidolon: number
    lightConeSuperimposition: number
  }[]
}

export type RelicBuild = {
  [key: string]: Relic
}

type ScoringFunction = (result: SimulationResult, penalty?: boolean) => void

type PartialSimulationWrapper = {
  simulation: Simulation
  finalSpeed: number
  speedRollsDeduction: number
}

export function scoreCharacterSimulation(
  character: Character,
  displayRelics: RelicBuild,
  teamSelection: string,
): SimulationScore | null {
  const originalForm = character.form
  const characterId = originalForm.characterId
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  const characterMetadata: CharacterMetadata = DB.getMetadata().characters[characterId]
  if (!characterMetadata) return null

  const defaultScoringMetadata: ScoringMetadata = characterMetadata.scoringMetadata
  const customScoringMetadata: ScoringMetadata = DB.getScoringMetadata(characterId)

  const defaultMetadata: SimulationMetadata = TsUtils.clone(defaultScoringMetadata.simulation)
  const customMetadata: SimulationMetadata = TsUtils.clone(customScoringMetadata.simulation)

  if (!defaultMetadata) {
    console.log('No scoring sim defined for this character')
    return null
  }

  if (teamSelection == CUSTOM_TEAM) {
    defaultMetadata.teammates = customMetadata.teammates
  }
  const metadata = defaultMetadata
  const relicsByPart = cloneRelicsFillEmptySlots(displayRelics)

  const cacheKey = TsUtils.objectHash({
    characterId,
    characterEidolon,
    lightCone,
    lightConeSuperimposition,
    relicsByPart,
    metadata,
  })

  if (cachedSims[cacheKey]) {
    console.log('Using cached bestSims')
    return cachedSims[cacheKey]
  }

  if (!characterId || !originalForm || !metadata) {
    console.log('Invalid character sim setup')
    return null
  }

  // Optimize requested stats
  const substats: string[] = metadata.substats

  // Special handling for break effect carries
  let addBreakEffect = false
  if (metadata.formula.BREAK > 0) {
    // Add break if the formula uses it
    addBreakEffect = true
  }
  if (defaultMetadata.teammates.find((x) => x.characterId == '8005' || x.characterId == '8006')) {
    // Add break if the harmony trailblazer is on the team
    addBreakEffect = true
  }
  if (addBreakEffect && !substats.includes(Stats.BE)) {
    substats.push(Stats.BE)
  }

  // Set up default request
  const simulationForm: Form = generateFullDefaultForm(characterId, lightCone, characterEidolon, lightConeSuperimposition, false)
  const simulationFormT0 = generateFullDefaultForm(metadata.teammates[0].characterId, metadata.teammates[0].lightCone, metadata.teammates[0].characterEidolon, metadata.teammates[0].lightConeSuperimposition, true)
  const simulationFormT1 = generateFullDefaultForm(metadata.teammates[1].characterId, metadata.teammates[1].lightCone, metadata.teammates[1].characterEidolon, metadata.teammates[1].lightConeSuperimposition, true)
  const simulationFormT2 = generateFullDefaultForm(metadata.teammates[2].characterId, metadata.teammates[2].lightCone, metadata.teammates[2].characterEidolon, metadata.teammates[2].lightConeSuperimposition, true)
  simulationForm.teammate0 = simulationFormT0
  simulationForm.teammate1 = simulationFormT1
  simulationForm.teammate2 = simulationFormT2

  // Generate scoring function
  const formula = metadata.formula
  const applyScoringFunction: ScoringFunction = (result: SimulationResult, penalty = true) => {
    if (!result) return

    const score = (
      result.BASIC * formula.BASIC
      + result.SKILL * formula.SKILL
      + result.ULT * formula.ULT
      + result.FUA * formula.FUA
      + result.DOT * formula.DOT
      + result.BREAK * formula.BREAK
    )

    result.unpenalizedSimScore = score
    result.penaltyMultiplier = calculatePenaltyMultiplier(result, metadata.breakpoints, benchmarkScoringParams)
    result.simScore = result.unpenalizedSimScore * (penalty ? result.penaltyMultiplier : 1)
  }

  // Simulate the original character
  const { originalSimResult, originalSim } = simulateOriginalCharacter(relicsByPart, simulationForm, originalScoringParams)
  const originalFinalSpeed = originalSimResult.xSPD
  const originalBaseSpeed = originalSimResult.SPD
  applyScoringFunction(originalSimResult)

  // Generate partials to calculate speed rolls
  const partialSimulationWrappers = generatePartialSimulations(metadata, relicsByPart, originalBaseSpeed)
  const candidateBenchmarkSims: Simulation[] = []

  // Run sims
  for (const partialSimulationWrapper of partialSimulationWrappers) {
    const simulationResult = runSimulations(simulationForm, [partialSimulationWrapper.simulation], benchmarkScoringParams)[0]

    // Find the speed deduction
    const finalSpeed = simulationResult.xSPD
    partialSimulationWrapper.finalSpeed = finalSpeed
    partialSimulationWrapper.speedRollsDeduction = Math.max(
      0,
      TsUtils.precisionRound((originalFinalSpeed - finalSpeed) / benchmarkScoringParams.speedRollValue),
    )

    // Define min/max limits
    const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, benchmarkScoringParams)
    const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, benchmarkScoringParams)

    // Start the sim search at the max then iterate downwards
    Object.values(SubStats).map((stat) => partialSimulationWrapper.simulation.request.stats[stat] = maxSubstatRollCounts[stat])

    const candidateBenchmarkSim = computeOptimalSimulation(
      partialSimulationWrapper,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      simulationForm,
      applyScoringFunction,
      metadata,
      benchmarkScoringParams,
    )
    applyScoringFunction(candidateBenchmarkSim.result)

    // DEBUG
    candidateBenchmarkSim.key = JSON.stringify(candidateBenchmarkSim.request)
    candidateBenchmarkSim.name = ''
    candidateBenchmarkSims.push(candidateBenchmarkSim)
  }

  // Try to minimize the penalty modifier before optimizing sim score
  candidateBenchmarkSims.sort(simSorter)
  const benchmarkSim = candidateBenchmarkSims[0]
  const benchmarkSimResult = benchmarkSim.result

  console.debug('bestSims', candidateBenchmarkSims)

  // ===== Calculate the baseline build =====

  const { baselineSimResult, baselineSim } = simulateBaselineCharacter(
    relicsByPart,
    simulationForm,
    benchmarkScoringParams,
  )
  applyScoringFunction(baselineSimResult)

  // ===== Calculate the maximum build =====

  const maximumSim = simulateMaximumBuild(
    benchmarkSim,
    metadata,
    simulationForm,
    applyScoringFunction,
  )
  const maximumSimResult = maximumSim.result
  applyScoringFunction(maximumSimResult)

  // ===== Calculate percentage values =====

  const benchmarkSimScore = benchmarkSimResult.simScore
  const originalSimScore = originalSimResult.simScore
  const baselineSimScore = baselineSimResult.simScore
  const maximumSimScore = maximumSimResult.simScore

  const percent
    = originalSimScore >= benchmarkSimScore
      ? 1 + (originalSimScore - benchmarkSimScore) / (maximumSimScore - benchmarkSimScore)
      : (originalSimScore - baselineSimScore) / (benchmarkSimScore - baselineSimScore)

  // ===== Calculate upgrades =====

  const { substatUpgradeResults, setUpgradeResults }
    = generateStatImprovements(
      originalSimResult,
      originalSim, candidateBenchmarkSims[0],
      simulationForm,
      metadata,
      applyScoringFunction,
      benchmarkScoringParams,
    )

  for (const upgrade of [...substatUpgradeResults, ...setUpgradeResults]) {
    const upgradeSimScore = upgrade.simulationResult.simScore
    const percent
      = upgradeSimScore >= benchmarkSimScore
        ? 1 + (upgradeSimScore - benchmarkSimScore) / (maximumSimScore - benchmarkSimScore)
        : (upgradeSimScore - baselineSimScore) / (benchmarkSimScore - baselineSimScore)
    upgrade.percent = percent
  }

  // Sort upgrades descending
  substatUpgradeResults.sort((a, b) => b.percent! - a.percent!)
  setUpgradeResults.sort((a, b) => b.percent! - a.percent!)

  const simScoringResult: SimulationScore = {
    percent: percent,

    originalSim: originalSim,
    baselineSim: baselineSim,
    benchmarkSim: benchmarkSim,
    maximumSim: maximumSim,

    originalSimResult: originalSimResult,
    baselineSimResult: baselineSimResult,
    benchmarkSimResult: benchmarkSimResult,
    maximumSimResult: maximumSimResult,

    originalSimScore: originalSimScore,
    baselineSimScore: baselineSimScore,
    benchmarkSimScore: benchmarkSimScore,
    maximumSimScore: maximumSimScore,

    substatUpgrades: substatUpgradeResults,
    setUpgrades: setUpgradeResults,

    simulationForm: simulationForm,
    simulationMetadata: metadata,
    characterMetadata: characterMetadata,
  }

  cachedSims[cacheKey] = simScoringResult

  console.debug('simScoringResult', simScoringResult)
  return simScoringResult
}

function simulateMaximumBuild(
  bestSim: Simulation,
  metadata: SimulationMetadata,
  simulationForm: Form,
  applyScoringFunction: ScoringFunction,
) {
  // Convert the benchmark spd rolls to max spd rolls
  const spdRolls = bestSim.request.stats[Stats.SPD] * benchmarkScoringParams.speedRollValue / maximumScoringParams.speedRollValue

  const bestSimClone: Simulation = TsUtils.clone(bestSim)
  const partialSimulationWrapper: PartialSimulationWrapper = {
    simulation: bestSimClone,
    finalSpeed: 0, // not needed
    speedRollsDeduction: spdRolls,
  }

  const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, maximumScoringParams)
  const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, maximumScoringParams)
  Object.values(SubStats).map((x) => partialSimulationWrapper.simulation.request.stats[x] = maxSubstatRollCounts[x])
  const maxSim = computeOptimalSimulation(
    partialSimulationWrapper,
    minSubstatRollCounts,
    maxSubstatRollCounts,
    simulationForm,
    applyScoringFunction,
    metadata,
    maximumScoringParams,
  )

  return maxSim
}

export type SimulationStatUpgrade = {
  simulation: Simulation
  simulationResult: SimulationResult
  stat?: string
  percent?: number
}

function generateStatImprovements(
  originalSimResult: SimulationResult,
  originalSim: Simulation,
  benchmark: Simulation,
  simulationForm: Form,
  metadata: SimulationMetadata,
  applyScoringFunction: ScoringFunction,
  scoringParams: ScoringParams,
) {
  const substatUpgradeResults: SimulationStatUpgrade[] = []
  for (const substatType of metadata.substats) {
    const stat: string = substatType
    const originalSimClone: Simulation = TsUtils.clone(originalSim)
    originalSimClone.request.stats[stat] = (originalSimClone.request.stats[stat] ?? 0) + scoringParams.quality

    const statImprovementResult = runSimulations(simulationForm, [originalSimClone], { ...scoringParams, substatRollsModifier: (num: number) => num })[0]
    applyScoringFunction(statImprovementResult)
    substatUpgradeResults.push({
      stat: stat,
      simulation: originalSimClone,
      simulationResult: statImprovementResult,
    })
  }

  // Upgrade Set
  const setUpgradeResults: SimulationStatUpgrade[] = []
  const originalSimClone: Simulation = TsUtils.clone(originalSim)
  originalSimClone.request.simRelicSet1 = benchmark.request.simRelicSet1
  originalSimClone.request.simRelicSet2 = benchmark.request.simRelicSet2
  originalSimClone.request.simOrnamentSet = benchmark.request.simOrnamentSet
  const setUpgradeResult = runSimulations(simulationForm, [originalSimClone], { ...scoringParams, substatRollsModifier: (num: number) => num })[0]
  applyScoringFunction(setUpgradeResult)
  setUpgradeResults.push({
    simulation: originalSimClone,
    simulationResult: setUpgradeResult,
  })

  console.log(originalSimResult, originalSim, metadata, substatUpgradeResults)

  return { substatUpgradeResults, setUpgradeResults }
}

function generateFullDefaultForm(
  characterId: string,
  lightCone: string,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teammate = false,
): Form {
  if (!characterId) return null

  const characterConditionalsRequest = { characterId: characterId, characterEidolon: characterEidolon }
  const lightConeConditionalsRequest = { lightCone: lightCone, eidolon: lightConeSuperimposition }

  const simulationForm: Form = getDefaultForm({ id: characterId })
  simulationForm.characterId = characterId
  simulationForm.characterEidolon = characterEidolon
  simulationForm.lightCone = lightCone
  simulationForm.lightConeSuperimposition = lightConeSuperimposition

  simulationForm.characterConditionals = {}
  simulationForm.lightConeConditionals = {}

  const characterConditionals: Conditional = CharacterConditionals.get(characterConditionalsRequest)
  const lightConeConditionals: Conditional = LightConeConditionals.get(lightConeConditionalsRequest)

  if (teammate) {
    if (characterConditionals.teammateDefaults) Utils.mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.teammateDefaults())
    if (lightConeConditionals.teammateDefaults) Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.teammateDefaults())
  } else {
    if (characterConditionals.defaults) Utils.mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.defaults())
    if (lightConeConditionals.defaults) Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.defaults())
  }

  return simulationForm
}

function computeOptimalSimulation(
  partialSimulationWrapper: PartialSimulationWrapper,
  minSubstatRollCounts: SimulationStats,
  maxSubstatRollCounts: SimulationStats,
  simulationForm: Form,
  applyScoringFunction: ScoringFunction,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
) {
  const breakpoints = metadata.breakpoints
  const goal = scoringParams.substatGoal
  let sum = sumSubstatRolls(maxSubstatRollCounts)
  let currentSimulation: Simulation = partialSimulationWrapper.simulation
  let currentSimulationResult: SimulationResult = undefined

  let breakpointsCap = true
  let speedCap = true
  let simulationRuns = 0

  const sumRequest: number = TsUtils.sumArray(Object.values(currentSimulation.request.stats))
  const sumMin: number = TsUtils.sumArray(Object.values(minSubstatRollCounts))
  if (sumRequest == sumMin || sumRequest < goal) {
    currentSimulation.result = runSimulations(simulationForm, [currentSimulation], { ...scoringParams, substatRollsModifier: scoringParams.substatRollsModifier })[0]
    return currentSimulation
  }

  while (sum > goal) {
    let bestSim: Simulation = undefined
    let bestSimResult: SimulationResult = undefined

    const remainingStats = Object.entries(currentSimulation.request.stats)
      .filter(([key, value]) => value > scoringParams.freeRolls && key != Stats.SPD)
      .map(([key]) => key)

    for (const stat of remainingStats) {
      // Can't reduce further so we skip
      if (currentSimulation.request.stats[stat] <= scoringParams.freeRolls) continue
      if (Utils.sumArray(Object.values(currentSimulation.request.stats)) <= scoringParams.substatGoal) continue
      if (stat == Stats.SPD && speedCap && currentSimulation.request.stats[Stats.SPD] <= partialSimulationWrapper.speedRollsDeduction) continue
      if (currentSimulation.request.stats[stat] <= minSubstatRollCounts[stat]) continue

      // Try reducing this stat
      const newSimulation: Simulation = TsUtils.clone(currentSimulation)
      newSimulation.request.stats[stat] -= 1

      const newSimResult = runSimulations(simulationForm, [newSimulation], { ...scoringParams, substatRollsModifier: scoringParams.substatRollsModifier })[0]
      simulationRuns++

      if (breakpointsCap && breakpoints[stat]) {
        if (newSimResult.x[stat] < breakpoints[stat]) {
          continue
        }
      }

      applyScoringFunction(newSimResult)
      applyScoringFunction(bestSimResult)

      if (!bestSim || newSimResult.simScore > bestSimResult.simScore) {
        bestSim = newSimulation
        bestSimResult = newSimResult
      }
    }

    if (!bestSimResult) {
      // We can't reach the target speed and breakpoints, stop trying to match breakpoints and try again
      if (breakpointsCap) {
        breakpointsCap = false
        continue
      }

      // We still can't reach the target speed and breakpoints, stop trying to match speed and try again
      if (speedCap) {
        speedCap = false
        continue
      }

      // No solution possible, skip
      sum -= 1
      continue
    }

    currentSimulation = bestSim
    currentSimulationResult = bestSimResult
    sum -= 1
  }

  currentSimulation.result = currentSimulationResult

  console.debug(
    'simulationRuns',
    simulationRuns,
    partialSimulationWrapper.simulation.request.simBody,
    partialSimulationWrapper.simulation.request.simFeet,
    partialSimulationWrapper.simulation.request.simLinkRope,
    partialSimulationWrapper.simulation.request.simPlanarSphere,
  )
  return currentSimulation
}

function sumSubstatRolls(maxSubstatRollCounts: SimulationStats) {
  let sum = 0
  for (const stat of SubStats) {
    sum += maxSubstatRollCounts[stat]
  }
  return sum
}

function calculateMinSubstatRollCounts(
  partialSimulationWrapper: PartialSimulationWrapper,
  scoringParams: ScoringParams,
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

function calculateMaxSubstatRollCounts(
  partialSimulationWrapper: PartialSimulationWrapper,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
): SimulationStats {
  const request = partialSimulationWrapper.simulation.request
  const maxCounts = {
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

  for (const substat of metadata.substats) {
    maxCounts[substat] = scoringParams.maxPerSub
  }

  maxCounts[request.simBody] -= scoringParams.deductionPerMain
  maxCounts[request.simFeet] -= scoringParams.deductionPerMain
  maxCounts[request.simPlanarSphere] -= scoringParams.deductionPerMain
  maxCounts[request.simLinkRope] -= scoringParams.deductionPerMain

  // for (const substat of metadata.substats) {
  //   maxCounts[substat] = Math.min(maxCounts[substat], Math.max(0, scoringParams.maxPerSub - Math.ceil(partialSimulationWrapper.speedRollsDeduction)))
  // }

  for (const stat of SubStats) {
    maxCounts[stat] = Math.max(stat == Stats.SPD ? 0 : scoringParams.freeRolls, maxCounts[stat])
    if (metadata.maxBonusRolls?.[stat] != undefined) {
      maxCounts[stat] = Math.min(maxCounts[stat], metadata.maxBonusRolls[stat] + scoringParams.freeRolls)
    }
  }

  if (scoringParams.limitFlatStats) {
    maxCounts[Stats.ATK] = scoringParams.freeRolls
    maxCounts[Stats.HP] = scoringParams.freeRolls
    maxCounts[Stats.DEF] = scoringParams.freeRolls
  }
  maxCounts[Stats.SPD] = partialSimulationWrapper.speedRollsDeduction

  return maxCounts
}

// Generate all main stat possibilities
function generatePartialSimulations(
  metadata: SimulationMetadata,
  relicsByPart: RelicBuild,
  originalBaseSpeed: number,
) {
  const forceSpdBoots = originalBaseSpeed > 140
  const feetParts: string[] = forceSpdBoots ? [Stats.SPD] : metadata.parts[Parts.Feet]

  // Allow equivalent sets
  const { relicSetNames, ornamentSetName } = calculateSetNames(relicsByPart)

  let relicSet1 = metadata.relicSets[0][0]
  let relicSet2 = metadata.relicSets[0][1]
  let ornamentSet = metadata.ornamentSets[0]

  const equivalents: string[][] = metadata.relicSets.map((x: string[]) => x.sort())
  for (const equivalent of equivalents) {
    // Find 4p matches
    if (relicSetNames[0] == equivalent[0] && relicSetNames[1] == equivalent[1]) {
      relicSet1 = equivalent[0]
      relicSet2 = equivalent[1]
      break
    }

    // Find 2p matches
    // A single array will contain all the 2p options
    if (equivalent[0] != equivalent[1]) {
      if (relicSetNames[0] in equivalent && relicSetNames[1] in equivalent) {
        relicSet1 = relicSetNames[0]
        relicSet2 = relicSetNames[1]
        break
      }
    }
  }

  const relicEquivalents = metadata.ornamentSets
  for (const equivalent of relicEquivalents) {
    if (ornamentSetName == equivalent) {
      ornamentSet = equivalent
      break
    }
  }

  const results: PartialSimulationWrapper[] = []
  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of feetParts) {
      for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
        for (const linkRope of metadata.parts[Parts.LinkRope]) {
          const request: SimulationRequest = {
            name: '',
            simRelicSet1: relicSet1,
            simRelicSet2: relicSet2,
            simOrnamentSet: ornamentSet,
            simBody: body,
            simFeet: feet,
            simPlanarSphere: planarSphere,
            simLinkRope: linkRope,
            stats: {
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
            },
          }
          const simulation: Simulation = {
            name: '',
            key: '',
            simType: StatSimTypes.SubstatRolls,
            request: request,
          }
          const partialSimulationWrapper: PartialSimulationWrapper = {
            simulation: simulation,
            finalSpeed: 0,
            speedRollsDeduction: 0,
          }
          results.push(partialSimulationWrapper)
        }
      }
    }
  }

  return results
}

function simulateBaselineCharacter(
  displayRelics: RelicBuild,
  simulationForm: Form,
  scoringParams: ScoringParams,
) {
  const relicsByPart: RelicBuild = TsUtils.clone(displayRelics)
  Object.values(Parts).forEach((x) => relicsByPart[x] = relicsByPart[x] || emptyRelic())
  Object.values(relicsByPart).map((relic: Relic) => {
    // Remove all subs
    relic.substats = []
    if (relic.part == Parts.Head) {
      for (const substat of SubStats) {
        if (substat == Stats.SPD) continue

        relic.substats.push({
          stat: substat,
          value: StatCalculator.getMaxedSubstatValue(substat, scoringParams.quality) * scoringParams.baselineFreeRolls,
        })
      }
    }

    // Simulate useless sets
    if (relic.part == Parts.PlanarSphere || relic.part == Parts.LinkRope) {
      relic.set = Sets.CelestialDifferentiator
    } else {
      relic.set = Sets.GuardOfWutheringSnow
    }
  })

  const { originalSimResult, originalSim } = simulateOriginalCharacter(relicsByPart, simulationForm, scoringParams, 1)
  return {
    baselineSimResult: originalSimResult,
    baselineSim: originalSim,
  }
}

function simulateOriginalCharacter(
  displayRelics: RelicBuild,
  simulationForm: Form,
  scoringParams: ScoringParams,
  mainStatMultiplier = 1,
) {
  const relicsByPart: RelicBuild = TsUtils.clone(displayRelics)
  const { relicSetNames, ornamentSetName } = calculateSetNames(relicsByPart)

  const originalSimRequest = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, scoringParams.quality, scoringParams.speedRollValue)
  const originalSim: Simulation = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: originalSimRequest,
  }
  const originalSimResult = runSimulations(simulationForm, [originalSim], { ...scoringParams, substatRollsModifier: (rolls: number) => rolls, mainStatMultiplier: mainStatMultiplier })[0]
  return {
    originalSimResult,
    originalSim,
  }
}

function calculateSetNames(relicsByPart: RelicBuild) {
  Object.values(Parts).forEach((x) => relicsByPart[x] = relicsByPart[x] || emptyRelic())
  const relicSets = [
    relicsByPart[Parts.Head].set,
    relicsByPart[Parts.Hands].set,
    relicsByPart[Parts.Body].set,
    relicsByPart[Parts.Feet].set,
  ].filter((x) => x != -1)
  const ornamentSets = [
    relicsByPart[Parts.PlanarSphere].set,
    relicsByPart[Parts.LinkRope].set,
  ].filter((x) => x != -1)
  const relicSetNames = calculateRelicSets(relicSets, true)
  const ornamentSetName: string | undefined = calculateOrnamentSets(ornamentSets, true)
  relicSetNames.sort()

  return { relicSetNames, ornamentSetName }
}

export function calculatePenaltyMultiplier(
  simulationResult: SimulationResult,
  breakpoints: { [key: string]: number },
  scoringParams: ScoringParams,
) {
  let newPenaltyMultiplier = 1
  for (const stat of Object.keys(breakpoints)) {
    // Penalize by half of the missing stat breakpoint percentage
    newPenaltyMultiplier *= Math.min(1, 1 - (breakpoints[stat] - simulationResult.x[stat]) / StatCalculator.getMaxedSubstatValue(stat, scoringParams.quality))
  }
  simulationResult.penaltyMultiplier = newPenaltyMultiplier
  return newPenaltyMultiplier
}

// Score on 1.00 scale
export function getSimScoreGrade(score) {
  let best = 'WTF+'
  const percent = TsUtils.precisionRound(score * 100)
  for (const [key, value] of Object.entries(SimScoreGrades)) {
    best = key
    if (percent >= value) {
      return best
    }
  }
  return '???'
}

function simSorter(a: Simulation, b: Simulation) {
  const aResult = a.result
  const bResult = b.result
  return bResult.simScore - aResult.simScore
  // if (aResult.penaltyMultiplier === bResult.penaltyMultiplier) {
  //   return bResult.SIM_SCORE - aResult.SIM_SCORE
  // }
  // return bResult.penaltyMultiplier - aResult.penaltyMultiplier
}

// 1.00 => SSS
// const SimScoreGrades = {
//   'WTF+': 115,
//   'WTF': 110,
//   'SSS+': 105,
//   'SSS': 100,
//   'SS+': 95,
//   'SS': 90,
//   'S+': 85,
//   'S': 80,
//   'A+': 75,
//   'A': 70,
//   'B+': 65,
//   'B': 60,
//   'C+': 55,
//   'C': 50,
//   'D+': 45,
//   'D': 40,
//   'F+': 35,
//   'F': 30,
// }

// 1.00 => SSS, WTF nerf
// const SimScoreGrades = {
//   'WTF+': 130,
//   'WTF': 120,
//   'SSS+': 110,
//   'SSS': 100,
//   'SS+': 95,
//   'SS': 90,
//   'S+': 85,
//   'S': 80,
//   'A+': 75,
//   'A': 70,
//   'B+': 65,
//   'B': 60,
//   'C+': 55,
//   'C': 50,
//   'D+': 45,
//   'D': 40,
//   'F+': 35,
//   'F': 30,
// }

// // 1.00 => SS+
// const SimScoreGrades = {
//   'WTF+': 120,
//   'WTF': 115,
//   'SSS+': 110,
//   'SSS': 105,
//   'SS+': 100,
//   'SS': 95,
//   'S+': 90,
//   'S': 85,
//   'A+': 80,
//   'A': 75,
//   'B+': 70,
//   'B': 65,
//   'C+': 60,
//   'C': 55,
//   'D+': 50,
//   'D': 45,
//   'F+': 40,
//   'F': 35,
// }

// 1.00 => SS
const SimScoreGrades = {
  'WTF+': 125,
  'WTF': 120,
  'SSS+': 115,
  'SSS': 110,
  'SS+': 105,
  'SS': 100,
  'S+': 95,
  'S': 90,
  'A+': 85,
  'A': 80,
  'B+': 75,
  'B': 70,
  'C+': 65,
  'C': 60,
  'D+': 55,
  'D': 50,
  'F+': 45,
  'F': 40,
}

// 1.00 => S+
// const SimScoreGrades = {
//   'WTF+': 130,
//   'WTF': 125,
//   'SSS+': 120,
//   'SSS': 115,
//   'SS+': 110,
//   'SS': 105,
//   'S+': 100,
//   'S': 95,
//   'A+': 90,
//   'A': 85,
//   'B+': 80,
//   'B': 75,
//   'C+': 70,
//   'C': 65,
//   'D+': 60,
//   'D': 55,
//   'F+': 50,
//   'F': 45,
// }

// 1.00 => S
// const SimScoreGrades = {
//   'WTF+': 135,
//   'WTF': 130,
//   'SSS+': 125,
//   'SSS': 120,
//   'SS+': 115,
//   'SS': 110,
//   'S+': 105,
//   'S': 100,
//   'A+': 95,
//   'A': 90,
//   'B+': 85,
//   'B': 80,
//   'C+': 75,
//   'C': 70,
//   'D+': 65,
//   'D': 60,
//   'F+': 55,
//   'F': 50,
// }
