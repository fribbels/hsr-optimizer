import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'

/**
 * Dev utility: exports all current showcase color picks as a characterId → color map.
 * Includes both manually picked (CUSTOM) colors from showcasePreferences and
 * auto-extracted portrait colors.
 *
 * Usage: window.__HSR_DEBUG.exportShowcaseColors() from the console
 */
export function exportShowcaseColors() {
  const { showcasePreferences, portraitColorByCharacterId } = useShowcaseTabStore.getState()

  const result: Record<string, string> = {}

  // Custom picks take priority
  for (const [charId, prefs] of Object.entries(showcasePreferences)) {
    if (prefs.color) {
      result[charId] = prefs.color
    }
  }

  // Fill in auto-extracted portrait colors for characters without a custom pick
  for (const [charId, color] of Object.entries(portraitColorByCharacterId)) {
    if (!result[charId] && color) {
      result[charId] = color
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b)),
  )

  console.log(`[exportShowcaseColors] ${Object.keys(sorted).length} colors:`)
  console.log(JSON.stringify(sorted, null, 2))
  return sorted
}
