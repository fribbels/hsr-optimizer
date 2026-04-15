import {
  MainStatPartsArray,
  SubStats,
} from 'lib/constants/constants'
import type { MainStats } from 'lib/constants/constants'
import { arraysShallowEqual } from 'lib/utils/arrayUtils'
import { clone } from 'lib/utils/objectUtils'
import type {
  ScoringMetadata,
  ScoringMetadataOverride,
  ScoringParts,
  SimulationMetadata,
} from 'types/metadata'

// ─── Delta Extraction ────────────────────────────────────────────

/**
 * Extract only stats that differ from defaults.
 * Returns undefined if no stats differ.
 */
export function extractStatsDelta(
  stats: Partial<Record<SubStats, number>> | undefined,
  defaults: Record<SubStats, number>,
): Partial<Record<SubStats, number>> | undefined {
  if (!stats) return undefined

  const delta: Partial<Record<SubStats, number>> = {}

  // Iterate over known SubStats only (not Object.entries) to avoid garbage keys
  for (const stat of SubStats) {
    const value = stats[stat]
    // Skip non-numeric values (empty strings from form display, undefined, null)
    if (typeof value !== 'number') continue

    const defaultValue = defaults[stat] ?? 0
    if (value !== defaultValue) {
      delta[stat] = value
    }
  }

  return Object.keys(delta).length > 0 ? delta : undefined
}

/**
 * Extract only parts that differ from defaults.
 * Returns undefined if no parts differ.
 */
export function extractPartsDelta(
  parts: Partial<Record<ScoringParts, MainStats[]>> | undefined,
  defaults: Record<ScoringParts, MainStats[]>,
): Partial<Record<ScoringParts, MainStats[]>> | undefined {
  if (!parts) return undefined

  const delta: Partial<Record<ScoringParts, MainStats[]>> = {}

  for (const part of MainStatPartsArray) {
    const value = parts[part]
    if (value === undefined) continue

    if (!arraysShallowEqual(value, defaults[part])) {
      delta[part] = value
    }
  }

  return Object.keys(delta).length > 0 ? delta : undefined
}

// ─── Delta Merging ───────────────────────────────────────────────

/**
 * Merge delta override onto defaults to produce full ScoringMetadata.
 * Works for both old full-snapshots AND new delta format.
 */
export function mergeDeltaWithDefaults(
  override: ScoringMetadataOverride | undefined,
  defaults: ScoringMetadata,
): ScoringMetadata {
  const result = clone(defaults)

  // Overlay stats (works for full-snapshot or delta)
  if (override?.stats) {
    for (const stat of SubStats) {
      const value = override.stats[stat]
      // Only overlay numeric values (skip empty strings from old saves)
      if (typeof value === 'number') {
        result.stats[stat] = value
      }
    }
  }

  // Overlay parts
  if (override?.parts) {
    for (const part of MainStatPartsArray) {
      const value = override.parts[part]
      if (value !== undefined) {
        result.parts[part] = value
      }
    }
  }

  // Deep-merge simulation
  if (override?.simulation && defaults.simulation) {
    result.simulation = { ...clone(defaults.simulation), ...override.simulation } as SimulationMetadata
  } else if (override?.simulation) {
    result.simulation = clone(override.simulation) as SimulationMetadata // Clone to avoid shared reference
  }

  // Traces: full replacement
  if (override?.traces) {
    result.traces = override.traces
  }

  // Ensure all SubStats have numeric values (catch empty strings, null, undefined)
  for (const stat of SubStats) {
    if (typeof result.stats[stat] !== 'number') {
      result.stats[stat] = 0
    }
  }

  // Derive modified flag from override existence (replaces setModifiedScoringMetadata)
  result.modified = !!(override?.stats && Object.keys(override.stats).length > 0)

  return result
}

// ─── Store Update Helper ─────────────────────────────────────────

/**
 * Merge incoming update with existing override, prune to delta.
 * Returns undefined if result has no content (should remove override).
 */
export function mergeAndPruneOverride(
  existing: ScoringMetadataOverride | undefined,
  update: Partial<ScoringMetadataOverride>,
  defaults: ScoringMetadata,
): ScoringMetadataOverride | undefined {
  // Merge stats (not replace)
  const mergedStats = { ...existing?.stats, ...update.stats }
  const prunedStats = extractStatsDelta(mergedStats, defaults.stats)

  // Merge parts (not replace)
  const mergedParts = { ...existing?.parts, ...update.parts }
  const prunedParts = extractPartsDelta(mergedParts, defaults.parts)

  // Build result
  const result: ScoringMetadataOverride = {}

  if (prunedStats) result.stats = prunedStats
  if (prunedParts) result.parts = prunedParts
  if (update.simulation !== undefined) {
    result.simulation = update.simulation
  } else if (existing?.simulation) {
    result.simulation = existing.simulation
  }
  if (update.traces !== undefined) {
    result.traces = update.traces
  } else if (existing?.traces) {
    result.traces = existing.traces
  }

  // Check if result has any content
  const hasContent = result.stats || result.parts || result.simulation || result.traces
  return hasContent ? result : undefined
}

// ─── On-Load Prune (Replaces Migration) ──────────────────────────

/**
 * Prune all overrides to delta format on load.
 * Uses same logic as write path - no separate migration code.
 * Returns pruned overrides and whether anything changed.
 */
export function pruneOverridesOnLoad(
  overrides: Record<string, ScoringMetadataOverride>,
  getDefaults: (id: string) => ScoringMetadata | undefined,
): { result: Record<string, ScoringMetadataOverride>, changed: boolean } {
  const result: Record<string, ScoringMetadataOverride> = {}
  let changed = false

  for (const [id, override] of Object.entries(overrides)) {
    try {
      const defaults = getDefaults(id)
      if (!defaults) continue // Skip orphaned characters

      // Prune to delta using same functions as write path
      const prunedStats = extractStatsDelta(override.stats, defaults.stats)
      const prunedParts = extractPartsDelta(override.parts, defaults.parts)

      // Check if pruning removed any keys (compare key counts since extract functions create new objects)
      const statsKeysBefore = override.stats ? Object.keys(override.stats).length : 0
      const statsKeysAfter = prunedStats ? Object.keys(prunedStats).length : 0
      const partsKeysBefore = override.parts ? Object.keys(override.parts).length : 0
      const partsKeysAfter = prunedParts ? Object.keys(prunedParts).length : 0

      if (statsKeysAfter !== statsKeysBefore || partsKeysAfter !== partsKeysBefore) {
        changed = true
      }

      // Build pruned override
      const pruned: ScoringMetadataOverride = {}
      if (prunedStats) pruned.stats = prunedStats
      if (prunedParts) pruned.parts = prunedParts
      if (override.simulation) pruned.simulation = override.simulation
      if (override.traces) pruned.traces = override.traces

      // Only store if has content
      const hasContent = pruned.stats || pruned.parts || pruned.simulation || pruned.traces
      if (hasContent) {
        result[id] = pruned
      } else {
        changed = true // Entire override removed
      }
    } catch (e) {
      console.error(`Prune failed for character ${id}`, e)
      result[id] = override // Keep original on error
    }
  }

  return { result, changed }
}
