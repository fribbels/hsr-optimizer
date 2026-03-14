import {
  getArtistName,
  getShowcaseDisplayDimensions,
  getShowcaseMetadata,
  handleTeamSelection,
  resolveScoringType,
  ShowcaseDisplayDimensions,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { resolveDpsScoreSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { getCharacterById } from 'lib/stores/characterStore'
import { Assets } from 'lib/rendering/assets'
import { Character, SavedBuild } from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { SimulationMetadata } from 'types/metadata'

// ===== Layout Resolution (character-dependent, no color) =====

interface ShowcaseLayoutParams {
  character: Character
  teamSelectionByCharacter: Record<string, string>
  storedScoringType: ScoringType
  savedBuildOverride?: SavedBuild | null
}

export interface ShowcaseLayout {
  showcaseMetadata: ShowcaseMetadata
  currentSelection: string
  simulationMetadata: SimulationMetadata | null
  hasSimulation: boolean
  scoringType: ScoringType
  portraitToUse: CustomImageConfig | undefined
  portraitUrl: string
  displayDimensions: ShowcaseDisplayDimensions
  artistName: string | undefined
}

export function resolveShowcaseLayout(params: ShowcaseLayoutParams): ShowcaseLayout {
  const { character, teamSelectionByCharacter, storedScoringType, savedBuildOverride } = params

  const showcaseMetadata = getShowcaseMetadata(character)
  const currentSelection = handleTeamSelection(character, teamSelectionByCharacter)
  const simulationMetadata = resolveDpsScoreSimulationMetadata(character, currentSelection, savedBuildOverride)
  const hasSimulation = simulationMetadata != null
  const scoringType = resolveScoringType(storedScoringType, hasSimulation)

  const portraitToUse = getCharacterById(character.id)?.portrait ?? undefined
  const portraitUrl = portraitToUse?.imageUrl ?? Assets.getCharacterPortraitById(character.id)

  const displayDimensions = getShowcaseDisplayDimensions(character, scoringType == ScoringType.COMBAT_SCORE)
  const artistName = getArtistName(character)

  return {
    showcaseMetadata,
    currentSelection,
    simulationMetadata,
    hasSimulation,
    scoringType,
    portraitToUse,
    portraitUrl,
    displayDimensions,
    artistName,
  }
}
