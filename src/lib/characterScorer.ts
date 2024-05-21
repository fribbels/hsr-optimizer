import { Character } from 'types/Character'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { DEFAULT_TEAM, Parts, Sets, Stats, SubStats } from 'lib/constants'
import { calculateOrnamentSets, calculateRelicSets, convertRelicsToSimulation, runSimulations, Simulation, SimulationRequest, SimulationStats } from 'lib/statSimulationController'
import { getDefaultForm } from 'lib/defaultForm'
import { CharacterConditionals } from 'lib/characterConditionals'
import { Utils } from 'lib/utils'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { emptyRelic } from 'lib/optimizer/optimizerUtils'
import { Form } from 'types/Form'
import { Relic, Stat } from 'types/Relic'
import DB from 'lib/db'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { StatCalculator } from 'lib/statCalculator'

const cachedSims = {}
const QUALITY = 0.8
const SUBSTAT_GOAL = 50
const FREE_ROLLS = 2
const SPEED_DEDUCTION = Utils.precisionRound(3 * QUALITY - 0.4)

export type SimulationResult = ComputedStatsObject & {
  SIM_SCORE: number
  stat: string
}

export type SimulationScore = {
  currentSimValue: number
  baselineSimValue: number
  maxSimValue: number
  percent: number
  maxSim: Simulation
  currentSim: Simulation
  baselineSim: Simulation
  sims: Simulation[]
  statUpgrades: SimulationStatUpgrade[]
  metadata: any
}

