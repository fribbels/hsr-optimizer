import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { ShowcaseColorMode } from 'lib/constants/constants'
import type { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import { oklchCardBackgroundColor, oklchCardBorderColor } from 'lib/characterPreview/color/colorUtilsOklch'
import type { ColorPipelineConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import type { CharacterId } from 'types/character'
import type { ShowcasePreferences } from 'types/metadata'

const STANDARD_COLOR = '#799ef4'
export const DEFAULT_SHOWCASE_COLOR = '#2473e1'
// Placeholder shown while the worker extracts a custom portrait's color.
const CUSTOM_PORTRAIT_PENDING_COLOR = '#6b7280'

interface ResolvedShowcaseColor {
  effectiveColorMode: ShowcaseColorMode
  seedColor: string
}

/**
 * Resolves the effective seed color for a character's showcase card.
 *
 * Resolution order:
 * 1. Global STANDARD mode → fixed blue
 * 2. Per-character CUSTOM mode → saved custom color (with fallback)
 * 3. AUTO mode → portrait-extracted color → character config color → default blue
 */
export function resolveShowcaseColor(
  characterId: CharacterId,
  globalColorMode: ShowcaseColorMode,
  perCharPreferences: ShowcasePreferences | undefined,
  portraitExtractedColor: string | undefined,
  hasCustomPortrait: boolean,
): ResolvedShowcaseColor {
  // Per-character STANDARD is invalid (STANDARD is global-only) — treat as AUTO.
  const savedColorMode = perCharPreferences?.colorMode
  let effectiveColorMode: ShowcaseColorMode
  if (globalColorMode === ShowcaseColorMode.STANDARD) {
    effectiveColorMode = ShowcaseColorMode.STANDARD
  } else if (!savedColorMode || savedColorMode === ShowcaseColorMode.STANDARD) {
    effectiveColorMode = ShowcaseColorMode.AUTO
  } else {
    effectiveColorMode = savedColorMode
  }

  const characterConfigColor = getCharacterConfig(characterId)?.display.showcaseColor
  // Custom portraits use a neutral gray while the worker extracts the real color,
  // since the character's hardcoded showcaseColor doesn't match the custom image.
  const fallbackColor = hasCustomPortrait
    ? CUSTOM_PORTRAIT_PENDING_COLOR
    : characterConfigColor ?? DEFAULT_SHOWCASE_COLOR

  switch (effectiveColorMode) {
    case ShowcaseColorMode.STANDARD:
      return { effectiveColorMode, seedColor: STANDARD_COLOR }
    case ShowcaseColorMode.CUSTOM:
      return { effectiveColorMode, seedColor: perCharPreferences?.color ?? fallbackColor }
    case ShowcaseColorMode.AUTO:
      return { effectiveColorMode, seedColor: portraitExtractedColor ?? fallbackColor }
    default:
      return { effectiveColorMode: ShowcaseColorMode.AUTO, seedColor: portraitExtractedColor ?? fallbackColor }
  }
}

export function resolveShowcaseTheme(seedColor: string, darkMode: boolean, config?: ColorPipelineConfig): ShowcaseTheme {
  return {
    cardBackgroundColor: oklchCardBackgroundColor(seedColor, darkMode, config),
    cardBorderColor: oklchCardBorderColor(seedColor, darkMode, config),
  }
}
