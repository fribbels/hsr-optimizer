import { type TFunction } from 'i18next'
import {
  getArtistName,
  getShowcaseDisplayDimensions,
  getShowcaseMetadata,
  handleTeamSelection,
  resolveScoringType,
} from 'lib/characterPreview/characterPreviewController'
import type {
  ShowcaseDisplayDimensions,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { resolveDpsScoreSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { getCharacterById } from 'lib/stores/character/characterStore'
import type {
  Character,
  SavedBuild,
} from 'types/character'
import type { CustomImageConfig } from 'types/customImage'
import type { SimulationMetadata } from 'types/metadata'

// ===== Layout Resolution (character-dependent, no color) =====

interface ShowcaseLayoutParams {
  character: Character
  teamSelection: string | undefined
  storedScoringType: ScoringType
  savedBuildOverride?: SavedBuild | null
  t: TFunction<'gameData'>
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
  const { character, teamSelection, storedScoringType, savedBuildOverride, t } = params

  const showcaseMetadata = getShowcaseMetadata(character, t)
  const currentSelection = handleTeamSelection(character, teamSelection)
  const simulationMetadata = resolveDpsScoreSimulationMetadata(character, currentSelection, savedBuildOverride)
  const hasSimulation = simulationMetadata != null
  const scoringType = resolveScoringType(storedScoringType, hasSimulation)

  const portraitToUse = getCharacterById(character.id)?.portrait
  const portraitUrl = portraitToUse?.imageUrl ?? Assets.getCharacterPortraitById(character.id)

  const displayDimensions = getShowcaseDisplayDimensions(character, scoringType === ScoringType.COMBAT_SCORE)
  const artistName = getArtistName(character)

  return {
    showcaseMetadata,
    currentSelection,
    simulationMetadata: scoringType === ScoringType.COMBAT_SCORE ? simulationMetadata : null,
    hasSimulation,
    scoringType,
    portraitToUse,
    portraitUrl,
    displayDimensions,
    artistName,
  }
}
