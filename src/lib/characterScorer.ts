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

export function scoreCharacterSimulation(character: Character, finalStats: any, displayRelics: any) {
  console.debug(character, finalStats, displayRelics)
  const originalForm = character.form
  const characterId = originalForm.characterId!
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

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
      "CRIT Rate",
      "CRIT DMG",
      "ATK%",
      "SPD",
      "ATK",
    ]
  }

  // Set up default request, sets conditionals tbd
  const simulationForm = getDefaultForm({ id: characterId })
  simulationForm.lightCone = lightCone
  simulationForm.characterConditionals = {}
  simulationForm.lightConeConditionals = {}
  Utils.mergeUndefinedValues(simulationForm.characterConditionals, CharacterConditionals.get(originalForm).defaults())
  Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, LightConeConditionals.get(originalForm).defaults())

  // Simulate the original character
  const originalSimResult = simulateOriginalCharacter(displayRelics, simulationForm)
  const originalFinalSpeed = originalSimResult.xSPD

  // Generate partials
  const partialSimulationWrappers = generatePartialSimulations(metadata)
  console.debug(partialSimulationWrappers)

  const res = []

  // Run sims
  for (const partialSimulationWrapper of partialSimulationWrappers) {
    const simulationResult = runSimulations(simulationForm, [partialSimulationWrapper.simulation])[0]

    // Find the speed deduction
    const finalSpeed = simulationResult.xSPD
    partialSimulationWrapper.finalSpeed = finalSpeed
    partialSimulationWrapper.speedRollsDeduction = Math.ceil((originalFinalSpeed - finalSpeed) / 2.6)
    console.debug(partialSimulationWrapper)
    const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, metadata)
    const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata)
    Object.values(SubStats).map(x => partialSimulationWrapper.simulation.request.stats[x] = maxSubstatRollCounts[x])
    console.debug(minSubstatRollCounts, maxSubstatRollCounts)
    const bestSim = computeOptimalSimulation(partialSimulationWrapper, minSubstatRollCounts, maxSubstatRollCounts, simulationForm, metadata)

    // DEBUG
    const key = Utils.randomId()
    bestSim.key = JSON.stringify(bestSim)
    bestSim.name = ''
    res.push(bestSim)

    console.debug('!!!', bestSim)
  }



  window.store.getState().setStatSimulations(res)
  console.debug(originalFinalSpeed, originalSimResult)
  // const simulationResults = runSimulations(form, existingSimulations)
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
  }

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

  function takeFour(mins, excludes) {
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

  takeFour(minCounts, [request.simBody, request.simFeet, request.simPlanarSphere, request.simLinkRope, Stats.HP, Stats.ATK])

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