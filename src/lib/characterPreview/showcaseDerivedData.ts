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
import { CONFIG_DISPLAY_ORDER, CONFIG_FIELD_MAP } from 'lib/scoring/scoringConfig'
import { isSimScoreMode, ScoringType } from 'lib/scoring/simScoringUtils'
import { resolveSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { getCharacterById } from 'lib/stores/character/characterStore'
import type {
  Character,
  SavedBuild,
} from 'types/character'
import type { CustomImageConfig } from 'types/customImage'
import type { ScoringConfigType, SimulationMetadata } from 'types/metadata'

// ===== Layout Resolution (character-dependent, no color) =====

interface ShowcaseLayoutParams {
  character: Character
  teamSelection: string | undefined
  supportTeamSelection: string | undefined
  storedScoringType: ScoringType
  savedBuildOverride?: SavedBuild | null
  t: TFunction<'gameData'>
}

export interface ShowcaseLayout {
  showcaseMetadata: ShowcaseMetadata
  currentSelection: string
  supportCurrentSelection: string
  simulationMetadata: SimulationMetadata | null
  supportSimulationMetadata: SimulationMetadata | null
  hasSimulation: boolean
  scoringType: ScoringType
  portraitToUse: CustomImageConfig | undefined
  portraitUrl: string
  displayDimensions: ShowcaseDisplayDimensions
  artistName: string | undefined
}

// Maps ScoringType enum values to their configType
const SCORING_TYPE_TO_CONFIG: Partial<Record<ScoringType, ScoringConfigType>> = {
  [ScoringType.DPS_SCORE]: 'dps',
  [ScoringType.BUFFER_SCORE]: 'buffer',
  [ScoringType.HEAL_SCORE]: 'heal',
  [ScoringType.SHIELD_SCORE]: 'shield',
}

export function resolveShowcaseLayout(params: ShowcaseLayoutParams): ShowcaseLayout {
  const { character, teamSelection, supportTeamSelection, storedScoringType, savedBuildOverride, t } = params

  const showcaseMetadata = getShowcaseMetadata(character, t)
  const scoringMetadata = getScoringMetadata(character.id)

  // Resolve team selections for DPS and buffer (existing behavior)
  const currentSelection = handleTeamSelection(character, teamSelection)
  const supportCurrentSelection = handleTeamSelection(character, supportTeamSelection, 'supportSimulation')

  // Resolve simulation metadata for DPS and buffer using their team selections
  const dpsSimMetadata = resolveSimulationMetadata(character, 'dps', currentSelection, savedBuildOverride)
  const bufferSimMetadata = resolveSimulationMetadata(character, 'buffer', supportCurrentSelection, savedBuildOverride)

  const hasSimulation = CONFIG_DISPLAY_ORDER.some((ct) => {
    const field = CONFIG_FIELD_MAP[ct]
    return scoringMetadata[field] != null
  })

  const scoringType = resolveScoringType(storedScoringType, scoringMetadata)

  const portraitToUse = getCharacterById(character.id)?.portrait
  const portraitUrl = portraitToUse?.imageUrl ?? Assets.getCharacterPortraitById(character.id)

  const displayDimensions = getShowcaseDisplayDimensions(character, isSimScoreMode(scoringType))
  const artistName = getArtistName(character)

  // Determine active config type from scoring type
  const activeConfigType = SCORING_TYPE_TO_CONFIG[scoringType]

  return {
    showcaseMetadata,
    currentSelection,
    supportCurrentSelection,
    simulationMetadata: activeConfigType === 'dps' ? dpsSimMetadata : null,
    supportSimulationMetadata: activeConfigType === 'buffer' ? bufferSimMetadata : null,
    hasSimulation,
    scoringType,
    portraitToUse,
    portraitUrl,
    displayDimensions,
    artistName,
  }
}
