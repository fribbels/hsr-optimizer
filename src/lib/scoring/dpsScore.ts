import { Constants, CUSTOM_TEAM, Parts, Sets, Stats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Key } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { benchmarkScoringParams, cloneRelicsFillEmptySlots, originalScoringParams, RelicBuild, ScoringFunction, SimulationFlags, SimulationResult, SimulationScore } from 'lib/scoring/simScoringUtils'
import { simulateBaselineBuild } from 'lib/simulations/new/benchmarks/simulateBaselineBuild'
import { simulateBenchmarkBuild } from 'lib/simulations/new/benchmarks/simulateBenchmarkBuild'
import { simulateOriginalBuild } from 'lib/simulations/new/benchmarks/simulateOriginalBuild'

import { simulatePerfectBuild } from 'lib/simulations/new/benchmarks/simulatePerfectBuild'
import { runOrchestrator } from 'lib/simulations/new/orchestrator/DpsScoreBenchmarkOrchestrator'
import { generateStatImprovements } from 'lib/simulations/new/scoringUpgrades'
import { generateFullDefaultForm } from 'lib/simulations/new/utils/benchmarkForm'
import { applySpeedFlags, calculateTargetSpeed } from 'lib/simulations/new/utils/benchmarkSpeedTargets'
import { transformWorkerContext } from 'lib/simulations/new/workerContextTransform'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { calculatePenaltyMultiplier } from 'lib/worker/computeOptimalSimulationWorker'
import { Character } from 'types/character'
import { Form } from 'types/form'
import { ScoringMetadata, ShowcaseTemporaryOptions, SimulationMetadata } from 'types/metadata'

const cachedSims: {
  [key: string]: SimulationScore
} = {}

export type AsyncSimScoringExecution = {
  done: boolean
  result: SimulationScore | null
  promise: Promise<SimulationScore | null>
}

export function getShowcaseSimScoringExecution(
  character: Character,
  displayRelics: RelicBuild,
  teamSelection: string,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions = {},
): AsyncSimScoringExecution {
  console.log('Start async')

  const asyncResult: AsyncSimScoringExecution = {
    done: false,
    result: null,
    promise: null as any,
  }

  async function runSimulation() {
    console.log('Executing async operation')

    try {
      const characterMetadata = DB.getMetadata().characters[character.id]

      const relics = displayRelics as SingleRelicByPart
      const simulationScore = await runOrchestrator(character, teamSelection, relics, showcaseTemporaryOptions)

      if (!simulationScore) return null

      console.log('DONE', simulationScore)

      simulationScore.characterMetadata = characterMetadata

      asyncResult.result = simulationScore
      asyncResult.done = true

      return simulationScore
    } catch (error) {
      console.error('Error in simulation:', error)
      asyncResult.done = true
      throw error
    }
  }

  asyncResult.promise = runSimulation()

  console.log('Return async')
  return asyncResult
}

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

  const simulationSets = calculateSimSetsFromRelics(metadata, relicsByPart)

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

  // Generate scoring function

  // Using this on a worker output is dangerous as only simScore is reliable, x may have changed
  const applyScoringFunction: ScoringFunction = (result: SimulationResult, penalty = true) => {
    if (!result) return

    const unpenalizedSimScore = result.xa[Key.COMBO_DMG]
    const penaltyMultiplier = calculatePenaltyMultiplier(result, metadata, benchmarkScoringParams)
    result.simScore = unpenalizedSimScore * (penalty ? penaltyMultiplier : 1)
  }

  // ===== Simulate the original build =====

  let {
    originalSimResult,
    originalSim,
  } = simulateOriginalBuild(relicsByPart, simulationSets, simulationForm, context, originalScoringParams, simulationFlags)

  const originalSpd = TsUtils.precisionRound(originalSimResult.ca[Key.SPD], 3)

  // ===== Simulate the baseline build =====

  const { baselineSimResult, baselineSim } = simulateBaselineBuild(
    relicsByPart,
    simulationForm,
    context,
    simulationSets,
    benchmarkScoringParams,
    simulationFlags,
  )
  applyScoringFunction(baselineSimResult)

  const spdBenchmark = showcaseTemporaryOptions.spdBenchmark != null
    ? Math.max(baselineSimResult[Stats.SPD], showcaseTemporaryOptions.spdBenchmark)
    : undefined

  applySpeedFlags(
    simulationFlags,
    baselineSimResult,
    originalSpd,
    spdBenchmark,
  )

  // ===== Simulate the forced spd build =====

  const {
    originalSimResult: forcedSpdSimResult,
    originalSim: forcedSpdSim,
  } = simulateOriginalBuild(relicsByPart, simulationSets, simulationForm, context, originalScoringParams, simulationFlags)

  // ===== Calculate the benchmarks' speed target =====

  const targetSpeedResults = calculateTargetSpeed(
    originalSim,
    originalSimResult,
    forcedSpdSim,
    forcedSpdSimResult,
    simulationFlags,
  )
  const targetSpd = targetSpeedResults.targetSpd
  originalSimResult = targetSpeedResults.originalSimResult
  originalSim = targetSpeedResults.originalSim

  //
  applyScoringFunction(originalSimResult)

  // ===== Calculate the benchmark build =====

  const benchmarkSim = await simulateBenchmarkBuild(
    character,
    simulationSets,
    originalSim,
    targetSpd,
    metadata,
    simulationForm,
    context,
    baselineSimResult,
    originalSimResult,
    simulationFlags,
  )
  const benchmarkSimResult = benchmarkSim.result!

  // ===== Calculate the maximum build =====

  const maximumSim = await simulatePerfectBuild(
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
    originalSim, benchmarkSim,
    simulationForm,
    context,
    metadata,
    applyScoringFunction,
    benchmarkScoringParams,
    baselineSimScore,
    benchmarkSimScore,
    maximumSimScore,
  )

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

