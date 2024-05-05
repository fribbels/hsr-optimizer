import { Character } from "types/Character";
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { Parts, Sets, Stats, SubStats } from 'lib/constants'
import {
  calculateOrnamentSets,
  calculateRelicSets,
  convertRelicsToSimulation,
  runSimulations,
  Simulation,
  SimulationRequest,
  SimulationStats
} from 'lib/statSimulationController'
import { getDefaultForm } from 'lib/defaultForm'
import { CharacterConditionals } from 'lib/characterConditionals'
import { Utils } from 'lib/utils'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { emptyRelic } from 'lib/optimizer/optimizerUtils'
import { Form } from 'types/Form'
import { Stat } from 'types/Relic'

const cachedSims = {}

export function scoreCharacterSimulation(character: Character, finalStats: any, displayRelics: any) {
  console.debug(character, finalStats, displayRelics)
  const originalForm = character.form
  const characterId = originalForm.characterId!
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  const cacheKey = JSON.stringify({
    character,
    displayRelics
  })

  // Since this is a compute heavy sim, and we don't currently control the reloads on the character tab well,
  // just cache the results for now
  if (cachedSims[cacheKey]) {
    console.debug('cached bestSims', cachedSims[cacheKey])
    return cachedSims[cacheKey]
  }

  const metadata = {
    parts: {
      "Body": [
        "CRIT DMG"
      ],
      "Feet": [
        "ATK%",
        "SPD"
      ],
      "PlanarSphere": [
        "ATK%",
        "Ice DMG Boost"
      ],
      "LinkRope": [
        "ATK%"
      ]
    },
    substats: [
      "CRIT DMG",
      "CRIT Rate",
      "ATK%",
      "ATK",
      "SPD",
    ]
  }

  // Set up default request, sets conditionals tbd
  const simulationForm = generateFullDefaultForm(characterId, lightCone, characterEidolon, lightConeSuperimposition)

  console.debug('simulationForm', simulationForm)

  // simulationForm.teammate0 = getDefaultForm({ id: '1101' })

  // Simulate the original character
  const originalSimResult = simulateOriginalCharacter(displayRelics, simulationForm)
  const originalFinalSpeed = originalSimResult.xSPD

  // Generate partials
  const partialSimulationWrappers = generatePartialSimulations(metadata)
  // console.debug(partialSimulationWrappers)

  const bestPartialSims: Simulation[] = []

  // Run sims
  for (const partialSimulationWrapper of partialSimulationWrappers) {
    const simulationResult = runSimulations(simulationForm, [partialSimulationWrapper.simulation])[0]

    // Find the speed deduction
    const finalSpeed = simulationResult.xSPD
    partialSimulationWrapper.finalSpeed = finalSpeed
    partialSimulationWrapper.speedRollsDeduction = Math.ceil((originalFinalSpeed - finalSpeed) / 2.6)
    // console.debug(partialSimulationWrapper)
    const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, metadata)
    const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata)
    Object.values(SubStats).map(x => partialSimulationWrapper.simulation.request.stats[x] = maxSubstatRollCounts[x])
    // console.debug(minSubstatRollCounts, maxSubstatRollCounts)
    const bestSim = computeOptimalSimulation(partialSimulationWrapper, minSubstatRollCounts, maxSubstatRollCounts, simulationForm, metadata)

    // DEBUG
    bestSim.key = JSON.stringify(bestSim.request)
    bestSim.name = ''
    bestPartialSims.push(bestSim)
  }

  let bestSims = bestPartialSims.sort((a, b) => b.result.SKILL - a.result.SKILL)

  window.store.getState().setStatSimulations(bestPartialSims)
  console.debug('bestSims', bestSims)

  const simScoringResult = {
    currentSimValue: originalSimResult.SKILL,
    maxSim: bestSims[0],
    maxSimValue: bestSims[0].result.SKILL,
    percent: originalSimResult.SKILL / bestSims[0].result.SKILL,
    sims: bestSims
  }

  cachedSims[cacheKey] = simScoringResult

  console.debug('simScoringResult', simScoringResult)
  return simScoringResult
}

function generateFullDefaultForm(characterId: string, lightCone: string, characterEidolon: number, lightConeSuperimposition: number) {
  const characterConditionalsRequest = {characterId: characterId, characterEidolon: characterEidolon}
  const lightConeConditionalsRequest = {lightCone: lightCone, eidolon: lightConeSuperimposition}

  const simulationForm = getDefaultForm(characterConditionalsRequest)
  simulationForm.characterId = characterId
  simulationForm.characterEidolon = characterEidolon
  simulationForm.lightCone = lightCone
  simulationForm.lightConeSuperimposition = lightConeSuperimposition

  simulationForm.characterConditionals = {}
  simulationForm.lightConeConditionals = {}
  Utils.mergeUndefinedValues(simulationForm.characterConditionals, CharacterConditionals.get(characterConditionalsRequest).defaults())
  Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, LightConeConditionals.get(lightConeConditionalsRequest).defaults())

  return simulationForm
}