export function scoreCharacterSimulation(character: Character, finalStats: any, displayRelics: any, teamSelection: string) {
  // Since this is a compute heavy sim, and we don't currently control the reloads on the character tab well,
  // just cache the results for now

  const characterMetadata = DB.getMetadata().characters[character.id]
  const metadata = teamSelection == DEFAULT_TEAM
    ? characterMetadata?.scoringMetadata?.simulation
    : DB.getScoringMetadata(character.id).simulation

  const cacheKey = Utils.objectHash({
    character,
    displayRelics,
    metadata,
  })

  if (cachedSims[cacheKey]) {
    console.log('Using cached bestSims')
    return cachedSims[cacheKey]
  }

  const originalForm = character.form
  const characterId = originalForm.characterId!
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  const has6Piece = Object.values(displayRelics).filter((x) => x).length == 6

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

  // console.debug('simulationForm', simulationForm)

  // Generate scoring function
  const formula = metadata.formula
  const applyScoringFunction = (result) => {
    if (!result) return

    const score = (
      result.BASIC * formula.BASIC
      + result.SKILL * formula.SKILL
      + result.ULT * formula.ULT
      + result.FUA * formula.FUA
      + result.DOT * formula.DOT
      + result.BREAK * formula.BREAK
    )

    // const spdScaling = (1 + result.xSPD / baselineSimResult.xSPD)
    result.SIM_SCORE = score

    // We apply a penalty to the percent if the user did not reach thresholds
    calculatePenaltyMultiplier(result, metadata.breakpoints)
  }

  // Simulate the original character
  const { originalSimResult, originalSim } = simulateOriginalCharacter(displayRelics, simulationForm)
  const originalFinalSpeed = originalSimResult.xSPD
  const originalBaseSpeed = originalSimResult.SPD

  const { baselineSimResult } = simulateBaselineCharacter(displayRelics, simulationForm)

  // Generate partials
  const partialSimulationWrappers = generatePartialSimulations(metadata, originalBaseSpeed)
  // console.debug(partialSimulationWrappers)

  const bestPartialSims: Simulation[] = []

  // Run sims
  for (const partialSimulationWrapper of partialSimulationWrappers) {
    const simulationResult = runSimulations(simulationForm, [partialSimulationWrapper.simulation], QUALITY)[0]

    // Find the speed deduction
    const finalSpeed = simulationResult.xSPD
    partialSimulationWrapper.finalSpeed = finalSpeed
    partialSimulationWrapper.speedRollsDeduction = Math.max(0, Utils.precisionRound((originalFinalSpeed - finalSpeed) / SPEED_DEDUCTION))
    // console.debug(partialSimulationWrapper)
    const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, metadata)
    const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata)
    Object.values(SubStats).map((x) => partialSimulationWrapper.simulation.request.stats[x] = maxSubstatRollCounts[x])
    // console.debug(minSubstatRollCounts, maxSubstatRollCounts)
    const bestSim = computeOptimalSimulation(partialSimulationWrapper, minSubstatRollCounts, maxSubstatRollCounts, simulationForm, applyScoringFunction, metadata)

    // DEBUG
    bestSim.key = JSON.stringify(bestSim.request)
    bestSim.name = ''
    bestPartialSims.push(bestSim)
  }

  applyScoringFunction(originalSimResult)
  applyScoringFunction(baselineSimResult)
  bestPartialSims.map((x) => applyScoringFunction(x.result))

  // Try to minimize the penalty modifier before optimizing sim score
  const bestSims = bestPartialSims.sort(simSorter)
  console.debug('bestSims', bestSims)

  // DEBUG - Apply the sims to optimizer page
  // window.store.getState().setStatSimulations(bestPartialSims)

  const bestPenaltyMultiplier = bestSims[0].result.penaltyMultiplier
  const originalPenaltyMultiplier = originalSimResult.penaltyMultiplier

  const percent = (originalSimResult.SIM_SCORE - baselineSimResult.SIM_SCORE) / (bestSims[0].result.SIM_SCORE - baselineSimResult.SIM_SCORE)
  const percentModifier = (originalPenaltyMultiplier / bestPenaltyMultiplier)

  const statUpgrades = generateStatImprovements(originalSimResult, originalSim, simulationForm, metadata, applyScoringFunction)
  for (const statUpgrade of statUpgrades) {
    const percent = (statUpgrade.SIM_SCORE - baselineSimResult.SIM_SCORE) / (bestSims[0].result.SIM_SCORE - baselineSimResult.SIM_SCORE)
    const percentModifier = (statUpgrade.simulationResult.penaltyMultiplier / bestPenaltyMultiplier)
    statUpgrade.percent = percent * percentModifier
  }
  statUpgrades.sort((a, b) => b.percent! - a.percent!)

  const simScoringResult: SimulationScore = {
    baselineSimValue: baselineSimResult.SIM_SCORE,
    currentSimValue: originalSimResult.SIM_SCORE - baselineSimResult.SIM_SCORE,
    maxSimValue: bestSims[0].result.SIM_SCORE - baselineSimResult.SIM_SCORE,
    percent: percent * percentModifier,
    maxSim: bestSims[0],
    currentSim: originalSimResult,
    baselineSim: baselineSimResult,
    currentRequest: simulationForm,
    sims: bestSims,
    statUpgrades: statUpgrades,
    metadata: metadata,
  }

  cachedSims[cacheKey] = simScoringResult

  console.debug('simScoringResult', simScoringResult)
  return simScoringResult
}

export type SimulationStatUpgrade = {
  stat: string
  SIM_SCORE: number
  simulationResult: SimulationResult
  percent?: number
}

function generateStatImprovements(
  originalSimResult: SimulationResult,
  originalSim: Simulation,
  simulationForm: Form,
  metadata: any,
  applyScoringFunction,
): SimulationStatUpgrade[] {
  const results: SimulationStatUpgrade[] = []
  for (const stat of metadata.substats) {
    const originalSimClone = Utils.clone(originalSim)
    originalSimClone.request.stats[stat] = (originalSimClone.request.stats[stat] ?? 0) + QUALITY

    const statImprovementResult = runSimulations(simulationForm, [originalSimClone], QUALITY)[0]
    applyScoringFunction(statImprovementResult)
    results.push({
      stat: stat,
      SIM_SCORE: statImprovementResult.SIM_SCORE,
      simulationResult: statImprovementResult,
    })
  }

  console.log(originalSimResult, originalSim, metadata, results)

  return results
}

