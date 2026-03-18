import { createTabAwareStore } from 'lib/stores/createTabAwareStore'
import { ArrayFilters } from 'lib/utils/arrayUtils'
import type { Relic } from 'types/relic'

type RelicStoreState = {
  relics: Relic[]
  relicsById: Partial<Record<string, Relic>>
}

type RelicStoreActions = {
  setRelics: (relics: Relic[]) => void
  upsertRelic: (relic: Relic) => void
  deleteRelic: (id: string) => void
}

export type RelicStore = RelicStoreState & RelicStoreActions

function indexRelics(relics: Relic[]) {
  relics.forEach((r, idx, arr) => {
    if (r.ageIndex) return
    arr[idx] = { ...r, ageIndex: idx === 0 ? 0 : arr[idx - 1].ageIndex! + 1 }
  })
}

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
    relic.ageIndex ??= (get().relics.at(-1)?.ageIndex ?? -1) + 1
    const relicsById = { ...get().relicsById, [relic.id]: relic }
    const relics = Object.values(relicsById).filter(ArrayFilters.nonNullable)
    set({ relicsById, relics })
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

