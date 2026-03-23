import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { ShowcaseColorMode } from 'lib/constants/constants'
import type { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import { showcaseCardBackgroundColor, showcaseCardBorderColor } from 'lib/characterPreview/color/colorUtils'
import type { CharacterId } from 'types/character'
import type { ShowcasePreferences } from 'types/metadata'

const STANDARD_COLOR = '#799ef4'
// Intentional change: replaces the old '#000000' fallback. The old black was a timing-hack
// artifact — prevSeedColor ref papered over it by leaking the previous character's color.
// Blue is a better default for the brief window before portrait color extraction completes.
export const DEFAULT_SHOWCASE_COLOR = '#2473e1'

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
  const fallbackColor = characterConfigColor ?? DEFAULT_SHOWCASE_COLOR

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
export function resolveShowcaseTheme(seedColor: string, darkMode: boolean): ShowcaseTheme {
  return {
    cardBackgroundColor: showcaseCardBackgroundColor(seedColor, darkMode),
    cardBorderColor: showcaseCardBorderColor(seedColor, darkMode),
  }
}
