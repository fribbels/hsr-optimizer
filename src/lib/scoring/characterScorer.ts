import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { CUSTOM_TEAM, MainStatParts, Parts, Sets, Stats, SubStats } from 'lib/constants/constants'
import { emptyRelicWithSetAndSubstats } from 'lib/optimization/calculateBuild'
import { Key, StatToKey } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { StatCalculator } from 'lib/relics/statCalculator'
import { calculateMaxSubstatRollCounts, calculateMinSubstatRollCounts } from 'lib/scoring/rollCounter'
import {
  benchmarkScoringParams,
  cloneRelicsFillEmptySlots,
  invertDiminishingReturnsSpdFormula,
  originalScoringParams,
  PartialSimulationWrapper,
  RelicBuild,
  ScoringFunction,
  ScoringParams,
  simSorter,
  SimulationFlags,
  SimulationResult,
  SimulationScore,
  spdRollsCap,
} from 'lib/scoring/simScoringUtils'
import { simulateMaximumBuild } from 'lib/scoring/simulateMaximum'
import { calculateOrnamentSets, calculateRelicSets, convertRelicsToSimulation, runSimulations, Simulation, SimulationRequest, SimulationStats } from 'lib/simulations/statSimulationController'
import DB from 'lib/state/db'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { Character } from 'types/character'
import { CharacterConditionalsController, LightConeConditionalsController } from 'types/conditionals'
import { Form } from 'types/form'
import { ScoringMetadata, ShowcaseTemporaryOptions, SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'
import { Relic } from 'types/relic'

// FIXME HIGH

const cachedSims: {
  [key: string]: SimulationScore
} = {}

export function scoreCharacterSimulation(
  character: Character,
  displayRelics: RelicBuild,
  teamSelection: string,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): SimulationScore | null {
  const originalForm = character.form
  const characterId = originalForm.characterId
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  const characterMetadata = DB.getMetadata().characters[characterId]
  if (!characterMetadata?.scoringMetadata.simulation) {
    console.log('No scoring sim defined for this character')
    return null
  }

  if (!characterId || !originalForm) {
    console.log('Invalid character sim setup')
    return null
  }

  const defaultScoringMetadata: ScoringMetadata = characterMetadata.scoringMetadata
  const customScoringMetadata: ScoringMetadata = DB.getScoringMetadata(characterId)
  const metadata: SimulationMetadata = TsUtils.clone(defaultScoringMetadata.simulation!)
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

  // Generate scoring function

  const applyScoringFunction: ScoringFunction = (result: SimulationResult, penalty = true) => {
    if (!result) return

    result.unpenalizedSimScore = result.xa[Key.COMBO_DMG]
    result.penaltyMultiplier = calculatePenaltyMultiplier(result, metadata, benchmarkScoringParams)
    result.simScore = result.unpenalizedSimScore * (penalty ? result.penaltyMultiplier : 1)
  }

  // ===== Simulate the original build =====

  let {
    originalSimResult,
    originalSim,
  } = simulateOriginalCharacter(relicsByPart, simulationSets, simulationForm, context, originalScoringParams, simulationFlags)

  const originalSpd = TsUtils.precisionRound(originalSimResult.ca[Key.SPD])

  // ===== Simulate the baseline build =====

  const { baselineSimResult, baselineSim } = simulateBaselineCharacter(
    relicsByPart,
    simulationForm,
    context,
    simulationSets,
    benchmarkScoringParams,
    simulationFlags,
  )
  applyScoringFunction(baselineSimResult)

  // Special handling for poet - force the spd to certain thresholds when poet is active

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

  // ===== Simulate the forced spd build =====

  const {
    originalSimResult: forcedSpdSimResult,
    originalSim: forcedSpdSim,
  } = simulateOriginalCharacter(relicsByPart, simulationSets, simulationForm, context, originalScoringParams, simulationFlags)

  // ===== Calculate the benchmarks' speed target =====

  let targetSpd: number
  if (simulationFlags.characterPoetActive) {
    // When the original character has poet, benchmark against the original character
    targetSpd = forcedSpdSimResult.xa[Key.SPD]
  } else {
    if (simulationFlags.simPoetActive) {
      // We don't want to have the original character's combat stats penalized by poet if they're not on poet
    } else {
      originalSimResult = forcedSpdSimResult
      originalSim = forcedSpdSim
    }
    targetSpd = originalSimResult.xa[Key.SPD]
  }

  applyScoringFunction(originalSimResult)

  // Generate partials to calculate speed rolls

  const partialSimulationWrappers = generatePartialSimulations(character, metadata, simulationSets, originalSim)
  const candidateBenchmarkSims: Simulation[] = []

  // Run benchmark sims
  for (const partialSimulationWrapper of partialSimulationWrappers) {
    const simulationResult = runSimulations(simulationForm, context, [partialSimulationWrapper.simulation], benchmarkScoringParams)[0]

    // Find the speed deduction
    const finalSpeed = simulationResult.xa[Key.SPD]
    partialSimulationWrapper.finalSpeed = finalSpeed

    const mainsCount = partialSimulationWrapper.simulation.request.simFeet == Stats.SPD ? 1 : 0
    const rolls = TsUtils.precisionRound(invertDiminishingReturnsSpdFormula(mainsCount, targetSpd - finalSpeed, benchmarkScoringParams.speedRollValue), 3)

    partialSimulationWrapper.speedRollsDeduction = Math.min(Math.max(0, rolls), spdRollsCap(partialSimulationWrapper.simulation, benchmarkScoringParams))

    if (partialSimulationWrapper.speedRollsDeduction >= 26 && partialSimulationWrapper.simulation.request.simFeet != Stats.SPD) {
      console.log('Rejected candidate sim with non SPD boots')
      continue
    }

    // Define min/max limits
    const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, benchmarkScoringParams, simulationFlags)
    const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, benchmarkScoringParams, baselineSimResult, simulationFlags)

    // Start the sim search at the max then iterate downwards
    Object.values(SubStats).map((stat) => partialSimulationWrapper.simulation.request.stats[stat] = maxSubstatRollCounts[stat])

    const candidateBenchmarkSim = computeOptimalSimulation(
      partialSimulationWrapper,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      simulationForm,
      context,
      applyScoringFunction,
      metadata,
      benchmarkScoringParams,
      simulationFlags,
    )
    applyScoringFunction(candidateBenchmarkSim.result)

    // DEBUG
    candidateBenchmarkSim.key = JSON.stringify(candidateBenchmarkSim.request)
    candidateBenchmarkSim.name = ''

    if (partialSimulationWrapper.simulation.request.stats[Stats.SPD] > 26 && partialSimulationWrapper.simulation.request.simFeet != Stats.SPD) {
      // Reject non speed boot builds that exceed the speed cap. 48 - 11 * 2 = 26 max subs that can go in to SPD
      console.log('Rejected candidate sim')
    } else {
      candidateBenchmarkSims.push(candidateBenchmarkSim)
    }
  }

  // Try to minimize the penalty modifier before optimizing sim score

  candidateBenchmarkSims.sort(simSorter)
  const benchmarkSim = candidateBenchmarkSims[0]
  const benchmarkSimResult = benchmarkSim.result

  // console.log('bestSims', candidateBenchmarkSims)

  // ===== Calculate the maximum build =====

  const maximumSim = simulateMaximumBuild(
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
  const maximumSimResult = maximumSim.result
  applyScoringFunction(maximumSimResult)

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
    characterMetadata: characterMetadata,

    originalSpd: originalSpd,
    spdBenchmark: spdBenchmark,
    simulationFlags: simulationFlags,
  }

  cachedSims[cacheKey] = simScoringResult

  // console.log('simScoringResult', simScoringResult)

  return simScoringResult
}

