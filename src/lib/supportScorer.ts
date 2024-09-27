import { Character } from 'types/Character'
import { calculateSetNames, calculateSimSets, CharacterMetadata, generateFullDefaultForm, PartialSimulationWrapper, RelicBuild, ScoringFunction, ScoringMetadata, ScoringParams, simulateBaselineCharacter, SimulationMetadata, SimulationResult, SimulationScore, SimulationSets, sumSubstatRolls } from 'lib/characterScorer'
import { TsUtils } from 'lib/TsUtils'
import { Form } from 'types/Form'
import { generateParams, OptimizerParams } from 'lib/optimizer/calculateParams'
import { calculateConditionalRegistry, calculateConditionals } from 'lib/optimizer/calculateConditionals'
import { Constants, Parts, Stats } from 'lib/constants'
import { convertRelicsToSimulation, runSimulations, Simulation, SimulationRequest, SimulationStats } from 'lib/statSimulationController'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { Relic } from 'types/Relic'
import { StatCalculator } from 'lib/statCalculator'
import { StringToNumberMap } from 'types/Common'
import { Utils } from 'lib/utils'

const cachedSims: { [key: string]: SimulationScore } = {}

export function scoreSupportSimulation(
  character: Character,
  relicsByPart: RelicBuild,
  characterMetadata: CharacterMetadata,
  defaultScoringMetadata: ScoringMetadata,
): SimulationScore | null {
  const originalForm = character.form
  const characterId = originalForm.characterId
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  const simulationMetadata = defaultScoringMetadata.simulation

  const cacheKey = TsUtils.objectHash({
    characterId,
    characterEidolon,
    lightCone,
    lightConeSuperimposition,
    relicsByPart,
    simulationMetadata,
  })

  if (cachedSims[cacheKey]) {
    // console.log('Using cached bestSims')
    return cachedSims[cacheKey]
  }

  const simulationForm: Form = generateFullDefaultForm(characterId, lightCone, characterEidolon, lightConeSuperimposition, false)

  // Cache form/params for reuse
  const cachedOptimizerParams = generateParams(simulationForm)
  calculateConditionalRegistry(simulationForm, cachedOptimizerParams)
  calculateConditionals(simulationForm, cachedOptimizerParams)

  const simulationSets = calculateSimSets(simulationMetadata, relicsByPart)

  const { originalSimResult, originalSim } = simulateOriginalCharacter(
    relicsByPart,
    simulationSets,
    simulationForm,
    cachedOptimizerParams,
    originalScoringParams,
  )

  console.debug({ originalSimResult, originalSim })
  // {
  //   "HP": 2.9,
  //   "DEF": 5.6,
  //   "HP%": 4.3,
  //   "DEF%": 0,
  //   "SPD": 8.3077,
  //   "Effect RES": 0,
  //   "Break Effect": 14.2
  // }
  const perfectBuilds = generatePerfectBuilds(
    character,
    relicsByPart,
    characterMetadata,
    defaultScoringMetadata,
    simulationMetadata,
    originalSim,
    simulationForm,
    cachedOptimizerParams,
    simulationSets,
  )

  // Perfection: 54
  // 4.3 + 8.3 + 14.2 = 26.8
  //

  console.log('originalSim', originalSim)

  console.log('stats', originalSim.request.stats)
  console.log(perfectBuilds)

  tempScore(originalSim.request.stats)
  const perfectSimResults = perfectBuilds.map((x) => {
    const simClone = TsUtils.clone(originalSim)
    simClone.request = x
    const simulationResults = runSimulations(simulationForm, null, [simClone])
    console.log('PERFECT', simulationResults[0])
    return simulationResults[0].x
  })

  function maxByKey(arr, key) {
    return arr.reduce((max, obj) => obj[key] > max[key] ? obj : max, arr[0])[key]
  }

  const maxSpd = maxByKey(perfectSimResults, Stats.SPD)
  const maxBe = maxByKey(perfectSimResults, Stats.BE)
  const maxRes = maxByKey(perfectSimResults, Stats.RES)
  const maxEhp = maxByKey(perfectSimResults, 'EHP')

  console.log('maxSpd', maxSpd)
  console.log('maxBe', maxBe)
  console.log('maxRes', maxRes)
  console.log('maxEhp', maxEhp)

  const minSubstatRollCounts = {
    [Stats.BE]: 6,
    [Stats.SPD]: 5,
    [Stats.HP_P]: 5,
    [Stats.DEF_P]: 5,
    [Stats.RES]: 5,
  }
  const maxSubstatRollCounts = {
    [Stats.BE]: 36,
    [Stats.SPD]: 30,
    [Stats.HP_P]: 24,
    [Stats.DEF_P]: 24,
    [Stats.RES]: 24,
  }

  const request: SimulationRequest = {
    name: '',
    simRelicSet1: simulationSets.relicSet1,
    simRelicSet2: simulationSets.relicSet2,
    simOrnamentSet: simulationSets.ornamentSet,
    simBody: originalSim.request.simBody,
    simFeet: originalSim.request.simFeet,
    simPlanarSphere: originalSim.request.simPlanarSphere,
    simLinkRope: originalSim.request.simLinkRope,
    stats: maxSubstatRollCounts,
  }
  const simulation: Simulation = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: request,
  } as Simulation
  const partialSimulationWrapper: PartialSimulationWrapper = {
    simulation: simulation,
    finalSpeed: 0,
    speedRollsDeduction: 0,
  }

  console.debug('!!!')

  const result = computeOptimalSimulation(
    partialSimulationWrapper,
    minSubstatRollCounts,
    maxSubstatRollCounts,
    simulationForm,
    cachedOptimizerParams,
    (result: SimulationResult) => {
      if (!result) return 0
      const spdScore = result.x[Stats.SPD] / maxSpd
      const beScore = result.x[Stats.BE] / maxBe
      const resScore = result.x[Stats.RES] / maxRes
      const ehpScore = result.x.EHP / 20000

      const weightedResScore = Math.max(0, 1 - (1 + 1.0) * (1 - result.x[Stats.RES]))

      console.log(spdScore.toFixed(2), beScore.toFixed(2), weightedResScore.toFixed(2), ehpScore.toFixed(2), result.x[Stats.RES])

      result.simScore = spdScore + beScore + 0.5 * (weightedResScore) + 0.5 * (ehpScore)
    },
    simulationMetadata,
    benchmarkScoringParams,
  )
  console.debug(result)

  return {
    type: 'Support',
    debug: {
      originalSimResult: originalSimResult,
      originalSim: originalSim,
    },
    percentage: 0,
  }
}

