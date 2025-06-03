import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import {
  RelicBuild,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import {
  resolveDpsScoreSimulationMetadata,
  retrieveBenchmarkCache,
  runDpsScoreBenchmarkOrchestrator,
  setBenchmarkCache,
} from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { Character } from 'types/character'
import {
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'

export type AsyncSimScoringExecution = {
  done: boolean,
  result: SimulationScore | null,
  promise: Promise<SimulationScore | null> | null,
}

export function getShowcaseSimScoringExecution(
  character: Character,
  displayRelics: RelicBuild,
  teamSelection: string,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions = {},
): AsyncSimScoringExecution {
  const characterMetadata = DB.getMetadata().characters[character.id]
  const simulationMetadata = resolveDpsScoreSimulationMetadata(character, teamSelection)
  const singleRelicByPart = displayRelics as SingleRelicByPart

  const asyncResult: AsyncSimScoringExecution = {
    done: false,
    result: null,
    promise: null,
  }

  if (!simulationMetadata) {
    console.log('Invalid sim character')
    asyncResult.done = true
    return asyncResult
  }

  const { cacheKey, cachedOrchestrator } = retrieveBenchmarkCache(character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions)
  if (cachedOrchestrator) {
    // console.debug('CACHED')
    const simScore = cachedOrchestrator.simulationScore!
    asyncResult.done = true
    asyncResult.promise = Promise.resolve(simScore)
    asyncResult.result = simScore
    return asyncResult
  } else {
    // console.debug('NEW EXECUTION')
  }

  async function runSimulation() {
    try {
      const simulationOrchestrator = await runDpsScoreBenchmarkOrchestrator(character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions)
      const simulationScore = simulationOrchestrator.simulationScore
      console.log('Percent', simulationScore?.percent)

      if (!simulationScore) return null

      simulationScore.characterMetadata = characterMetadata
      asyncResult.result = simulationScore
      asyncResult.done = true

      setBenchmarkCache(cacheKey, simulationOrchestrator)

      return simulationScore
    } catch (error) {
      console.error('Error in simulation:', error)
      asyncResult.done = true
      throw error
    }
  }

  asyncResult.promise = runSimulation()

  return asyncResult
}

export type SimulationSets = {
  relicSet1: string,
  relicSet2: string,
  ornamentSet: string,
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
  ].filter((x) => x != null)
  const ornamentSets = [
    relicsByPart[Parts.PlanarSphere].set,
    relicsByPart[Parts.LinkRope].set,
  ].filter((x) => x != null)
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
    set: null,
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
