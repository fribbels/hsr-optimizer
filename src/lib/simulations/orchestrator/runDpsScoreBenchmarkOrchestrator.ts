import { CUSTOM_TEAM } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  Character,
  CharacterId,
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

const cache: Record<string, BenchmarkSimulationOrchestrator> = {}

export function retrieveBenchmarkCache(
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
) {
  const form = character.form

  const cacheKey = TsUtils.objectHash({
    form,
    singleRelicByPart,
    simulationMetadata,
    showcaseTemporaryOptions,
  })

  return {
    cacheKey: cacheKey,
    cachedOrchestrator: cache[cacheKey],
  }
}

export function setBenchmarkCache(cacheKey: string, orchestator: BenchmarkSimulationOrchestrator) {
  cache[cacheKey] = orchestator
}

export function resolveDpsScoreSimulationMetadata(
  character: Character,
  teamSelection: string,
  buildOverride?: SavedBuild | null,
) {
  const characterId = character.id
  const form = character.form

  if (!character?.id || !form) {
    console.log('Invalid character sim setup')
    return null
  }

  const customSimulation = TsUtils.clone(DB.getScoringMetadata(characterId).simulation)
  const simulation = TsUtils.clone(DB.getMetadata().characters[characterId].scoringMetadata.simulation)

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
    return customSimulation.teammates
  }
  return defaultSimulation.teammates
}
