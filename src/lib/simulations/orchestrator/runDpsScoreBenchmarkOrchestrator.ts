import { CUSTOM_TEAM } from 'lib/constants/constants'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { applyScoringFunction } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { clone } from 'lib/utils/objectUtils'
import type { Character } from 'types/character'
import type { SavedBuild } from 'types/savedBuild'
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
  onScoreReady?: () => void,
): Promise<BenchmarkSimulationOrchestrator> {
  // JSON clone strips closures (conditional registries, controllers) that
  // postMessage's structured clone can't handle. The worker rebuilds them
  // via initializeContextConditionals. Also flattens Float32Arrays to plain
  // objects, which the worker reconstructs.
  const clonedContext = clone(orchestrator.context!)

  await orchestrator.calculateBenchmark(clonedContext)
  await orchestrator.calculatePerfection(clonedContext)

  orchestrator.calculateScores()
  // Initialize empty upgrades so the early SimulationScore is structurally valid
  // (upgrade tables may render before calculateUpgrades completes)
  orchestrator.substatUpgradeResults ??= []
  orchestrator.setUpgradeResults ??= []
  orchestrator.mainUpgradeResults ??= []
  orchestrator.calculateResults()
  onScoreReady?.()

  // Yield to browser before computing upgrades (~42ms of synchronous simulations)
  await new Promise((r) => setTimeout(r, 0))
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

  const customSimulation = getScoringMetadata(characterId).simulation
  const defaultSimulation = getGameMetadata().characters[characterId].scoringMetadata.simulation

  if (!defaultSimulation || !customSimulation) {
    console.log('No scoring sim defined for this character')
    return null
  }

  // Shallow copy — only .teammates and .deprioritizeBuffs are reassigned
  const simulation = { ...defaultSimulation }

  simulation.teammates = getTeammates(teamSelection, customSimulation, defaultSimulation, buildOverride)
  simulation.deprioritizeBuffs = buildOverride != undefined && 'deprioritizeBuffs' in buildOverride
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
    const teammates: SimulationMetadata['teammates'] = []
    for (const t of buildOverride.team) {
      if (t == null) continue
      teammates.push({
        characterId: t.characterId,
        lightCone: t.lightCone,
        characterEidolon: t.characterEidolon,
        lightConeSuperimposition: t.lightConeSuperimposition,
        teamRelicSet: t.teamRelicSet,
        teamOrnamentSet: t.teamOrnamentSet,
      })
    }
    return teammates
  }
  if (teamSelection === CUSTOM_TEAM) {
    return customSimulation.teammates ?? defaultSimulation.teammates
  }
  return defaultSimulation.teammates
}
