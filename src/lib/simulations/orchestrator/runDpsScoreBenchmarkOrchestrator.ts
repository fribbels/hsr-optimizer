import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { CUSTOM_TEAM, Sets, type TeamSelection } from 'lib/constants/constants'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import type { SortOptionKey } from 'lib/optimization/sortOptions'
import { ComboType } from 'lib/optimization/rotation/comboType'
import { NULL_TURN_ABILITY_NAME } from 'lib/optimization/rotation/turnAbilityConfig'
import { CONFIG_FIELD_MAP, SCORING_CONFIG_REGISTRY } from 'lib/scoring/scoringConfig'
import { applyScoringFunction } from 'lib/scoring/simScoringUtils'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { clone } from 'lib/utils/objectUtils'
import type { Character } from 'types/character'
import {
  ScoringConfigType,
  type ScoringConfig,
  type ScoringMetadata,
  type ShowcaseTemporaryOptions,
  type SimulationMetadata,
} from 'types/metadata'
import type { SavedBuild } from 'types/savedBuild'

/**
 * Prepare phase (steps 1-8): synchronous, ~5ms.
 * Creates an orchestrator, runs setup + baseline + original sim.
 * The orchestrator can then be passed to executeOrchestrator for the expensive async work.
 *
 * Unified for all scoring config types (DPS, buffer, heal, shield).
 */
export function prepareOrchestrator(
  character: Character,
  config: ScoringConfig,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): BenchmarkSimulationOrchestrator {
  // Clone metadata because setMetadata() mutates substats, parts, relicSets, ornamentSets in-place.
  const orchestrator = new BenchmarkSimulationOrchestrator(clone(config.simulation))

  // Set scoring action key (buffer only — DPS/heal/shield use COMBO registers)
  orchestrator.scoringActionKey = config.scoringActionKey
  orchestrator.configType = config.configType

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequestWithRelics(singleRelicByPart)
  orchestrator.setSimSetsWithSimRequest()
  orchestrator.setCandidateSetPool()
  orchestrator.setSimForm(character.form, config.simulation)

  // Override resultSort based on config type
  const entry = SCORING_CONFIG_REGISTRY[config.configType]
  if (config.scoringActionKey) {
    orchestrator.form!.resultSort = config.scoringActionKey as SortOptionKey
  } else if (entry.resultSortKey) {
    orchestrator.form!.resultSort = entry.resultSortKey
  }

  // Override comboTurnAbilities from the active config's simulation.
  if (config.simulation.comboTurnAbilities) {
    orchestrator.form!.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, ...config.simulation.comboTurnAbilities]
    orchestrator.form!.comboType = ComboType.ADVANCED
  }

  // Buffer-specific: force Sacerdos 4p
  if (config.configType === ScoringConfigType.BUFFER) {
    orchestrator.form!.setConditionals[Sets.SacerdosRelivedOrdeal][1] = 4
  }

  orchestrator.setSimContext()
  orchestrator.setFlags()

  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(showcaseTemporaryOptions.spdBenchmark)
  orchestrator.precomputePoolState()

  // RES equalization for non-DPS types (healers/shielders often invest in RES)
  if (entry.applyResEqualization) {
    orchestrator.applyBasicResTargetFlag()
  }

  // Apply scoring function now so the preview simScore matches what calculateScores
  // will produce later. This is idempotent — applyScoringFunction reads from
  // result.x (ComputedStatsContainer), not from result.simScore.
  applyScoringFunction(
    orchestrator.originalSimResult!,
    orchestrator.metadata,
    true,
    true,
    orchestrator.scoringActionKey,
    orchestrator.context,
    config.configType,
  )

  return orchestrator
}

/**
 * Execute phase (steps 9-13): async, ~500-2000ms.
 * Runs the expensive benchmark + perfection search on a prepared orchestrator.
 */
export async function executeOrchestrator(
  orchestrator: BenchmarkSimulationOrchestrator,
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
  character: Character,
  configType: ScoringConfigType,
  teamSelection: TeamSelection,
  buildOverride?: SavedBuild | null,
): SimulationMetadata | null {
  const characterId = character.id
  if (!character?.id || !character.form) {
    console.warn('Invalid character sim setup')
    return null
  }

  const field = CONFIG_FIELD_MAP[configType]
  const customSimulation = getScoringMetadata(characterId)[field]
  const defaultSimulation = getGameMetadata().characters[characterId]?.scoringMetadata[field]

  if (!defaultSimulation || !customSimulation) {
    return null
  }

  const simulation = { ...defaultSimulation }
  simulation.teammates = getTeammates(teamSelection, customSimulation, defaultSimulation, buildOverride)

  // deprioritizeBuffs is DPS-only — always false for non-DPS
  if (SCORING_CONFIG_REGISTRY[configType].supportsDeprioritizeBuffs) {
    simulation.deprioritizeBuffs = buildOverride != undefined && 'deprioritizeBuffs' in buildOverride
      ? buildOverride.deprioritizeBuffs
      : customSimulation.deprioritizeBuffs ?? false
  } else {
    simulation.deprioritizeBuffs = false
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
