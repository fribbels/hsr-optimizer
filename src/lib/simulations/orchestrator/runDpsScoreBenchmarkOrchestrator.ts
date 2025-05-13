import { CUSTOM_TEAM } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { Character } from 'types/character'
import { ShowcaseTemporaryOptions, SimulationMetadata } from 'types/metadata'

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
  orchestrator.setSimForm(character.form)
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
) {
  const characterId = character.id
  const form = character.form

  if (!character?.id || !form) {
    console.log('Invalid character sim setup')
    return null
  }

  const customScoringMetadata = TsUtils.clone(DB.getScoringMetadata(characterId))
  const defaultScoringMetadata = TsUtils.clone(DB.getMetadata().characters[characterId].scoringMetadata)

  if (!defaultScoringMetadata?.simulation || !customScoringMetadata?.simulation) {
    console.log('No scoring sim defined for this character')
    return null
  }

  // Merge any necessary configs from the custom metadata

  const metadata = defaultScoringMetadata.simulation
  metadata.teammates = teamSelection == CUSTOM_TEAM ? customScoringMetadata.simulation.teammates : defaultScoringMetadata.simulation.teammates
  metadata.deprioritizeBuffs = customScoringMetadata.simulation.deprioritizeBuffs ?? false

  return metadata
}