export type SimulationStatUpgrade = {
  simulation: Simulation
  simulationResult: SimulationResult
  part?: string
  stat?: string
  percent?: number
}

function generateStatImprovements(
  originalSimResult: SimulationResult,
  originalSim: Simulation,
  benchmark: Simulation,
  simulationForm: Form,
  context: OptimizerContext,
  metadata: SimulationMetadata,
  applyScoringFunction: ScoringFunction,
  scoringParams: ScoringParams,
) {
  const substatUpgradeResults: SimulationStatUpgrade[] = []
  for (const substatType of metadata.substats) {
    const stat: string = substatType
    const originalSimClone: Simulation = TsUtils.clone(originalSim)
    originalSimClone.request.stats[stat] = (originalSimClone.request.stats[stat] ?? 0) + 1.0

    const statImprovementResult = runSimulations(simulationForm, context, [originalSimClone], {
      ...scoringParams,
      substatRollsModifier: (num: number) => num,
    })[0]
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

  const setUpgradeResult = runSimulations(simulationForm, context, [originalSimClone], {
    ...scoringParams,
    substatRollsModifier: (num: number) => num,
  })[0]
  applyScoringFunction(setUpgradeResult)
  setUpgradeResults.push({
    simulation: originalSimClone,
    simulationResult: setUpgradeResult,
  })

  // Upgrade mains
  const mainUpgradeResults: SimulationStatUpgrade[] = []

  const forceErrRope = isErrRopeForced(simulationForm, metadata, originalSim)

  function upgradeMain(part: MainStatParts) {
    for (const upgradeMainStat of metadata.parts[part]) {
      const originalSimClone: Simulation = TsUtils.clone(originalSim)
      const simMainName = partsToFilterMapping[part]
      const simMainStat: string = originalSimClone.request[simMainName]
      if (forceErrRope && simMainStat == Stats.ERR) continue
      if (upgradeMainStat == simMainStat) continue
      if (upgradeMainStat == Stats.SPD) continue
      if (simMainStat == Stats.SPD) continue

      originalSimClone.request[simMainName] = upgradeMainStat
      const mainUpgradeResult = runSimulations(simulationForm, context, [originalSimClone], {
        ...scoringParams,
        substatRollsModifier: (num: number) => num,
      })[0]
      applyScoringFunction(mainUpgradeResult)
      const simulationStatUpgrade = {
        stat: upgradeMainStat,
        part: part,
        simulation: originalSimClone,
        simulationResult: mainUpgradeResult,
      }
      mainUpgradeResults.push(simulationStatUpgrade)
    }
  }

  upgradeMain(Parts.Body)
  upgradeMain(Parts.Feet)
  upgradeMain(Parts.PlanarSphere)
  upgradeMain(Parts.LinkRope)

  // console.log('Stat improvements', mainUpgradeResults)

  return { substatUpgradeResults, setUpgradeResults, mainUpgradeResults }
}

const partsToFilterMapping = {
  [Parts.Body]: 'simBody',
  [Parts.Feet]: 'simFeet',
  [Parts.PlanarSphere]: 'simPlanarSphere',
  [Parts.LinkRope]: 'simLinkRope',
} as const

export function generateFullDefaultForm(
  characterId: string,
  lightCone: string,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teammate = false,
): Form {
  // @ts-ignore
  if (!characterId) return null

  const dbMetadata = DB.getMetadata()

  const simulationForm: Form = getDefaultForm({ id: characterId })

  simulationForm.characterId = characterId
  simulationForm.characterEidolon = characterEidolon
  simulationForm.lightCone = lightCone
  simulationForm.lightConeSuperimposition = lightConeSuperimposition

  simulationForm.characterConditionals = {}
  simulationForm.lightConeConditionals = {}

  const characterConditionalsRequest = { characterId: characterId, characterEidolon: characterEidolon }
  const lightConeConditionalsRequest = generateConditionalResolverMetadata(simulationForm, dbMetadata)

  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(characterConditionalsRequest)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(lightConeConditionalsRequest)

  if (teammate) {
    if (characterConditionals.teammateDefaults) Utils.mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.teammateDefaults())
    if (lightConeConditionals.teammateDefaults) Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.teammateDefaults())
  } else {
    if (characterConditionals.defaults) Utils.mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.defaults())
    if (lightConeConditionals.defaults) Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.defaults())
  }

  const simulationMetadata = DB.getMetadata().characters[characterId].scoringMetadata?.simulation
  if (simulationMetadata) {
    simulationForm.comboAbilities = [...simulationMetadata.comboAbilities]
    simulationForm.comboDot = simulationMetadata.comboDot
    simulationForm.comboBreak = simulationMetadata.comboBreak
  } else {
    // @ts-ignore
    simulationForm.comboAbilities = [null, 'BASIC']
    simulationForm.comboDot = 0
    simulationForm.comboBreak = 0
  }

  return simulationForm
}

