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
import { DEFAULT_TEAM } from 'lib/constants/constants'
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
  healTeamSelection: string | undefined
  shieldTeamSelection: string | undefined
  storedScoringType: ScoringType
  savedBuildOverride?: SavedBuild | null
  t: TFunction<'gameData'>
}

export interface ShowcaseLayout {
  showcaseMetadata: ShowcaseMetadata
  activeConfigType: ScoringConfigType | undefined
  activeSimulationMetadata: SimulationMetadata | null
  activeTeamSelection: string
  configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>>
  hasSimulation: boolean
  scoringType: ScoringType
  portraitToUse: CustomImageConfig | undefined
  portraitUrl: string
  defaultPortraitUrl: string
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
  const { character, teamSelection, supportTeamSelection, healTeamSelection, shieldTeamSelection, storedScoringType, savedBuildOverride, t } = params

  const showcaseMetadata = getShowcaseMetadata(character, t)
  const scoringMetadata = getScoringMetadata(character.id)

  // Resolve team selections for all config types
  const teamSelections: Record<ScoringConfigType, string> = {
    dps: handleTeamSelection(character, teamSelection),
    buffer: handleTeamSelection(character, supportTeamSelection, 'supportSimulation'),
    heal: handleTeamSelection(character, healTeamSelection, 'healSimulation'),
    shield: handleTeamSelection(character, shieldTeamSelection, 'shieldSimulation'),
  }

  // Resolve simulation metadata for all config types that exist
  const configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>> = {}
  for (const ct of CONFIG_DISPLAY_ORDER) {
    const meta = resolveSimulationMetadata(character, ct, teamSelections[ct], savedBuildOverride)
    if (meta) configMetadata[ct] = meta
  }

  const hasSimulation = CONFIG_DISPLAY_ORDER.some((ct) => {
    const field = CONFIG_FIELD_MAP[ct]
    return scoringMetadata[field] != null
  })

  const scoringType = resolveScoringType(storedScoringType, scoringMetadata)

  const portraitToUse = getCharacterById(character.id)?.portrait
  const defaultPortraitUrl = Assets.getCharacterPortraitById(character.id)
  const portraitUrl = portraitToUse?.imageUrl ?? defaultPortraitUrl

  const displayDimensions = getShowcaseDisplayDimensions(character, isSimScoreMode(scoringType))
  const artistName = getArtistName(character)

  const activeConfigType = SCORING_TYPE_TO_CONFIG[scoringType]
  const activeSimulationMetadata = activeConfigType ? configMetadata[activeConfigType] ?? null : null
  const activeTeamSelection = activeConfigType ? teamSelections[activeConfigType] : DEFAULT_TEAM

  return {
    showcaseMetadata,
    activeConfigType,
    activeSimulationMetadata,
    activeTeamSelection,
    configMetadata,
    hasSimulation,
    scoringType,
    portraitToUse,
    portraitUrl,
    defaultPortraitUrl,
    displayDimensions,
    artistName,
  }
}
