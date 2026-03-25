import { useCallback } from 'react'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { ArrayFilters } from 'lib/utils/arrayUtils'
import { indexRelics } from 'lib/relics/relicUtils'
import type { Relic } from 'types/relic'

type RelicStoreState = {
  relics: Relic[]
  relicsById: Partial<Record<string, Relic>>
}

type RelicStoreActions = {
  setRelics: (relics: Relic[]) => void
  upsertRelic: (relic: Relic) => void
  batchUpsertRelics: (relics: Relic[]) => void
  deleteRelic: (id: string) => void
}

export type RelicStore = RelicStoreState & RelicStoreActions

function buildRelicsById(relics: Relic[]): Partial<Record<string, Relic>> {
  return relics.reduce((acc, relic) => {
    acc[relic.id] = relic
    return acc
  }, {} as Partial<Record<string, Relic>>)
}

export const useRelicStore = createTabAwareStore<RelicStore>((set, get) => ({
  relics: [],
  relicsById: {},

  setRelics: (relics) => {
    indexRelics(relics)
    set({ relics, relicsById: buildRelicsById(relics) })
  },

  upsertRelic: (relic) => {
    if (relic.ageIndex == null) {
      const nextAgeIndex = (get().relics.at(-1)?.ageIndex ?? -1) + 1
      relic = { ...relic, ageIndex: nextAgeIndex }
    }
    const relicsById = { ...get().relicsById, [relic.id]: relic }
    const relics = Object.values(relicsById).filter(ArrayFilters.nonNullable)
    set({ relicsById, relics })
  },

  batchUpsertRelics: (relics) => {
    const relicsById = { ...get().relicsById }
    let nextAgeIndex = (get().relics.at(-1)?.ageIndex ?? -1) + 1
    for (let relic of relics) {
      if (relic.ageIndex == null) {
        relic = { ...relic, ageIndex: nextAgeIndex++ }
      }
      relicsById[relic.id] = relic
    }
    set({ relicsById, relics: Object.values(relicsById).filter(ArrayFilters.nonNullable) })
  },

  deleteRelic: (id) => {
    const relicsById = { ...get().relicsById }
    delete relicsById[id]
    const relics = Object.values(relicsById).filter(ArrayFilters.nonNullable)
    set({ relicsById, relics })
  },
}))

// Imperative getters for non-React code
export function getRelics(): Relic[] {
  return useRelicStore.getState().relics
}

export function getRelicById(id: string | undefined): Relic | undefined {
  if (!id) return undefined
  return useRelicStore.getState().relicsById[id]
}

/** Reactive hook — re-renders when the relic data changes in the store. */
export function useRelicById(id: string | null | undefined): Relic | null {
  return useRelicStore(useCallback((s) => (id ? s.relicsById[id] : null) ?? null, [id]))
}