function computeOptimalSimulation(
  partialSimulationWrapper: PartialSimulationWrapper,
  inputMinSubstatRollCounts: SimulationStats,
  inputMaxSubstatRollCounts: SimulationStats,
  simulationForm: Form,
  cachedOptimizerParams: OptimizerParams,
  applyScoringFunction: ScoringFunction,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
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
  // if (sumRequest == sumMin || sumRequest < goal) {
  //   currentSimulation.result = runSimulations(simulationForm, cachedOptimizerParams, [currentSimulation], { ...scoringParams, substatRollsModifier: scoringParams.substatRollsModifier })[0]
  //   return currentSimulation
  // }

  // For the perfect 200% sim, we have to force the build to be a possible build
  // Track the substats per part and make sure there are enough slots being used
  const possibleDistributionTracker: {
    parts: {
      main: string
      substats: { [key: string]: boolean }
    }[]
  } = { parts: [] }
  if (scoringParams.enforcePossibleDistribution) {
    speedCap = false
    maxSubstatRollCounts[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
    currentSimulation.request.stats[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
    sum = sumSubstatRolls(maxSubstatRollCounts)

    const candidateStats = [...metadata.substats, Stats.SPD]

    const generate = (excluded: string) => {
      const substats = {}
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
  const excludedStats = {}

  while (sum > goal) {
    let bestSim: Simulation = undefined
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

      // Try reducing this stat
      const newSimulation: Simulation = TsUtils.clone(currentSimulation)
      newSimulation.request.stats[stat] -= 1

      const newSimResult = runSimulations(simulationForm, cachedOptimizerParams, [newSimulation], { ...scoringParams, substatRollsModifier: scoringParams.substatRollsModifier })[0]
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
        reducedStat = stat
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

    // if (scoringParams.enforcePossibleDistribution) {
    //   console.log(debug)
    // }

    if (scoringParams.enforcePossibleDistribution && bestSim.request.stats[reducedStat] < 6) {
      const stat = reducedStat

      // How many stats the sim's iteration is attempting
      const simStatCount = bestSim.request.stats[stat]
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

function tempScore(stats) {
  const spdScore = stats[Stats.SPD]
  const beScore = stats[Stats.BE]
  const resScore = stats[Stats.RES]

  console.log('SPD SCORE: ', spdScore)
  console.log('BE SCORE: ', beScore)
  console.log('RES SCORE: ', resScore)
  console.log('SUM: ', spdScore + beScore + resScore)
}

function generatePerfectBuilds(
  character: Character,
  relicsByPart: RelicBuild,
  characterMetadata: CharacterMetadata,
  defaultScoringMetadata: ScoringMetadata,
  simulationMetadata: SimulationMetadata,
  originalSim: Simulation,
  simulationForm: Form,
  cachedOptimizerParams: OptimizerParams,
  simulationSets: SimulationSets,
) {
  const build: Partial<SimulationRequest> = {
    simBody: '',
    simFeet: '',
    simPlanarSphere: '',
    simLinkRope: '',
  }
  const stats: SimulationStats = {}

  const metaParts = simulationMetadata.parts
  build.simBody = originalSim.request.simBody in metaParts[Parts.Body] ? originalSim.request.simBody : metaParts[Parts.Body][0]
  build.simFeet = originalSim.request.simFeet in metaParts[Parts.Feet] ? originalSim.request.simFeet : metaParts[Parts.Feet][0]
  build.simPlanarSphere = originalSim.request.simPlanarSphere in metaParts[Parts.PlanarSphere] ? originalSim.request.simPlanarSphere : metaParts[Parts.PlanarSphere][0]
  build.simLinkRope = originalSim.request.simLinkRope in metaParts[Parts.LinkRope] ? originalSim.request.simLinkRope : metaParts[Parts.LinkRope][0]

  const perfectBuilds: SimulationRequest[] = []

  for (const perfectBuildMeta of simulationMetadata.perfection) {
    const perfectBuild = TsUtils.clone(build)

    const { baselineSimResult, baselineSim } = simulateBaselineCharacter(
      relicsByPart,
      simulationForm,
      cachedOptimizerParams,
      simulationSets,
      benchmarkScoringParams,
    )

    const statTracker = {
      [Parts.Head]: simulationMetadata.substats.filter((stat) => stat != Stats.HP).slice(0, 4),
      [Parts.Hands]: simulationMetadata.substats.filter((stat) => stat != Stats.ATK).slice(0, 4),
      [Parts.Body]: simulationMetadata.substats.filter((stat) => stat != build.simBody).slice(0, 4),
      [Parts.Feet]: simulationMetadata.substats.filter((stat) => stat != build.simFeet).slice(0, 4),
      [Parts.PlanarSphere]: simulationMetadata.substats.filter((stat) => stat != build.simPlanarSphere).slice(0, 4),
      [Parts.LinkRope]: simulationMetadata.substats.filter((stat) => stat != build.simLinkRope).slice(0, 4),
    }

    const minimumStatCounts: StringToNumberMap = Object.values(statTracker).flatMap((x) => x).reduce((acc, item) => (acc[item] = (acc[item] || 0) + 1, acc), {})
    Constants.SubStats.map((x) => minimumStatCounts[x] = minimumStatCounts[x] ?? 0)

    const resDiff = Math.max(0, 100 - baselineSimResult.x[Stats.RES] * 100)
    const resRollDiff = resDiff / StatCalculator.getMaxedSubstatValue(Stats.RES) - minimumStatCounts[Stats.RES]

    let remaining = 30
    let resRemaining = resRollDiff
    while (remaining > 0) {
      // TODO: Has to reach the benchmark first
      for (const stat of perfectBuildMeta.stats) {
        if (stat == Stats.SPD && minimumStatCounts[Stats.SPD] >= 30) {
          continue
        }
        if (stat == Stats.RES && resRemaining <= 0) {
          continue
        }

        minimumStatCounts[stat] += 1
        if (stat == Stats.RES) {
          resRemaining -= 1
        }

        remaining -= 1
        break
      }
    }

    console.log(minimumStatCounts)

    perfectBuild.stats = minimumStatCounts
    perfectBuilds.push(perfectBuild as SimulationRequest)
  }

  return perfectBuilds
}

function simulateOriginalCharacter(
  displayRelics: RelicBuild,
  simulationSets: SimulationSets,
  simulationForm: Form,
  cachedOptimizerParams: OptimizerParams,
  scoringParams: ScoringParams,
  mainStatMultiplier = 1,
  overwriteSets = false,
) {
  const relicsByPart: RelicBuild = TsUtils.clone(displayRelics)
  Object.values(Parts).forEach((part) => relicsByPart[part].part = part)

  const { relicSetNames, ornamentSetName } = calculateSetNames(relicsByPart)

  const originalSimRequest = convertRelicsToSimulation(
    relicsByPart,
    relicSetNames[0],
    relicSetNames[1],
    ornamentSetName,
    scoringParams.quality,
    scoringParams.speedRollValue,
  )

  if (overwriteSets) {
    const { relicSet1, relicSet2, ornamentSet } = simulationSets

    originalSimRequest.simRelicSet1 = relicSet1
    originalSimRequest.simRelicSet2 = relicSet2
    originalSimRequest.simOrnamentSet = ornamentSet
  }

  const originalSim: Simulation = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: originalSimRequest,
  } as Simulation

  const originalSimResult = runSimulations(
    simulationForm,
    cachedOptimizerParams,
    [originalSim],
    { ...scoringParams, substatRollsModifier: (rolls: number) => rolls, mainStatMultiplier: mainStatMultiplier },
  )[0]

  originalSim.result = originalSimResult
  return {
    originalSimResult,
    originalSim,
  }
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
  enforcePossibleDistribution: false,
  substatRollsModifier: substatRollsModifier,
}

const originalScoringParams: ScoringParams = {
  quality: 1,
  speedRollValue: 2.6,
  substatGoal: 48,
  freeRolls: 2,
  maxPerSub: 30,
  deductionPerMain: 5,
  baselineFreeRolls: 2,
  limitFlatStats: true,
  enforcePossibleDistribution: false,
  substatRollsModifier: (rolls: number) => rolls,
}

function substatRollsModifier(rolls: number, stat: string, relics: { [key: string]: Relic }) {
  if (stat == Stats.SPD) return rolls
  // Diminishing returns

  const mainsCount = Object.values(relics)
    .filter((x) => x.augmentedStats!.mainStat == stat)
    .length

  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - (lowerLimit))
  const diminishedExcess = excess / (Math.pow(excess, 0.25))

  return lowerLimit + diminishedExcess
}
