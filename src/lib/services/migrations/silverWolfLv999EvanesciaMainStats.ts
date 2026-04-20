// One-time migration (2026-04-20, lift ~2026-06-20). Unblocks users with pre-fix snapshot
// overrides for SilverWolfLv999 (1506) / Evanescia (1505) by unioning saved parts with
// current defaults. `[]` (allow-all) is absorbing in the union.
import {
  MainStatPartsArray,
  type MainStats,
} from 'lib/constants/constants'
import { arraysShallowEqual } from 'lib/utils/arrayUtils'
import type {
  ScoringMetadata,
  ScoringMetadataOverride,
  ScoringParts,
} from 'types/metadata'

const TARGET_IDS = ['1505', '1506'] as const // Evanescia, SilverWolfLv999

export function migrateSilverWolfLv999EvanesciaMainStats(
  overrides: Record<string, ScoringMetadataOverride>,
  getDefaults: (id: string) => ScoringMetadata | undefined,
): Record<string, ScoringMetadataOverride> {
  const result = { ...overrides }

  for (const id of TARGET_IDS) {
    try {
      const override = result[id]
      if (!override?.parts) continue

      const defaults = getDefaults(id)
      if (!defaults) continue

      const nextParts: Partial<Record<ScoringParts, MainStats[]>> = { ...override.parts }
      let partsChanged = false

      for (const part of MainStatPartsArray) {
        const saved = nextParts[part]
        if (saved === undefined) continue

        const unioned = unionMainStats(saved, defaults.parts[part] ?? [])
        if (!arraysShallowEqual(unioned, saved)) {
          nextParts[part] = unioned
          partsChanged = true
        }
      }

      if (partsChanged) {
        result[id] = { ...override, parts: nextParts }
      }
    } catch (e) {
      console.error(`[silverWolfLv999EvanesciaMainStats] Failed to migrate ${id}, skipping`, e)
    }
  }

  return result
}

function unionMainStats(saved: MainStats[], current: MainStats[]): MainStats[] {
  if (saved.length === 0 || current.length === 0) return []
  return [...current, ...saved.filter((s) => !current.includes(s))]
}
