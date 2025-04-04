import { Constants, CUSTOM_TEAM, Parts, Sets, Stats, SubStats } from 'lib/constants/constants'
import { Key } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { generateFullDefaultForm, generatePartialSimulations, generateStatImprovements, simulateBaselineCharacter, simulateOriginalCharacter } from 'lib/scoring/characterScorer'
import { calculateMaxSubstatRollCounts, calculateMinSubstatRollCounts } from 'lib/scoring/rollCounter'
import {
  benchmarkScoringParams,
  cloneRelicsFillEmptySlots,
  invertDiminishingReturnsSpdFormula,
  originalScoringParams,
  RelicBuild,
  ScoringFunction,
  simSorter,
  SimulationFlags,
  SimulationResult,
  SimulationScore,
  spdRollsCap,
} from 'lib/scoring/simScoringUtils'
import { simulateMaximumBuild } from 'lib/scoring/simulateMaximum'
import { runStatSimulations } from 'lib/simulations/new/statSimulation'
import { transformWorkerContext } from 'lib/simulations/new/workerContextTransform'
import { runComputeOptimalSimulationWorker } from 'lib/simulations/new/workerPool'
import { Simulation } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import { calculatePenaltyMultiplier } from 'lib/worker/computeOptimalSimulationWorker'
import { ComputeOptimalSimulationRunnerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { Character } from 'types/character'
import { Form } from 'types/form'
import { ScoringMetadata, ShowcaseTemporaryOptions, SimulationMetadata } from 'types/metadata'

const cachedSims: {
  [key: string]: SimulationScore
} = {}

export async function scoreCharacterSimulation(
  character: Character,
  displayRelics: RelicBuild,
  teamSelection: string,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
  defaultScoringMetadata: ScoringMetadata,
  customScoringMetadata: ScoringMetadata,
) {
  const originalForm = character.form
  const characterId = originalForm.characterId
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  if (!defaultScoringMetadata?.simulation) {
    console.log('No scoring sim defined for this character')
    return null
  }

  if (!characterId || !originalForm) {
    console.log('Invalid character sim setup')
    return null
  }

  const metadata: SimulationMetadata = TsUtils.clone(defaultScoringMetadata.simulation)
  const customMetadata: SimulationMetadata = TsUtils.clone(customScoringMetadata.simulation!)
  const traces = customScoringMetadata.traces
  const deprioritizeBuffs = customMetadata.deprioritizeBuffs ?? false

  if (teamSelection == CUSTOM_TEAM) {
    metadata.teammates = customMetadata.teammates
  }

  const relicsByPart = cloneRelicsFillEmptySlots(displayRelics)

  const cacheKey = TsUtils.objectHash({
    traces,
    characterId,
    characterEidolon,
    lightCone,
    lightConeSuperimposition,
    relicsByPart,
    metadata,
    customMetadata,
    showcaseTemporaryOptions,
  })

  if (cachedSims[cacheKey]) {
    return cachedSims[cacheKey]
  }

  const simulationFlags: SimulationFlags = {
    addBreakEffect: false,
    overcapCritRate: false,
    simPoetActive: false,
    characterPoetActive: false,
    forceBasicSpd: true,
    forceBasicSpdValue: 0,
  }

  // Optimize requested stats

  const substats: string[] = metadata.substats

  // Special handling for break effect carries
  if (metadata.comboBreak > 0) {
    // Add break if the combo uses it
    simulationFlags.addBreakEffect = true
  }
  if (metadata.teammates.find((x) => x.characterId == '8005' || x.characterId == '8006' || x.characterId == '1225')) {
    // Add break if the harmony trailblazer | fugue is on the team
    simulationFlags.addBreakEffect = true
  }
  if (simulationFlags.addBreakEffect && !substats.includes(Stats.BE)) {
    substats.push(Stats.BE)
  }
  if (simulationFlags.addBreakEffect && !metadata.parts[Parts.LinkRope].includes(Stats.BE)) {
    metadata.parts[Parts.LinkRope].push(Stats.BE)
  }
  if (simulationFlags.addBreakEffect
    && !metadata.relicSets.find((sets) =>
      sets[0] == sets[1] && sets[1] == Sets.IronCavalryAgainstTheScourge)) {
    metadata.relicSets.push([Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge])
  }
  if (simulationFlags.addBreakEffect
    && !metadata.relicSets.find((sets) =>
      sets[0] == sets[1] && sets[1] == Sets.IronCavalryAgainstTheScourge)) {
    metadata.relicSets.push([Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge])
  }
  if (simulationFlags.addBreakEffect
    && !metadata.ornamentSets.find((set) => set == Sets.TaliaKingdomOfBanditry)) {
    metadata.ornamentSets.push(Sets.TaliaKingdomOfBanditry)
  }
  if (simulationFlags.addBreakEffect
    && !metadata.ornamentSets.find((set) => set == Sets.ForgeOfTheKalpagniLantern)) {
    metadata.ornamentSets.push(Sets.ForgeOfTheKalpagniLantern)
  }
  if (metadata.teammates.find((x) => x.characterId == '1313' && x.characterEidolon == 6)) {
    simulationFlags.overcapCritRate = true
  }

  // Get the simulation sets

  const simulationSets = calculateSimSets(metadata, relicsByPart)

  if (relicsByPart.Head.set == Sets.PoetOfMourningCollapse
    && relicsByPart.Hands.set == Sets.PoetOfMourningCollapse
    && relicsByPart.Body.set == Sets.PoetOfMourningCollapse
    && relicsByPart.Feet.set == Sets.PoetOfMourningCollapse
  ) {
    simulationFlags.characterPoetActive = true
  }

  if (simulationSets.relicSet1 == Sets.PoetOfMourningCollapse && simulationSets.relicSet2 == Sets.PoetOfMourningCollapse) {
    simulationFlags.simPoetActive = true
  }

  // Set up default request

  const simulationForm: Form = generateFullDefaultForm(characterId, lightCone, characterEidolon, lightConeSuperimposition, false)
  const simulationFormT0 = generateFullDefaultForm(metadata.teammates[0].characterId,
    metadata.teammates[0].lightCone,
    metadata.teammates[0].characterEidolon,
    metadata.teammates[0].lightConeSuperimposition,
    true)
  const simulationFormT1 = generateFullDefaultForm(metadata.teammates[1].characterId,
    metadata.teammates[1].lightCone,
    metadata.teammates[1].characterEidolon,
    metadata.teammates[1].lightConeSuperimposition,
    true)
  const simulationFormT2 = generateFullDefaultForm(metadata.teammates[2].characterId,
    metadata.teammates[2].lightCone,
    metadata.teammates[2].characterEidolon,
    metadata.teammates[2].lightConeSuperimposition,
    true)
  simulationForm.teammate0 = simulationFormT0
  simulationForm.teammate1 = simulationFormT1
  simulationForm.teammate2 = simulationFormT2

  simulationForm.deprioritizeBuffs = deprioritizeBuffs

  // Cache context for reuse

  const context = generateContext(simulationForm)
  transformWorkerContext(context)

  // Kick off workers here

  // Generate scoring function

  const applyScoringFunction: ScoringFunction = (result: SimulationResult, penalty = true) => {
    if (!result) return

    const unpenalizedSimScore = result.xa[Key.COMBO_DMG]
    const penaltyMultiplier = calculatePenaltyMultiplier(result, metadata, benchmarkScoringParams)
    result.simScore = unpenalizedSimScore * (penalty ? penaltyMultiplier : 1)
  }
  //
  // // ===== Simulate the original build =====
  //
  let {
    originalSimResult,
    originalSim,
  } = simulateOriginalCharacter(relicsByPart, simulationSets, simulationForm, context, originalScoringParams, simulationFlags)

  const originalSpd = TsUtils.precisionRound(originalSimResult.ca[Key.SPD], 3)

  // // ===== Simulate the baseline build =====

  const { baselineSimResult, baselineSim } = simulateBaselineCharacter(
    relicsByPart,
    simulationForm,
    context,
    simulationSets,
    benchmarkScoringParams,
    simulationFlags,
  )
  applyScoringFunction(baselineSimResult)
  //
  // // Special handling for poet - force the spd to certain thresholds when poet is active
  //
  const spdBenchmark = showcaseTemporaryOptions.spdBenchmark != null
    ? Math.max(baselineSimResult[Stats.SPD], showcaseTemporaryOptions.spdBenchmark)
    : null

  if (simulationFlags.simPoetActive) {
    // When the sim has poet, use the lowest possible poet SPD breakpoint for benchmarks - though match the custom benchmark spd within the breakpoint range
    if (baselineSimResult[Stats.SPD] < 95) {
      simulationFlags.forceBasicSpdValue = Math.min(originalSpd, 94.999, spdBenchmark ?? 94.999)
    } else if (baselineSimResult[Stats.SPD] < 110) {
      simulationFlags.forceBasicSpdValue = Math.min(originalSpd, 109.999, spdBenchmark ?? 109.999)
    } else {
      // No-op
    }
  } else {
    // When the sim does not have poet, force the original spd and proceed as regular
    simulationFlags.forceBasicSpdValue = Math.min(spdBenchmark ?? originalSpd, originalSpd)
  }
  //
  // // ===== Simulate the forced spd build =====
  //
  const {
    originalSimResult: forcedSpdSimResult,
    originalSim: forcedSpdSim,
  } = simulateOriginalCharacter(relicsByPart, simulationSets, simulationForm, context, originalScoringParams, simulationFlags)
  //
  // // ===== Calculate the benchmarks' speed target =====
  //
  let targetSpd: number
  if (simulationFlags.characterPoetActive) {
    // When the original character has poet, benchmark against the original character
    targetSpd = forcedSpdSimResult.xa[Key.SPD]
  } else {
    if (simulationFlags.simPoetActive) {
      // We don't want to have the original character's combat stats penalized by poet if they're not on poet
      targetSpd = simulationFlags.forceBasicSpdValue
    } else {
      originalSimResult = forcedSpdSimResult
      originalSim = forcedSpdSim
      targetSpd = originalSimResult.xa[Key.SPD]
    }
  }
  //
  applyScoringFunction(originalSimResult)
  //
  // // Generate partials to calculate speed rolls
  //
  const partialSimulationWrappers = generatePartialSimulations(character, metadata, simulationSets, originalSim)
  const candidateBenchmarkSims: Simulation[] = []

  const clonedContext = TsUtils.clone(context)

  console.time('!!!!!!!!!!!!!!!!! runner')
  const runnerPromises = partialSimulationWrappers.map((partialSimulationWrapper) => {
    // const simulationResult = runSimulations(simulationForm, context, [partialSimulationWrapper.simulation], benchmarkScoringParams)[0]
    const simulationResults = runStatSimulations([partialSimulationWrapper.simulation], simulationForm, context)
    const simulationResult = simulationResults[0]

    // Find the speed deduction
    const finalSpeed = simulationResult.xa[Key.SPD]
    partialSimulationWrapper.finalSpeed = finalSpeed

    const mainsCount = partialSimulationWrapper.simulation.request.simFeet == Stats.SPD ? 1 : 0
    const rolls = TsUtils.precisionRound(invertDiminishingReturnsSpdFormula(mainsCount, targetSpd - finalSpeed, benchmarkScoringParams.speedRollValue), 3)

    partialSimulationWrapper.speedRollsDeduction = Math.min(Math.max(0, rolls), spdRollsCap(partialSimulationWrapper.simulation, benchmarkScoringParams))

    if (partialSimulationWrapper.speedRollsDeduction >= 26 && partialSimulationWrapper.simulation.request.simFeet != Stats.SPD) {
      console.log('Rejected candidate sim with non SPD boots')
      return null
    }

    // Define min/max limits
    const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, benchmarkScoringParams, simulationFlags)
    const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, benchmarkScoringParams, baselineSimResult, simulationFlags)

    // Start the sim search at the max then iterate downwards
    Object.values(SubStats).map((stat) => partialSimulationWrapper.simulation.request.stats[stat] = maxSubstatRollCounts[stat])

    const input: ComputeOptimalSimulationRunnerInput = {
      partialSimulationWrapper: partialSimulationWrapper,
      inputMinSubstatRollCounts: minSubstatRollCounts,
      inputMaxSubstatRollCounts: maxSubstatRollCounts,
      simulationForm: simulationForm,
      context: clonedContext,
      metadata: metadata,
      scoringParams: TsUtils.clone(benchmarkScoringParams),
      simulationFlags: simulationFlags,
    }

    return runComputeOptimalSimulationWorker(input)
  })

  const runnerOutputs = await Promise.all(runnerPromises)
  console.timeEnd('!!!!!!!!!!!!!!!!! runner')
  runnerOutputs.forEach((runnerOutput, index) => {
    if (!runnerOutput) return

    const candidateBenchmarkSim = runnerOutput.simulation

    // DEBUG
    // candidateBenchmarkSim.key = JSON.stringify(candidateBenchmarkSim.request)
    // candidateBenchmarkSim.name = ''

    if (!candidateBenchmarkSim || partialSimulationWrappers[index].simulation.request.stats[Stats.SPD] > 26 && partialSimulationWrappers[index].simulation.request.simFeet != Stats.SPD) {
      // Reject non speed boot builds that exceed the speed cap. 48 - 11 * 2 = 26 max subs that can go in to SPD
      console.log('Rejected candidate sim')
    } else {
      candidateBenchmarkSims.push(candidateBenchmarkSim)
    }
  })

  console.log(candidateBenchmarkSims)
  //
  // // Try to minimize the penalty modifier before optimizing sim score
  //
  candidateBenchmarkSims.sort(simSorter)
  const benchmarkSim = candidateBenchmarkSims[0]
  const benchmarkSimResult = benchmarkSim.result
  //
  // // console.log('bestSims', candidateBenchmarkSims)
  //
  // // ===== Calculate the maximum build =====
  //
  const maximumSim = await simulateMaximumBuild(
    benchmarkSim,
    targetSpd,
    metadata,
    simulationForm,
    context,
    applyScoringFunction,
    baselineSimResult,
    originalSimResult,
    simulationFlags,
  )
  const maximumSimResult = maximumSim.result!
  applyScoringFunction(maximumSimResult)

  console.log('max', maximumSim)

  // ===== Calculate percentage values =====

  const benchmarkSimScore = benchmarkSimResult.simScore
  const originalSimScore = originalSimResult.simScore
  const baselineSimScore = baselineSimResult.simScore
  const maximumSimScore = maximumSimResult.simScore

  const percent = originalSimScore >= benchmarkSimScore
    ? 1 + (originalSimScore - benchmarkSimScore) / (maximumSimScore - benchmarkSimScore)
    : (originalSimScore - baselineSimScore) / (benchmarkSimScore - baselineSimScore)

  // ===== Calculate upgrades =====

  const { substatUpgradeResults, setUpgradeResults, mainUpgradeResults } = generateStatImprovements(
    originalSimResult,
    originalSim, candidateBenchmarkSims[0],
    simulationForm,
    context,
    metadata,
    applyScoringFunction,
    benchmarkScoringParams,
  )
  //
  for (const upgrade of [...substatUpgradeResults, ...setUpgradeResults, ...mainUpgradeResults]) {
    const upgradeSimScore = upgrade.simulationResult.simScore
    const percent = upgradeSimScore >= benchmarkSimScore
      ? 1 + (upgradeSimScore - benchmarkSimScore) / (maximumSimScore - benchmarkSimScore)
      : (upgradeSimScore - baselineSimScore) / (benchmarkSimScore - baselineSimScore)
    upgrade.percent = percent
  }

  // Sort upgrades descending
  substatUpgradeResults.sort((a, b) => b.percent! - a.percent!)
  setUpgradeResults.sort((a, b) => b.percent! - a.percent!)
  mainUpgradeResults.sort((a, b) => b.percent! - a.percent!)

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
    mainUpgrades: mainUpgradeResults,

    simulationForm: simulationForm,
    simulationMetadata: metadata,
    // characterMetadata: metadata,

    originalSpd: originalSpd,
    spdBenchmark: spdBenchmark,
    simulationFlags: simulationFlags,
  }

  cachedSims[cacheKey] = simScoringResult

  // console.log('simScoringResult', simScoringResult)

  return simScoringResult
}

