import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import {
  CUSTOM_TEAM,
  type TeamSelection,
} from 'lib/constants/constants'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import {
  CONFIG_FIELD_MAP,
  SCORING_CONFIG_REGISTRY,
} from 'lib/scoring/scoringConfig'
import { applyScoringFunction } from 'lib/scoring/simScoringUtils'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import type { ComputeOptimalSimulationSearchRunner } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { clone } from 'lib/utils/objectUtils'
import type { Character, CharacterId } from 'types/character'
import {
  type ScoringConfig,
  ScoringConfigType,
  type ScoringMetadata,
  type ShowcaseTemporaryOptions,
  type SimulationMetadata,
} from 'types/metadata'
import type { BasicForm } from 'types/optimizer'
import {
  BuildSource,
  type SavedBuild,
} from 'types/savedBuild'

/**
 * Prepare phase (steps 1-8): synchronous, ~5ms.
 * Creates an orchestrator, runs setup + baseline + original sim.
 * The orchestrator can then be passed to executeOrchestrator for the expensive async work.
 *
 * Unified for all scoring config types (DPS, buffer, heal, shield).
 */
export function prepareOrchestrator(
  character: { form: BasicForm },
  config: ScoringConfig,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): BenchmarkSimulationOrchestrator {
  // Clone metadata because setMetadata() mutates substats, parts, relicSets, ornamentSets in-place.
  const orchestrator = new BenchmarkSimulationOrchestrator(clone(config.simulation))

  orchestrator.configType = config.configType

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequestWithRelics(singleRelicByPart)
  orchestrator.setSimSetsWithSimRequest()
  orchestrator.setCandidateSetPool()
  orchestrator.setSimForm(character.form)
  orchestrator.applyConfigOverrides(config)

  orchestrator.setSimContext()
  orchestrator.setFlags()

  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(showcaseTemporaryOptions.spdBenchmark)
  orchestrator.applyResEqualization()
  orchestrator.precomputePoolState()

  // Apply scoring function now so the preview simScore matches what calculateScores
  // will produce later. This is idempotent — applyScoringFunction reads from
  // result.x (ComputedStatsContainer), not from result.simScore.
  applyScoringFunction(
    orchestrator.originalSimResult!,
    orchestrator.metadata,
    true,
    true,
    orchestrator.context!,
    config.configType,
  )

  return orchestrator
}

export type ExecuteOrchestratorOptions = {
  searchRunner?: ComputeOptimalSimulationSearchRunner
  scoreOnly?: boolean
}

/**
 * Execute phase (steps 9-13): async, ~500-2000ms.
 * Runs the expensive benchmark + perfection search on a prepared orchestrator.
 */
export async function executeOrchestrator(
  orchestrator: BenchmarkSimulationOrchestrator,
  options: ExecuteOrchestratorOptions = {},
): Promise<BenchmarkSimulationOrchestrator> {
  // JSON clone strips closures (conditional registries, controllers) that
  // postMessage's structured clone can't handle. The worker rebuilds them
  // via initializeContextConditionals. Also flattens Float32Arrays to plain
  // objects, which the worker reconstructs.
  const clonedContext = clone(orchestrator.context!)

  const searchRunner = options.searchRunner
  const searchOptions = { scoreOnly: options.scoreOnly ?? false }
  await orchestrator.calculateBenchmark(clonedContext, searchRunner, searchOptions)
  await orchestrator.calculatePerfection(clonedContext, searchRunner, searchOptions)

  orchestrator.calculateScores()
  if (options.scoreOnly) return orchestrator

  // Initialize empty upgrades so the early SimulationScore is structurally valid
  // (upgrade tables may render before calculateUpgrades completes)
  orchestrator.substatUpgradeResults ??= []
  orchestrator.setUpgradeResults ??= []
  orchestrator.mainUpgradeResults ??= []
  orchestrator.teammateOrnamentUpgradeResults ??= []
  orchestrator.calculateResults()

  return orchestrator
}

export async function executeUpgradeOrchestrator(orchestrator: BenchmarkSimulationOrchestrator) {
  orchestrator.calculateUpgrades()
  orchestrator.calculateTeammateUpgrades()
  orchestrator.calculateResults()

  return orchestrator
}

export async function runDpsScoreBenchmarkOrchestrator(
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
) {
  const config: ScoringConfig = { configType: ScoringConfigType.DPS, simulation: simulationMetadata }
  const orchestrator = prepareOrchestrator(character, config, singleRelicByPart, showcaseTemporaryOptions)
  return executeOrchestrator(orchestrator)
}

export function resolveSimulationMetadata(
  character: { id: CharacterId, form: BasicForm },
  configType: ScoringConfigType,
  teamSelection: TeamSelection,
  buildOverride?: SavedBuild | null,
): SimulationMetadata | null {
  if (!character?.id || !character.form) {
    console.warn('Invalid character sim setup')
    return null
  }
  const characterId = character.id

  const field = CONFIG_FIELD_MAP[configType]
  const customSimulation = getScoringMetadata(characterId)[field]
  const defaultSimulation = getGameMetadata().characters[characterId]?.scoringMetadata[field]

  if (!defaultSimulation || !customSimulation) {
    return null
  }

  const simulation = { ...defaultSimulation }
  simulation.teammates = getTeammates(teamSelection, customSimulation, defaultSimulation, buildOverride)

  // Non-DPS scoring always deprioritizes teammate buffs to isolate the support's own contribution
  if (SCORING_CONFIG_REGISTRY[configType].supportsDeprioritizeBuffs) {
    simulation.deprioritizeBuffs = buildOverride?.source === BuildSource.Optimizer
      ? buildOverride.deprioritizeBuffs
      : customSimulation.deprioritizeBuffs ?? false
  } else {
    simulation.deprioritizeBuffs = true
  }

  return simulation
}

export function getTeammates(
  teamSelection: TeamSelection,
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
