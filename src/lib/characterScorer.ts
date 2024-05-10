import { Character } from "types/Character";
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { Parts, Stats, SubStats } from 'lib/constants'
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
import DB from 'lib/db'

const cachedSims = {}

export function scoreCharacterSimulation(character: Character, finalStats: any, displayRelics: any) {
  console.debug(character, finalStats, displayRelics)

  // Since this is a compute heavy sim, and we don't currently control the reloads on the character tab well,
  // just cache the results for now
  const cacheKey = JSON.stringify({
    character,
    displayRelics
  })
  if (cachedSims[cacheKey]) {
    console.debug('cached bestSims', cachedSims[cacheKey])
    return cachedSims[cacheKey]
  }

  const originalForm = character.form
  const characterId = originalForm.characterId!
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  const characterMetadata = DB.getMetadata().characters[characterId]
  const metadata = characterMetadata?.scoringMetadata?.simulation
  const has6Piece = Object.values(displayRelics).filter(x => x).length == 6

  if (!characterId || !originalForm || !metadata || !lightCone || !has6Piece) {
    console.log('Invalid character sim setup')
    return null
  }

  // Set up default request, sets conditionals tbd
  const simulationForm = generateFullDefaultForm(characterId, lightCone, characterEidolon, lightConeSuperimposition, false)
  const simulationFormT0 = generateFullDefaultForm(metadata.teammates[0].characterId, metadata.teammates[0].lightCone, metadata.teammates[0].characterEidolon, metadata.teammates[0].lightConeSuperimposition, true)
  const simulationFormT1 = generateFullDefaultForm(metadata.teammates[1].characterId, metadata.teammates[1].lightCone, metadata.teammates[1].characterEidolon, metadata.teammates[1].lightConeSuperimposition, true)
  const simulationFormT2 = generateFullDefaultForm(metadata.teammates[2].characterId, metadata.teammates[2].lightCone, metadata.teammates[2].characterEidolon, metadata.teammates[2].lightConeSuperimposition, true)

  simulationForm.teammate0 = simulationFormT0
  simulationForm.teammate1 = simulationFormT1
  simulationForm.teammate2 = simulationFormT2

  console.debug('simulationForm', simulationForm)

  // Generate scoring function
  const formula = metadata.formula
  const applyScoringFunction = (result) => {
    if (!result) return

    const score =
      result.BASIC * formula.BASIC
      + result.SKILL * formula.SKILL
      + result.ULT * formula.ULT
      + result.FUA * formula.FUA
      + result.DOT * formula.DOT
      + result.BREAK * formula.BREAK

    result.SIM_SCORE = score
  }

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
    const bestSim = computeOptimalSimulation(partialSimulationWrapper, minSubstatRollCounts, maxSubstatRollCounts, simulationForm, applyScoringFunction, metadata)

    // DEBUG
    bestSim.key = JSON.stringify(bestSim.request)
    bestSim.name = ''
    bestPartialSims.push(bestSim)
  }

  applyScoringFunction(originalSimResult)
  bestPartialSims.map(x => applyScoringFunction(x.result))

  let bestSims = bestPartialSims.sort((a, b) => b.result.SIM_SCORE - a.result.SIM_SCORE)
  console.debug('bestSims', bestSims)

  // DEBUG - Apply the sims to optimizer page
  // window.store.getState().setStatSimulations(bestPartialSims)

  metadata.bestSim = bestSims[0].request

  const simScoringResult = {
    currentSimValue: originalSimResult.SIM_SCORE,
    maxSim: bestSims[0],
    maxSimValue: bestSims[0].result.SIM_SCORE,
    percent: originalSimResult.SIM_SCORE / bestSims[0].result.SIM_SCORE,
    sims: bestSims,
    metadata: metadata
  }

  cachedSims[cacheKey] = simScoringResult

  console.debug('simScoringResult', simScoringResult)
  return simScoringResult
}

function generateFullDefaultForm(characterId: string, lightCone: string, characterEidolon: number, lightConeSuperimposition: number, teammate = false) {
  if (!characterId) return null

  const characterConditionalsRequest = {characterId: characterId, characterEidolon: characterEidolon}
  const lightConeConditionalsRequest = {lightCone: lightCone, eidolon: lightConeSuperimposition}

  const simulationForm = getDefaultForm({id: characterId})
  simulationForm.characterId = characterId
  simulationForm.characterEidolon = characterEidolon
  simulationForm.lightCone = lightCone
  simulationForm.lightConeSuperimposition = lightConeSuperimposition

  simulationForm.characterConditionals = {}
  simulationForm.lightConeConditionals = {}

  const characterConditionals = CharacterConditionals.get(characterConditionalsRequest)
  const lightConeConditionals = LightConeConditionals.get(lightConeConditionalsRequest)

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
  applyScoringFunction: (result: any) => void,
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

      applyScoringFunction(newSimResult)
      applyScoringFunction(bestSimResult)

      if (!bestSim || newSimResult.SIM_SCORE > bestSimResult.SIM_SCORE) {
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
            simRelicSet1: metadata.relicSet1,
            simRelicSet2: metadata.relicSet2,
            simOrnamentSet: metadata.ornamentSet,
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