export type SimulationSets = {
  relicSet1: string
  relicSet2: string
  ornamentSet: string
}

function calculateSimSetsFromRelics(metadata: SimulationMetadata, relicsByPart: RelicBuild): SimulationSets {
  // Allow equivalent sets
  const { relicSetNames, ornamentSetName } = calculateSetNames(relicsByPart)

  return calculateSimSets(relicSetNames[0], relicSetNames[1], ornamentSetName!, metadata)
}

export function calculateSimSets(relicSetName0: string, relicSetName1: string, ornamentSetName: string, metadata: SimulationMetadata): SimulationSets {
  // Allow equivalent sets
  let relicSet1 = metadata.relicSets[0][0]
  let relicSet2 = metadata.relicSets[0][1]
  let ornamentSet = metadata.ornamentSets[0]

  const equivalents: string[][] = metadata.relicSets.map((x: string[]) => x.sort())
  for (const equivalent of equivalents) {
    // Find 4p matches
    if (relicSetName0 == equivalent[0] && relicSetName1 == equivalent[1]) {
      relicSet1 = equivalent[0]
      relicSet2 = equivalent[1]
      break
    }

    // Find 2p matches
    // A single array will contain all the 2p options
    if (equivalent[0] != equivalent[1]) {
      if (equivalent.includes(relicSetName0) && equivalent.includes(relicSetName1)) {
        relicSet1 = relicSetName0
        relicSet2 = relicSetName1
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
    // @ts-ignore
  ].filter((x) => x != -1)
  const ornamentSets = [
    relicsByPart[Parts.PlanarSphere].set,
    relicsByPart[Parts.LinkRope].set,
    // @ts-ignore
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

// Gradual scale
export const SimScoreGrades = {
  'AEON': 150, // Verified only
  'WTF+': 140, // +10
  'WTF': 130, // +9
  'SSS+': 121, // +8
  'SSS': 113, // +7
  'SS+': 106, // +6
  'SS': 100, // Benchmark
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

// Score on 1.00 scale
export function getSimScoreGrade(score: number, verified: boolean, numRelics: number, lightCone: boolean = true) {
  if (numRelics != 6 || !lightCone) {
    return '?'
  }

  let best = 'WTF+'
  const percent = TsUtils.precisionRound(score * 100)
  for (const [key, value] of Object.entries(SimScoreGrades)) {
    if (key == 'AEON' && !verified) {
      continue
    }
    best = key
    if (percent >= value) {
      return best
    }
  }
  return '?'
}
