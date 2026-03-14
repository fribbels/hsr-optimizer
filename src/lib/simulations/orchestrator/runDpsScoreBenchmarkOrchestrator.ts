import { CUSTOM_TEAM } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoringStore'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  Character,
  SavedBuild,
} from 'types/character'
import {
  ScoringMetadata,
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'

export async function runDpsScoreBenchmarkOrchestrator(
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
) {
  const orchestrator = new BenchmarkSimulationOrchestrator(simulationMetadata)

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequestWithRelics(singleRelicByPart)
  orchestrator.setSimSetsWithSimRequest()
  orchestrator.setSimForm(character.form, simulationMetadata)
  orchestrator.setSimContext()
  orchestrator.setFlags()

  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(showcaseTemporaryOptions.spdBenchmark)

  await orchestrator.calculateBenchmark()
  await orchestrator.calculatePerfection()

  orchestrator.calculateScores()
  orchestrator.calculateUpgrades()
  orchestrator.calculateResults()

  return orchestrator
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

  const customSimulation = TsUtils.clone(getScoringMetadata(characterId).simulation)
  const simulation = TsUtils.clone(getGameMetadata().characters[characterId].scoringMetadata.simulation)

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
