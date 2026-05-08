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
import { DEFAULT_TEAM, type TeamSelection } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { CONFIG_DISPLAY_ORDER, configTypeForScoringType, hasConfig, SCORING_CONFIG_REGISTRY } from 'lib/scoring/scoringConfig'
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
  teamSelections: Partial<Record<ScoringConfigType, TeamSelection>>
  storedScoringType: ScoringType
  savedBuildOverride?: SavedBuild | null
  t: TFunction<'gameData'>
}

export interface ShowcaseLayout {
  showcaseMetadata: ShowcaseMetadata
  activeConfigType: ScoringConfigType | undefined
  activeSimulationMetadata: SimulationMetadata | null
  activeTeamSelection: TeamSelection
  configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>>
  hasSimulation: boolean
  scoringType: ScoringType
  portraitToUse: CustomImageConfig | undefined
  portraitUrl: string
  defaultPortraitUrl: string
  displayDimensions: ShowcaseDisplayDimensions
  artistName: string | undefined
}

export function resolveShowcaseLayout(params: ShowcaseLayoutParams): ShowcaseLayout {
  const { character, teamSelections, storedScoringType, savedBuildOverride, t } = params

  const showcaseMetadata = getShowcaseMetadata(character, t)
  const scoringMetadata = getScoringMetadata(character.id)

  const resolvedTeamSelections: Record<ScoringConfigType, TeamSelection> = {} as Record<ScoringConfigType, TeamSelection>
  for (const configType of CONFIG_DISPLAY_ORDER) {
    const entry = SCORING_CONFIG_REGISTRY[configType]
    resolvedTeamSelections[configType] = handleTeamSelection(character, teamSelections[configType], entry.metadataField)
  }

  const configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>> = {}
  for (const configType of CONFIG_DISPLAY_ORDER) {
    const meta = resolveSimulationMetadata(character, configType, resolvedTeamSelections[configType], savedBuildOverride)
    if (meta) configMetadata[configType] = meta
  }

  const hasSimulation = CONFIG_DISPLAY_ORDER.some((configType) => hasConfig(scoringMetadata, configType))

  const scoringType = resolveScoringType(storedScoringType, scoringMetadata)

  const portraitToUse = getCharacterById(character.id)?.portrait
  const defaultPortraitUrl = Assets.getCharacterPortraitById(character.id)
  const portraitUrl = portraitToUse?.imageUrl ?? defaultPortraitUrl

  const displayDimensions = getShowcaseDisplayDimensions(character, isSimScoreMode(scoringType))
  const artistName = getArtistName(character)

  const activeConfigType = configTypeForScoringType(scoringType)
  const activeSimulationMetadata = activeConfigType ? configMetadata[activeConfigType] ?? null : null
  const activeTeamSelection = activeConfigType ? resolvedTeamSelections[activeConfigType] : DEFAULT_TEAM

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
