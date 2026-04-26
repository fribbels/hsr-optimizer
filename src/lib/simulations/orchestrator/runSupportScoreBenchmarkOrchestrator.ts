import { CUSTOM_TEAM, Sets } from 'lib/constants/constants'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { applyScoringFunction } from 'lib/scoring/simScoringUtils'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { executeOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
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
 * Prepare phase for support score: synchronous, ~5ms.
 * Same as DPS prepare but sets scoringActionKey='BUFF' and resultSort='BUFF'.
 */
export function prepareSupportOrchestrator(
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): BenchmarkSimulationOrchestrator {
  const orchestrator = new BenchmarkSimulationOrchestrator(clone(simulationMetadata))
  orchestrator.scoringActionKey = 'BUFF'

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequestWithRelics(singleRelicByPart)
  orchestrator.setSimSetsWithSimRequest()
  orchestrator.setSimForm(character.form, simulationMetadata)

  // Override resultSort to BUFF after form generation (which defaults to COMBO)
  if (orchestrator.form) {
    orchestrator.form.resultSort = 'BUFF'
    orchestrator.form.setConditionals[Sets.SacerdosRelivedOrdeal][1] = 4
  }

  orchestrator.setSimContext()
  orchestrator.setFlags()

  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(showcaseTemporaryOptions.spdBenchmark)

  applyScoringFunction(orchestrator.originalSimResult!, orchestrator.metadata, true, true, orchestrator.scoringActionKey, orchestrator.context)

  return orchestrator
}

export async function runSupportScoreBenchmarkOrchestrator(
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
) {
  const orchestrator = prepareSupportOrchestrator(character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions)
  return executeOrchestrator(orchestrator)
}

export function resolveSupportScoreSimulationMetadata(
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

  const scoringMetadata: ScoringMetadata = getScoringMetadata(characterId)
  const defaultScoringMetadata: ScoringMetadata = getGameMetadata().characters[characterId]?.scoringMetadata

  const customSimulation = scoringMetadata.supportSimulation
  const defaultSimulation = defaultScoringMetadata?.supportSimulation

  if (!defaultSimulation || !customSimulation) {
    return null
  }

  const simulation = { ...defaultSimulation }

  simulation.teammates = getTeammates(teamSelection, customSimulation, defaultSimulation, buildOverride)
  simulation.deprioritizeBuffs = false

  return simulation as SimulationMetadata
}

function getTeammates(
  teamSelection: string,
  customSimulation: SimulationMetadata,
  defaultSimulation: SimulationMetadata,
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