function computeOptimalSimulation(
  partialSimulationWrapper: PartialSimulationWrapper,
  minSubstatRollCounts: SimulationStats,
  maxSubstatRollCounts: SimulationStats,
  simulationForm: Form,
  metadata
) {
  const relevantSubstats = metadata.substats
  const goal = 54
  let sum = sumSubstatRolls(maxSubstatRollCounts)
  let currentSimulation: Simulation = partialSimulationWrapper.simulation
  let currentSimulationResult: any = undefined

  while (sum > goal) {
    let bestSim: Simulation | undefined
    let bestSimResult
    let bestSimDeductedStat: Stat | undefined

    for (const stat of relevantSubstats) {
      // Can't reduce further
      if (currentSimulation.request.stats[stat] <= 0) continue
      if (stat == Stats.SPD && currentSimulation.request.stats[Stats.SPD] <= partialSimulationWrapper.speedRollsDeduction) continue
      if (currentSimulation.request.stats[stat] <= minSubstatRollCounts[stat]) continue
      if (isInvalidSubstatDistribution(currentSimulation)) continue

      const newSimulation = Utils.clone(currentSimulation)
      newSimulation.request.stats[stat] -= 1

      const newSimResult = runSimulations(simulationForm, [newSimulation])[0]

      if (!bestSim || newSimResult.SKILL > bestSimResult.SKILL) {
        bestSim = newSimulation
        bestSimResult = newSimResult
        bestSimDeductedStat = stat
      }
    }

    if (!bestSimResult) {
      throw new Error('Something went wrong simulating scores')
    }

    sum -= 1
    currentSimulation = bestSim
    currentSimulationResult = bestSimResult
  }

  currentSimulation.result = currentSimulationResult

  return currentSimulation
}

function isInvalidSubstatDistribution(currentSimulation: Simulation) {
  return false
}

function sumSubstatRolls(maxSubstatRollCounts) {
  let sum = 0
  for (const stat of SubStats) {
    sum += maxSubstatRollCounts[stat]
  }
  return sum
}

// This is an imperfect estimate of the optimal distribution of substats
// We assume that substats have a priority and choose the top 4 substats to prioritize
// This means we have to assume spd and flat stats are deprioritized but this will be close enough to the max to use
function prioritizeFourSubstats(mins, metadata, excludes) {
  for (const exclude of excludes) {
    let count = 0
    for (const stat of metadata.substats) {
      if (count == 4) break
      if (stat == exclude) continue
      count++
      mins[stat]++
    }
  }
}

function calculateMinSubstatRollCounts(partialSimulationWrapper: PartialSimulationWrapper, metadata) {
  const request = partialSimulationWrapper.simulation.request
  const minCounts: SimulationStats = {
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

  prioritizeFourSubstats(minCounts, metadata, [request.simBody, request.simFeet, request.simPlanarSphere, request.simLinkRope, Stats.HP, Stats.ATK])

  return minCounts
}

function calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata) {
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
    maxCounts[substat] = 36
  }

  maxCounts[request.simBody] -= 6
  maxCounts[request.simFeet] -= 6
  maxCounts[request.simPlanarSphere] -= 6
  maxCounts[request.simLinkRope] -= 6
  maxCounts[Stats.ATK] -= 6
  maxCounts[Stats.HP] -= 6

  maxCounts[Stats.SPD] = partialSimulationWrapper.speedRollsDeduction

  for (const stat of SubStats) {
    maxCounts[stat] = Math.max(0, maxCounts[stat])
  }

  return maxCounts
}

type PartialSimulationWrapper = {
  simulation: Simulation
  finalSpeed: number
  speedRollsDeduction: number
}

// Generate all main stat possibilities
function generatePartialSimulations(metadata) {
  const results: PartialSimulationWrapper[] = []
  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of metadata.parts[Parts.Feet]) {
      for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
        for (const linkRope of metadata.parts[Parts.LinkRope]) {
          const request: SimulationRequest = {
            name: '',
            simRelicSet1: Sets.HunterOfGlacialForest,
            simRelicSet2: Sets.HunterOfGlacialForest,
            simOrnamentSet: Sets.RutilantArena,
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
            }
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

function simulateOriginalCharacter(displayRelics, simulationForm) {
  const relicsByPart = Utils.clone(displayRelics)
  Object.values(Parts).forEach((x) => relicsByPart[x] = relicsByPart[x] || emptyRelic())
  const relicSets = [
    relicsByPart[Parts.Head].set,
    relicsByPart[Parts.Hands].set,
    relicsByPart[Parts.Body].set,
    relicsByPart[Parts.Feet].set,
  ].filter(x => x != -1)
  const ornamentSets = [
    relicsByPart[Parts.PlanarSphere].set,
    relicsByPart[Parts.LinkRope].set
  ].filter(x => x != -1)
  const relicSetNames = calculateRelicSets(relicSets, true)
  const ornamentSetName: string | undefined = calculateOrnamentSets(ornamentSets, true)
  const originalSimRequest = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName)
  const originalSim = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: originalSimRequest,
  }
  const originalSimResult = runSimulations(simulationForm, [originalSim])[0]
  return originalSimResult
}