export function computeOptimalSimulation(
  partialSimulationWrapper: PartialSimulationWrapper,
  inputMinSubstatRollCounts: SimulationStats,
  inputMaxSubstatRollCounts: SimulationStats,
  simulationForm: Form,
  context: OptimizerContext,
  applyScoringFunction: ScoringFunction,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
) {
  const minSubstatRollCounts = inputMinSubstatRollCounts
  const maxSubstatRollCounts = inputMaxSubstatRollCounts

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
    currentSimulation.result = runSimulations(simulationForm, context, [currentSimulation], {
      ...scoringParams,
      substatRollsModifier: scoringParams.substatRollsModifier,
    })[0]
    return currentSimulation
  }

  // For the perfect 200% sim, we have to force the build to be a possible build
  // Track the substats per part and make sure there are enough slots being used
  const possibleDistributionTracker: {
    parts: {
      main: string
      substats: {
        [key: string]: boolean
      }
    }[]
  } = { parts: [] }
  if (scoringParams.enforcePossibleDistribution) {
    speedCap = false
    maxSubstatRollCounts[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
    currentSimulation.request.stats[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
    sum = sumSubstatRolls(maxSubstatRollCounts)

    const candidateStats = [...metadata.substats, Stats.SPD]

    const generate = (excluded: string) => {
      const substats: Record<string, boolean> = {}
      candidateStats.forEach((stat) => {
        if (stat != excluded) {
          substats[stat] = true
        }
      })
      return {
        main: excluded,
        substats: substats,
      }
    }

    const request = partialSimulationWrapper.simulation.request
    // Backwards so main stats go first
    possibleDistributionTracker.parts = [
      generate(request.simLinkRope),
      generate(request.simPlanarSphere),
      generate(request.simFeet),
      generate(request.simBody),
      generate(Stats.ATK),
      generate(Stats.HP),
    ]
  }

  // Tracker for stats that cant be reduced further
  const excludedStats: Record<string, boolean> = {}

  while (sum > goal) {
    let bestSim: Simulation = undefined
    let bestSimStats: SimulationStats = undefined
    let bestSimResult: SimulationResult = undefined
    let reducedStat: string = undefined

    const remainingStats = Object.entries(currentSimulation.request.stats)
      .filter(([key, value]) => value > scoringParams.freeRolls)
      .map(([key]) => key)
      .filter((stat) => !excludedStats[stat])

    const debug = currentSimulation.request.stats

    for (const stat of remainingStats) {
      // Can't reduce further so we skip
      if (currentSimulation.request.stats[stat] <= scoringParams.freeRolls) continue
      if (Utils.sumArray(Object.values(currentSimulation.request.stats)) <= scoringParams.substatGoal) continue
      if (stat == Stats.SPD && currentSimulation.request.stats[Stats.SPD] <= Math.ceil(partialSimulationWrapper.speedRollsDeduction)) continue
      if (currentSimulation.request.stats[stat] <= minSubstatRollCounts[stat]) continue

      // Cache the value so we can undo a modification
      const undo = currentSimulation.request.stats[stat]

      // Try reducing this stat
      const newSimulation: Simulation = currentSimulation
      newSimulation.request.stats[stat] -= 1

      const newSimResult = runSimulations(simulationForm, context, [newSimulation], {
        ...scoringParams,
        substatRollsModifier: scoringParams.substatRollsModifier,
        simulationFlags: simulationFlags,
      })[0]
      simulationRuns++

      if (breakpointsCap && breakpoints?.[stat]) {
        if (newSimResult.xa[StatToKey[stat]] < breakpoints[stat]) {
          currentSimulation.request.stats[stat] = undo
          continue
        }
      }

      applyScoringFunction(newSimResult)

      if (!bestSim || newSimResult.simScore > bestSimResult.simScore) {
        bestSim = newSimulation
        bestSimStats = Object.assign({}, newSimulation.request.stats)
        bestSimResult = newSimResult
        reducedStat = stat
      }

      currentSimulation.request.stats[stat] = undo
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

    // if (scoringParams.enforcePossibleDistribution) {
    //   console.log(debug)
    // }

    if (scoringParams.enforcePossibleDistribution && bestSimStats[reducedStat] < 6) {
      const stat = reducedStat

      // How many stats the sim's iteration is attempting
      const simStatCount = bestSimStats[stat]
      // How many slots are open for the stat in question
      const statSlotCount = possibleDistributionTracker
        .parts
        .map((part) => part.substats[stat])
        .filter((hasSubstat) => hasSubstat)
        .length

      if (simStatCount < statSlotCount) {
        // We need to reduce the slots to fit the sim
        let deleted = false
        for (const part of possibleDistributionTracker.parts) {
          // Can't do anything since it's not in the subs
          if (!part.substats[stat]) continue
          // Can't do anything since we need all 4 slots filled
          if (Object.values(part.substats).length <= 4) continue

          // Found one that we can reduce, and exit
          delete part.substats[stat]
          deleted = true
          break
        }

        if (!deleted) {
          // We didn't delete anything, so this distribution must be invalid
          // Don't reduce the stat and continue the search
          excludedStats[stat] = true
          continue
        }
      }
    }

    currentSimulation = bestSim
    currentSimulationResult = bestSimResult
    currentSimulation.request.stats = bestSimStats
    sum -= 1
  }

  currentSimulation.result = currentSimulationResult

  console.log(
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

function isErrRopeForced(
  form: Form,
  metadata: SimulationMetadata,
  originalSim: Simulation,
) {
  return originalSim.request.simLinkRope == Stats.ERR && metadata.errRopeEidolon != null && form.characterEidolon >= metadata.errRopeEidolon
}

// Generate all main stat possibilities
function generatePartialSimulations(
  character: Character,
  metadata: SimulationMetadata,
  simulationSets: SimulationSets,
  originalSim: Simulation,
) {
  const forceSpdBoots = false // originalBaseSpeed - baselineSimResult.x[Stats.SPD] > 2.0 * 2 * 5 // 3 min spd rolls per piece
  const feetParts: string[] = forceSpdBoots ? [Stats.SPD] : metadata.parts[Parts.Feet]

  const forceErrRope = isErrRopeForced(character.form, metadata, originalSim)
  const ropeParts: string[] = forceErrRope ? [Stats.ERR] : metadata.parts[Parts.LinkRope]

  const { relicSet1, relicSet2, ornamentSet } = simulationSets

  const results: PartialSimulationWrapper[] = []
  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of feetParts) {
      for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
        for (const linkRope of ropeParts) {
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
  context: OptimizerContext,
  simulationSets: SimulationSets,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
) {
  const relicsByPart: RelicBuild = TsUtils.clone(displayRelics)
  Object.values(Parts).forEach((part) => relicsByPart[part] = relicsByPart[part] || emptyRelicWithSetAndSubstats())
  Object.values(Parts).forEach((part) => relicsByPart[part].part = part)
  Object.values(relicsByPart).map((relic: Relic) => {
    // Remove all subs
    relic.substats = []
    if (relic.part == Parts.Head) {
      for (const substat of SubStats) {
        if (substat == Stats.SPD) continue

        relic.substats.push({
          stat: substat,
          // No substats for baseline
          value: StatCalculator.getMaxedSubstatValue(substat, scoringParams.quality) * 0,
        })
      }
    }
  })

  const {
    originalSimResult,
    originalSim,
  } = simulateOriginalCharacter(relicsByPart, simulationSets, simulationForm, context, scoringParams, simulationFlags, 0, true)
  return {
    baselineSimResult: originalSimResult,
    baselineSim: originalSim,
  }
}

// TODO: why is this function used twice
function simulateOriginalCharacter(
  displayRelics: RelicBuild,
  simulationSets: SimulationSets,
  simulationForm: Form,
  context: OptimizerContext,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
  mainStatMultiplier = 1,
  overwriteSets = false,
): { originalSimResult: SimulationResult; originalSim: Simulation } {
  const relicsByPart: RelicBuild = TsUtils.clone(displayRelics)
  Object.values(Parts).forEach((part) => relicsByPart[part].part = part)

  const { relicSetNames, ornamentSetName } = calculateSetNames(relicsByPart)

  const originalSimRequest = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, scoringParams.quality, scoringParams.speedRollValue)

  if (overwriteSets) {
    const { relicSet1, relicSet2, ornamentSet } = simulationSets

    originalSimRequest.simRelicSet1 = relicSet1
    originalSimRequest.simRelicSet2 = relicSet2
    originalSimRequest.simOrnamentSet = ornamentSet
  }

  // @ts-ignore
  const originalSim: Simulation = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: originalSimRequest,
  } as Simulation

  const originalSimResult = runSimulations(simulationForm, context, [originalSim], {
    ...scoringParams,
    substatRollsModifier: (rolls: number) => rolls,
    mainStatMultiplier: mainStatMultiplier,
    simulationFlags: simulationFlags,
  })[0]

  originalSim.result = originalSimResult
  return {
    originalSimResult,
    originalSim,
  }
}

function calculateSetNames(relicsByPart: RelicBuild) {
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

export function calculatePenaltyMultiplier(
  simulationResult: SimulationResult,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
) {
  let newPenaltyMultiplier = 1
  if (metadata.breakpoints) {
    for (const stat of Object.keys(metadata.breakpoints)) {
      if (Utils.isFlat(stat)) {
        // Flats are penalized by their percentage
        newPenaltyMultiplier *= (Math.min(1, simulationResult.xa[StatToKey[stat]] / metadata.breakpoints[stat]) + 1) / 2
      } else {
        // Percents are penalize by half of the missing stat's breakpoint roll percentage
        newPenaltyMultiplier *= Math.min(1,
          1 - (metadata.breakpoints[stat] - simulationResult.xa[StatToKey[stat]]) / StatCalculator.getMaxedSubstatValue(stat as SubStats, scoringParams.quality))
      }
    }
  }
  simulationResult.penaltyMultiplier = newPenaltyMultiplier
  return newPenaltyMultiplier
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
// const SimScoreGrades = {
//   'WTF+': 125,
//   'WTF': 120,
//   'SSS+': 115,
//   'SSS': 110,
//   'SS+': 105,
//   'SS': 100,
//   'S+': 95,
//   'S': 90,
//   'A+': 85,
//   'A': 80,
//   'B+': 75,
//   'B': 70,
//   'C+': 65,
//   'C': 60,
//   'D+': 55,
//   'D': 50,
//   'F+': 45,
//   'F': 40,
// }

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

// // Gradual scale
// const SimScoreGrades = {
//   'WTF+': 140, // +10
//   'WTF': 130, // +9
//   'SSS+': 121, // +8
//   'SSS': 113, // +7
//   'SS+': 106, // +6
//   'SS': 100, // +5
//   'S+': 95,
//   'S': 90,
//   'A+': 85,
//   'A': 80,
//   'B+': 75,
//   'B': 70,
//   'C+': 65,
//   'C': 60,
//   'D+': 55,
//   'D': 50,
//   'F+': 45,
//   'F': 40,
// }

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