type SimulationSets = {
  relicSet1: string
  relicSet2: string
  ornamentSet: string
}

function calculateSimSets(metadata: SimulationMetadata, relicsByPart: RelicBuild): SimulationSets {
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
      if (equivalent.includes(relicSetNames[0]) && equivalent.includes(relicSetNames[1])) {
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

  return { relicSet1, relicSet2, ornamentSet }
}

export function calculateSetNames(relicsByPart: RelicBuild) {
  Object.values(Parts).forEach((x) => relicsByPart[x] = relicsByPart[x] || emptyRelicWithSetAndSubstats())
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

export function calculateRelicSets(relicSets: (string | number)[], nameProvided = false) {
  const relicSetNames: string[] = []
  while (relicSets.length > 0) {
    const value = relicSets[0]
    if (relicSets.lastIndexOf(value)) {
      const setName = nameProvided ? value : Object.entries(Constants.RelicSetToIndex).find((x) => x[1] == value)![0]
      relicSetNames.push(setName as string)

      const otherIndex = relicSets.lastIndexOf(value)
      relicSets.splice(otherIndex, 1)
    }
    relicSets.splice(0, 1)
  }

  return relicSetNames
}

export function calculateOrnamentSets(ornamentSets: unknown[], nameProvided = true): string | undefined {
  if (ornamentSets[0] != null && ornamentSets[0] == ornamentSets[1]) {
    return (
      nameProvided
        ? ornamentSets[1] as string
        : Object.entries(Constants.OrnamentSetToIndex).find((x) => x[1] == ornamentSets[1])![0]
    )
  }
  return undefined
}

function emptyRelicWithSetAndSubstats() {
  return {
    set: -1,
    substats: [],
  }
}


