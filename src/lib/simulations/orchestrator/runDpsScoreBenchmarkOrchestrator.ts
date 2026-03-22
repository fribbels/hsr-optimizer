import { CUSTOM_TEAM } from 'lib/constants/constants'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { applyScoringFunction } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoringStore'
import { clone } from 'lib/utils/objectUtils'
import type {
  Character,
  SavedBuild,
} from 'types/character'
import type {
  ScoringMetadata,
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'

/**
 * Prepare phase (steps 1-8): synchronous, ~5ms.
 * Creates an orchestrator, runs setup + baseline + original sim.
 * The orchestrator can then be passed to executeOrchestrator for the expensive async work.
 */
export function prepareOrchestrator(
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): BenchmarkSimulationOrchestrator {
  // Clone metadata because setMetadata() mutates substats, parts, relicSets, ornamentSets in-place.
  const orchestrator = new BenchmarkSimulationOrchestrator(clone(simulationMetadata))

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequestWithRelics(singleRelicByPart)
  orchestrator.setSimSetsWithSimRequest()
  orchestrator.setSimForm(character.form, simulationMetadata)
  orchestrator.setSimContext()
  orchestrator.setFlags()

  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(showcaseTemporaryOptions.spdBenchmark)

  // Apply scoring function now so the preview simScore matches what calculateScores
  // will produce later. This is idempotent — applyScoringFunction reads from
  // result.x (ComputedStatsContainer), not from result.simScore.
  applyScoringFunction(orchestrator.originalSimResult!, orchestrator.metadata, true, true)

  return orchestrator
}

/**
 * Execute phase (steps 9-13): async, ~500-2000ms.
 * Runs the expensive benchmark + perfection search on a prepared orchestrator.
 */
export async function executeOrchestrator(
  orchestrator: BenchmarkSimulationOrchestrator,
): Promise<BenchmarkSimulationOrchestrator> {
  await orchestrator.calculateBenchmark()
  await orchestrator.calculatePerfection()

  orchestrator.calculateScores()
  orchestrator.calculateUpgrades()
  orchestrator.calculateResults()

  return orchestrator
}

export async function runDpsScoreBenchmarkOrchestrator(
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
) {
  const orchestrator = prepareOrchestrator(character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions)
  return executeOrchestrator(orchestrator)
}

export function resolveDpsScoreSimulationMetadata(
  character: Character,
  teamSelection: string,
  buildOverride?: SavedBuild | null,
) {
  const characterId = character.id
  const form = character.form

  if (!character?.id || !form) {
    console.warn('Invalid character sim setup')
    return null
  }

  const customSimulation = clone(getScoringMetadata(characterId).simulation)
  const simulation = clone(getGameMetadata().characters[characterId].scoringMetadata.simulation)

  if (!simulation || !customSimulation) {
    console.log('No scoring sim defined for this character')
    return null
  }

  // Merge any necessary configs from the custom metadata

  simulation.teammates = getTeammates(teamSelection, customSimulation, simulation, buildOverride)
  simulation.deprioritizeBuffs = buildOverride != undefined
    ? buildOverride.deprioritizeBuffs
    : customSimulation.deprioritizeBuffs ?? false

  return simulation
}

function getTeammates(
  teamSelection: string,
  customSimulation: NonNullable<ScoringMetadata['simulation']>,
  defaultSimulation: NonNullable<ScoringMetadata['simulation']>,
  buildOverride?: SavedBuild | null,
): SimulationMetadata['teammates'] {
  if (buildOverride != undefined) {
    return buildOverride.team.map((t) => ({
      characterId: t.characterId,
      lightCone: t.lightConeId,
      characterEidolon: t.eidolon,
      lightConeSuperimposition: t.superimposition,
      teamRelicSet: t.relicSet,
      teamOrnamentSet: t.ornamentSet,
    }))
  }
  if (teamSelection === CUSTOM_TEAM) {
    return customSimulation.teammates ?? defaultSimulation.teammates
  }
  return defaultSimulation.teammates
}