function generateFullDefaultForm(characterId: string, lightCone: string, characterEidolon: number, lightConeSuperimposition: number, teammate = false) {
  if (!characterId) return null

  const characterConditionalsRequest = { characterId: characterId, characterEidolon: characterEidolon }
  const lightConeConditionalsRequest = { lightCone: lightCone, eidolon: lightConeSuperimposition }

  const simulationForm = getDefaultForm({ id: characterId })
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
  metadata,
) {
  const breakpoints = metadata.breakpoints
  const goal = SUBSTAT_GOAL
  let sum = sumSubstatRolls(maxSubstatRollCounts)
  let currentSimulation: Simulation = partialSimulationWrapper.simulation
  let currentSimulationResult: any = undefined

  let breakpointsCap = true
  let speedCap = true

  console.debug('STARTING ', maxSubstatRollCounts)
  console.debug('STARTING ', sum)

  while (sum > goal) {
    let bestSim: Simulation | undefined
    let bestSimResult
    let bestSimDeductedStat: Stat | undefined

    const remainingStats = Object.entries(currentSimulation.request.stats)
      .filter(([_key, value]) => value > 0)
      .map(([key, _value]) => key)

    for (const stat of remainingStats) {
      // Can't reduce further so we skip
      if (currentSimulation.request.stats[stat] <= 0) continue
      if (Utils.sumArray(Object.values(currentSimulation.request.stats)) <= SUBSTAT_GOAL) continue
      if (stat == Stats.SPD && speedCap && currentSimulation.request.stats[Stats.SPD] <= partialSimulationWrapper.speedRollsDeduction) continue
      if (currentSimulation.request.stats[stat] <= minSubstatRollCounts[stat]) continue

      // Try reducing this stat
      const newSimulation = Utils.clone(currentSimulation)
      newSimulation.request.stats[stat] -= 1

      const newSimResult = runSimulations(simulationForm, [newSimulation], QUALITY)[0]

      if (breakpointsCap && breakpoints[stat]) {
        if (newSimResult.x[stat] < breakpoints[stat]) {
          continue
        }
      }

      applyScoringFunction(newSimResult)
      applyScoringFunction(bestSimResult)

      if (!bestSim || newSimResult.SIM_SCORE > bestSimResult.SIM_SCORE) {
        bestSim = newSimulation
        bestSimResult = newSimResult
        bestSimDeductedStat = stat
      }
    }

    if (!bestSimResult) {
      // We can't reach the target speed and breakpoints, stop trying to match breakpoints and try again
      if (breakpointsCap) {
        breakpointsCap = false
        continue
      }

      // // Calculate penalties for missing breakpoints
      calculatePenaltyMultiplier(currentSimulationResult, breakpoints)

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
  currentSimulation.penaltyMultiplier = currentSimulationResult.penaltyMultiplier ?? 1

  return currentSimulation
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
function prioritizeFourSubstats(mins, substatPriority, excludes, speedRollsDeduction) {
  let speedRolls = 0
  for (const exclude of excludes) {
    let count = 0
    for (const stat of substatPriority) {
      if (count == 4) break
      if (stat == exclude) continue
      if (stat == substatPriority[4] || stat == substatPriority[3]) {
        if (speedRolls >= speedRollsDeduction) {

        } else {
          speedRolls++
          count++
          mins[Stats.SPD]++
          continue
        }
      }
      count++
      mins[stat]++
    }
  }
  mins[Stats.SPD] = speedRollsDeduction
}

function calculateMinSubstatRollCounts(partialSimulationWrapper: PartialSimulationWrapper, metadata) {
  const request = partialSimulationWrapper.simulation.request
  const minCounts: SimulationStats = {
    [Stats.HP_P]: FREE_ROLLS,
    [Stats.ATK_P]: FREE_ROLLS,
    [Stats.DEF_P]: FREE_ROLLS,
    [Stats.HP]: FREE_ROLLS,
    [Stats.ATK]: FREE_ROLLS,
    [Stats.DEF]: FREE_ROLLS,
    [Stats.SPD]: partialSimulationWrapper.speedRollsDeduction,
    [Stats.CR]: FREE_ROLLS,
    [Stats.CD]: FREE_ROLLS,
    [Stats.EHR]: FREE_ROLLS,
    [Stats.RES]: FREE_ROLLS,
    [Stats.BE]: FREE_ROLLS,
  }

  // prioritizeFourSubstats(minCounts, substatPriority, [request.simBody, request.simFeet, request.simPlanarSphere, request.simLinkRope, Stats.HP, Stats.ATK], partialSimulationWrapper.speedRollsDeduction)

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
    maxCounts[substat] = 24
  }

  maxCounts[request.simBody] -= 4
  maxCounts[request.simFeet] -= 4
  maxCounts[request.simPlanarSphere] -= 4
  maxCounts[request.simLinkRope] -= 4
  maxCounts[Stats.ATK] -= 4
  maxCounts[Stats.HP] -= 4

  for (const stat of SubStats) {
    maxCounts[stat] = Math.max(stat == Stats.SPD ? 0 : FREE_ROLLS, maxCounts[stat])
  }

  maxCounts[Stats.SPD] = partialSimulationWrapper.speedRollsDeduction

  return maxCounts
}

type PartialSimulationWrapper = {
  simulation: Simulation
  finalSpeed: number
  speedRollsDeduction: number
}

// Generate all main stat possibilities
function generatePartialSimulations(metadata, originalBaseSpeed) {
  const forceSpdBoots = originalBaseSpeed > 140
  const feetParts = forceSpdBoots ? [Stats.SPD] : metadata.parts[Parts.Feet]

  const results: PartialSimulationWrapper[] = []
  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of feetParts) {
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

function simulateBaselineCharacter(displayRelics, simulationForm) {
  const relicsByPart = Utils.clone(displayRelics)
  Object.values(Parts).forEach((x) => relicsByPart[x] = relicsByPart[x] || emptyRelic())
  Object.values(relicsByPart).map((relic: Relic) => {
    // Remove all subs
    relic.substats = []
    if (relic.part == Parts.Head) {
      for (const substat of SubStats) {
        if (substat == Stats.SPD) continue

        relic.substats.push({
          stat: substat,
          value: StatCalculator.getMaxedSubstatValue(substat, QUALITY) * FREE_ROLLS,
        })
      }
    }

    // Simulate useless sets
    if (relic.part == Parts.PlanarSphere || relic.part == Parts.LinkRope) {
      relic.set = Sets.CelestialDifferentiator
    } else {
      relic.set = Sets.GuardOfWutheringSnow
    }

    // Simulate no main stats except HP/ATK
    if (relic.part != Parts.Head && relic.part != Parts.Hands) {
      relic.main.value = 0
    }
  })

  const { originalSimResult } = simulateOriginalCharacter(relicsByPart, simulationForm)
  return {
    baselineSimResult: originalSimResult,
  }
}

function simulateOriginalCharacter(displayRelics, simulationForm) {
  const relicsByPart = Utils.clone(displayRelics)
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
  const originalSimRequest = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, QUALITY)
  const originalSim: Simulation = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: originalSimRequest,
  }
  const originalSimResult = runSimulations(simulationForm, [originalSim], QUALITY)[0]
  return {
    originalSimResult,
    originalSim,
  }
}

export function calculatePenaltyMultiplier(simulationResult, breakpoints) {
  let newPenaltyMultiplier = 1
  for (const stat of Object.keys(breakpoints)) {
    newPenaltyMultiplier *= Math.min(1, simulationResult[stat] / breakpoints[stat])
  }
  simulationResult.penaltyMultiplier = newPenaltyMultiplier
}

// Score on 1.00 scale
export function getSimScoreGrade(score) {
  let best = 'WTF+'
  const percent = Utils.precisionRound(score * 100)
  for (const [key, value] of Object.entries(SimScoreGrades)) {
    best = key
    if (percent >= value) {
      return best
    }
  }
  return '???'
}

function simSorter(a, b) {
  const aResult = a.result || a
  const bResult = b.result || b
  if (aResult.penaltyMultiplier === bResult.penaltyMultiplier) {
    return bResult.SIM_SCORE - aResult.SIM_SCORE
  }
  return bResult.penaltyMultiplier - aResult.penaltyMultiplier
}

// 1.00 => SSS
const SimScoreGrades = {
  'WTF+': 115,
  'WTF': 110,
  'SSS+': 105,
  'SSS': 100,
  'SS+': 95,
  'SS': 90,
  'S+': 85,
  'S': 80,
  'A+': 75,
  'A': 70,
  'B+': 65,
  'B': 60,
  'C+': 55,
  'C': 50,
  'D+': 45,
  'D': 40,
  'F+': 35,
  'F': 30,
}

// 1.00 => SS+
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

// // 1.00 => SS
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
