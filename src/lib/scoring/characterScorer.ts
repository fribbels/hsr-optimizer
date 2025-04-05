import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { MainStatParts, Parts, Stats, SubStats } from 'lib/constants/constants'
import { emptyRelicWithSetAndSubstats } from 'lib/optimization/calculateBuild'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { StatCalculator } from 'lib/relics/statCalculator'
import { calculateSetNames, scoreCharacterSimulation } from 'lib/scoring/dpsScore'
import { PartialSimulationWrapper, RelicBuild, ScoringFunction, ScoringParams, SimulationFlags, SimulationResult, SimulationScore } from 'lib/scoring/simScoringUtils'
import { convertRelicsToSimulation, runSimulations, Simulation, SimulationRequest } from 'lib/simulations/statSimulationController'
import DB from 'lib/state/db'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { Character } from 'types/character'
import { CharacterConditionalsController, LightConeConditionalsController } from 'types/conditionals'
import { Form } from 'types/form'
import { ShowcaseTemporaryOptions, SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'
import { Relic } from 'types/relic'

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

      const simulationScore = await scoreCharacterSimulation(
        character,
        displayRelics,
        teamSelection,
        showcaseTemporaryOptions,
        characterMetadata.scoringMetadata,
        DB.getScoringMetadata(character.id),
      )

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

export type SimulationStatUpgrade = {
  simulation: Simulation
  simulationResult: SimulationResult
  part?: string
  stat?: string
  percent?: number
}

export function generateStatImprovements(
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

// export function computeOptimalSimulation(
//   partialSimulationWrapper: PartialSimulationWrapper,
//   inputMinSubstatRollCounts: SimulationStats,
//   inputMaxSubstatRollCounts: SimulationStats,
//   simulationForm: Form,
//   context: OptimizerContext,
//   applyScoringFunction: ScoringFunction,
//   metadata: SimulationMetadata,
//   scoringParams: ScoringParams,
//   simulationFlags: SimulationFlags,
// ) {
//   const minSubstatRollCounts = inputMinSubstatRollCounts
//   const maxSubstatRollCounts = inputMaxSubstatRollCounts
//
//   const breakpoints = metadata.breakpoints
//   const goal = scoringParams.substatGoal
//   let sum = sumSubstatRolls(maxSubstatRollCounts)
//   let currentSimulation: Simulation = partialSimulationWrapper.simulation
//   let currentSimulationResult: SimulationResult = undefined
//
//   let breakpointsCap = true
//   let speedCap = true
//   let simulationRuns = 0
//
//   const sumRequest: number = TsUtils.sumArray(Object.values(currentSimulation.request.stats))
//   const sumMin: number = TsUtils.sumArray(Object.values(minSubstatRollCounts))
//   if (sumRequest == sumMin || sumRequest < goal) {
//     currentSimulation.result = runSimulations(simulationForm, context, [currentSimulation], {
//       ...scoringParams,
//       substatRollsModifier: scoringParams.substatRollsModifier,
//     })[0]
//     return currentSimulation
//   }
//
//   // For the perfect 200% sim, we have to force the build to be a possible build
//   // Track the substats per part and make sure there are enough slots being used
//   const possibleDistributionTracker: {
//     parts: {
//       main: string
//       substats: {
//         [key: string]: boolean
//       }
//     }[]
//   } = { parts: [] }
//   if (scoringParams.enforcePossibleDistribution) {
//     speedCap = false
//     maxSubstatRollCounts[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
//     currentSimulation.request.stats[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
//     sum = sumSubstatRolls(maxSubstatRollCounts)
//
//     const candidateStats = [...metadata.substats, Stats.SPD]
//
//     const generate = (excluded: string) => {
//       const substats: Record<string, boolean> = {}
//       candidateStats.forEach((stat) => {
//         if (stat != excluded) {
//           substats[stat] = true
//         }
//       })
//       return {
//         main: excluded,
//         substats: substats,
//       }
//     }
//
//     const request = partialSimulationWrapper.simulation.request
//     // Backwards so main stats go first
//     possibleDistributionTracker.parts = [
//       generate(request.simLinkRope),
//       generate(request.simPlanarSphere),
//       generate(request.simFeet),
//       generate(request.simBody),
//       generate(Stats.ATK),
//       generate(Stats.HP),
//     ]
//   }
//
//   // Tracker for stats that cant be reduced further
//   const excludedStats: Record<string, boolean> = {}
//
//   while (sum > goal) {
//     let bestSim: Simulation = undefined
//     let bestSimStats: SimulationStats = undefined
//     let bestSimResult: SimulationResult = undefined
//     let reducedStat: string = undefined
//
//     const remainingStats = Object.entries(currentSimulation.request.stats)
//       .filter(([key, value]) => value > scoringParams.freeRolls)
//       .map(([key]) => key)
//       .filter((stat) => !excludedStats[stat])
//
//     const debug = currentSimulation.request.stats
//
//     for (const stat of remainingStats) {
//       // Can't reduce further so we skip
//       if (currentSimulation.request.stats[stat] <= scoringParams.freeRolls) continue
//       if (Utils.sumArray(Object.values(currentSimulation.request.stats)) <= scoringParams.substatGoal) continue
//       if (stat == Stats.SPD && currentSimulation.request.stats[Stats.SPD] <= Math.ceil(partialSimulationWrapper.speedRollsDeduction)) continue
//       if (currentSimulation.request.stats[stat] <= minSubstatRollCounts[stat]) continue
//
//       // Cache the value so we can undo a modification
//       const undo = currentSimulation.request.stats[stat]
//
//       // Try reducing this stat
//       const newSimulation: Simulation = currentSimulation
//       newSimulation.request.stats[stat] -= 1
//
//       const newSimResult = runSimulations(simulationForm, context, [newSimulation], {
//         ...scoringParams,
//         substatRollsModifier: scoringParams.substatRollsModifier,
//         simulationFlags: simulationFlags,
//       })[0]
//       simulationRuns++
//
//       if (breakpointsCap && breakpoints?.[stat]) {
//         if (newSimResult.xa[StatToKey[stat]] < breakpoints[stat]) {
//           currentSimulation.request.stats[stat] = undo
//           continue
//         }
//       }
//
//       applyScoringFunction(newSimResult)
//
//       if (!bestSim || newSimResult.simScore > bestSimResult.simScore) {
//         bestSim = newSimulation
//         bestSimStats = Object.assign({}, newSimulation.request.stats)
//         bestSimResult = newSimResult
//         reducedStat = stat
//       }
//
//       currentSimulation.request.stats[stat] = undo
//     }
//
//     if (!bestSimResult) {
//       // We can't reach the target speed and breakpoints, stop trying to match breakpoints and try again
//       if (breakpointsCap) {
//         breakpointsCap = false
//         continue
//       }
//
//       // We still can't reach the target speed and breakpoints, stop trying to match speed and try again
//       if (speedCap) {
//         speedCap = false
//         continue
//       }
//
//       // No solution possible, skip
//       sum -= 1
//       continue
//     }
//
//     // if (scoringParams.enforcePossibleDistribution) {
//     //   console.log(debug)
//     // }
//
//     if (scoringParams.enforcePossibleDistribution && bestSimStats[reducedStat] < 6) {
//       const stat = reducedStat
//
//       // How many stats the sim's iteration is attempting
//       const simStatCount = bestSimStats[stat]
//       // How many slots are open for the stat in question
//       const statSlotCount = possibleDistributionTracker
//         .parts
//         .map((part) => part.substats[stat])
//         .filter((hasSubstat) => hasSubstat)
//         .length
//
//       if (simStatCount < statSlotCount) {
//         // We need to reduce the slots to fit the sim
//         let deleted = false
//         for (const part of possibleDistributionTracker.parts) {
//           // Can't do anything since it's not in the subs
//           if (!part.substats[stat]) continue
//           // Can't do anything since we need all 4 slots filled
//           if (Object.values(part.substats).length <= 4) continue
//
//           // Found one that we can reduce, and exit
//           delete part.substats[stat]
//           deleted = true
//           break
//         }
//
//         if (!deleted) {
//           // We didn't delete anything, so this distribution must be invalid
//           // Don't reduce the stat and continue the search
//           excludedStats[stat] = true
//           continue
//         }
//       }
//     }
//
//     currentSimulation = bestSim
//     currentSimulationResult = bestSimResult
//     currentSimulation.request.stats = bestSimStats
//     sum -= 1
//   }
//
//   currentSimulation.result = currentSimulationResult
//
//   console.log(
//     'simulationRuns',
//     simulationRuns,
//     partialSimulationWrapper.simulation.request.simBody,
//     partialSimulationWrapper.simulation.request.simFeet,
//     partialSimulationWrapper.simulation.request.simLinkRope,
//     partialSimulationWrapper.simulation.request.simPlanarSphere,
//   )
//   return currentSimulation
// }

function isErrRopeForced(
  form: Form,
  metadata: SimulationMetadata,
  originalSim: Simulation,
) {
  return originalSim.request.simLinkRope == Stats.ERR && metadata.errRopeEidolon != null && form.characterEidolon >= metadata.errRopeEidolon
}

// Generate all main stat possibilities
export function generatePartialSimulations(
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

export function simulateBaselineCharacter(
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
export function simulateOriginalCharacter(
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
