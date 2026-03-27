import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { ShowcaseColorMode } from 'lib/constants/constants'
import type { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import { oklchCardBackgroundColor, oklchCardBorderColor } from 'lib/characterPreview/color/colorUtilsOklch'
import type { ColorPipelineConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import type { CharacterId } from 'types/character'
import type { ShowcasePreferences } from 'types/metadata'

const STANDARD_COLOR = '#799ef4'
export const DEFAULT_SHOWCASE_COLOR = '#2473e1'
// Neutral gray for custom portraits while the worker extracts the real color.
// The CSS transition (background-color 0.35s) animates smoothly from gray → extracted color.
const CUSTOM_PORTRAIT_PENDING_COLOR = '#6b7280'

interface ResolvedShowcaseColor {
  effectiveColorMode: ShowcaseColorMode
  seedColor: string
}

/**
 * Pure function that resolves the effective color for a character's showcase card.
 *
 * Resolution order:
 * 1. Global STANDARD mode overrides everything → fixed blue
 * 2. Per-character CUSTOM mode → saved custom color (with fallback)
 * 3. AUTO mode → portrait-extracted color → character config color → default blue
 *
 * No refs, no module-level caches, no side effects.
 */
export function resolveShowcaseColor(
  characterId: CharacterId,
  globalColorMode: ShowcaseColorMode,
  perCharPreferences: ShowcasePreferences | undefined,
  portraitExtractedColor: string | undefined,
  hasCustomPortrait?: boolean,
): ResolvedShowcaseColor {
  // Resolve effective mode: global STANDARD overrides, otherwise use per-character preference.
  // Guard: per-character STANDARD is invalid (STANDARD is global-only). Treat as AUTO.
  const savedColorMode = perCharPreferences?.colorMode
  const effectiveColorMode = globalColorMode === ShowcaseColorMode.STANDARD
    ? ShowcaseColorMode.STANDARD
    : (!savedColorMode || savedColorMode === ShowcaseColorMode.STANDARD)
      ? ShowcaseColorMode.AUTO
      : savedColorMode

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
  }
}

/**
 * Derives the card theme (background + border colors) from a seed color and dark mode flag.
 */
export function resolveShowcaseTheme(seedColor: string, darkMode: boolean, config?: ColorPipelineConfig): ShowcaseTheme {
  return {
    cardBackgroundColor: oklchCardBackgroundColor(seedColor, darkMode, config),
    cardBorderColor: oklchCardBorderColor(seedColor, darkMode, config),
  }
}
