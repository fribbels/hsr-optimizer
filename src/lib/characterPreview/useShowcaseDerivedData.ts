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
import { getShowcaseSimScoringExecution } from 'lib/scoring/dpsScore'
import { RelicBuild, ScoringType } from 'lib/scoring/simScoringUtils'
import { getCharacterById } from 'lib/stores/characterStore'
import { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import { showcaseCardBackgroundColor, showcaseCardBorderColor } from 'lib/utils/colorUtils'
import { Assets } from 'lib/rendering/assets'
import { MutableRefObject } from 'react'
import { Character, SavedBuild } from 'types/character'
import { ShowcasePreferences, ShowcaseTemporaryOptions } from 'types/metadata'

interface ShowcaseDerivedDataParams {
  character: Character
  prevCharId: MutableRefObject<string | undefined>
  prevSeedColor: MutableRefObject<string>
  teamSelectionByCharacter: Record<string, string>
  showcaseTemporaryOptionsByCharacter: Partial<Record<string, ShowcaseTemporaryOptions>>
  globalShowcasePreferences: Partial<Record<string, ShowcasePreferences>>
  displayRelics: RelicBuild
  storedScoringType: ScoringType
  colorMode: ShowcaseColorMode
  darkMode: boolean
  savedBuildOverride?: SavedBuild | null
}

export function computeShowcaseDerivedData(params: ShowcaseDerivedDataParams) {
  const {
    character,
    prevCharId,
    prevSeedColor,
    teamSelectionByCharacter,
    showcaseTemporaryOptionsByCharacter,
    globalShowcasePreferences,
    displayRelics,
    storedScoringType,
    colorMode,
    darkMode,
    savedBuildOverride,
  } = params

  // ===== Metadata =====

  const showcaseMetadata = getShowcaseMetadata(character)

  // ===== Simulation =====

  const currentSelection = handleTeamSelection(character, prevCharId, teamSelectionByCharacter)
  const showcaseTemporaryOptions = showcaseTemporaryOptionsByCharacter[character.id]
  const asyncSimScoringExecution = getShowcaseSimScoringExecution(
    character,
    displayRelics,
    currentSelection,
    showcaseTemporaryOptions,
    savedBuildOverride,
  )
  const scoringType = resolveScoringType(storedScoringType, asyncSimScoringExecution)

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
        : prevSeedColor.current
    )
    : (
      (overrideColorMode == ShowcaseColorMode.AUTO)
        ? defaultColor
        : (characterShowcasePreferences.color ?? defaultColor)
    )

  prevSeedColor.current = overrideSeedColor

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
    asyncSimScoringExecution,
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
