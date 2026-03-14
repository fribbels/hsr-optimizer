import {
  getArtistName,
  getShowcaseDisplayDimensions,
  getShowcaseMetadata,
  handleTeamSelection,
  resolveScoringType,
  ShowcaseDisplayDimensions,
} from 'lib/characterPreview/characterPreviewController'
import {
  defaultShowcasePreferences,
  getDefaultColor,
  getOverrideColorMode,
  standardShowcasePreferences,
  urlToColorCache,
} from 'lib/characterPreview/ShowcaseCustomizationSidebar'
import { ShowcaseColorMode } from 'lib/constants/constants'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { resolveDpsScoreSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { getCharacterById } from 'lib/stores/characterStore'
import { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import { showcaseCardBackgroundColor, showcaseCardBorderColor } from 'lib/utils/colorUtils'
import { Assets } from 'lib/rendering/assets'
import { Character, SavedBuild } from 'types/character'
import { ShowcasePreferences, ShowcaseTemporaryOptions } from 'types/metadata'

interface ShowcaseVisualDataParams {
  character: Character
  prevSeedColor: string
  teamSelectionByCharacter: Record<string, string>
  globalShowcasePreferences: Partial<Record<string, ShowcasePreferences>>
  storedScoringType: ScoringType
  colorMode: ShowcaseColorMode
  darkMode: boolean
  savedBuildOverride?: SavedBuild | null
}

export function computeShowcaseVisualData(params: ShowcaseVisualDataParams) {
  const {
    character,
    prevSeedColor,
    teamSelectionByCharacter,
    globalShowcasePreferences,
    storedScoringType,
    colorMode,
    darkMode,
    savedBuildOverride,
  } = params

  // ===== Metadata =====

  const showcaseMetadata = getShowcaseMetadata(character)

  // ===== Team selection + simulation metadata (no scoring execution) =====

  const currentSelection = handleTeamSelection(character, teamSelectionByCharacter)
  const simulationMetadata = resolveDpsScoreSimulationMetadata(character, currentSelection, savedBuildOverride)
  const hasSimulation = simulationMetadata != null
  const scoringType = resolveScoringType(storedScoringType, hasSimulation)

  // ===== Portrait =====

  const portraitToUse = getCharacterById(character?.id)?.portrait ?? undefined
  const portraitUrl = portraitToUse?.imageUrl ?? Assets.getCharacterPortraitById(character.id)

  // ===== Color =====

  const defaultColor = getDefaultColor(character.id, portraitUrl, colorMode)

  const characterShowcasePreferences = colorMode == ShowcaseColorMode.STANDARD
    ? standardShowcasePreferences()
    : globalShowcasePreferences[character.id] ?? defaultShowcasePreferences(defaultColor)

  const overrideColorMode = getOverrideColorMode(colorMode, globalShowcasePreferences as Record<string, ShowcasePreferences>, character)

  const overrideSeedColor = portraitToUse
    ? (
      urlToColorCache[portraitUrl]
        ? (overrideColorMode == ShowcaseColorMode.AUTO)
          ? defaultColor
          : (characterShowcasePreferences.color ?? defaultColor)
        : prevSeedColor
    )
    : (
      (overrideColorMode == ShowcaseColorMode.AUTO)
        ? defaultColor
        : (characterShowcasePreferences.color ?? defaultColor)
    )

  // ===== Theme =====

  const derivedShowcaseTheme: ShowcaseTheme = {
    cardBackgroundColor: showcaseCardBackgroundColor(overrideSeedColor, darkMode),
    cardBorderColor: showcaseCardBorderColor(overrideSeedColor, darkMode),
  }

  // ===== Display =====

  const displayDimensions: ShowcaseDisplayDimensions = getShowcaseDisplayDimensions(character, scoringType == ScoringType.COMBAT_SCORE)
  const artistName = getArtistName(character)

  return {
    showcaseMetadata,
    currentSelection,
    simulationMetadata,
    hasSimulation,
    scoringType,
    portraitToUse,
    portraitUrl,
    characterShowcasePreferences,
    overrideColorMode,
    overrideSeedColor,
    derivedShowcaseTheme,
    displayDimensions,
    artistName,
  }
}
