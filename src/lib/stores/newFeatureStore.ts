import { create } from 'zustand'
import { ACTIVE_NEW_FEATURES, isNewFeatureCheck, isNewGroupCheck } from 'lib/constants/newFeatures'
import { SaveState } from 'lib/state/saveState'

interface NewFeatureState {
  seenFeatures: Set<string>
  setSeenFeatures: (seen: Set<string>) => void
}

export const useNewFeatureStore = create<NewFeatureState>((set) => ({
  seenFeatures: new Set<string>(),
  setSeenFeatures: (seen) => set({ seenFeatures: seen }),
}))

export function useIsNewFeature(key: string): boolean {
  return useNewFeatureStore((s) => isNewFeatureCheck(key, s.seenFeatures))
}

export function useIsNewGroup(prefix: string): boolean {
  return useNewFeatureStore((s) => isNewGroupCheck(prefix, s.seenFeatures))
}

export function markFeatureSeen(key: string): void {
  if (!ACTIVE_NEW_FEATURES.has(key)) return
  const store = useNewFeatureStore.getState()
  if (store.seenFeatures.has(key)) return
  const next = new Set(store.seenFeatures)
  next.add(key)
  store.setSeenFeatures(next)
  SaveState.delayedSave()
}

export function resetSeenFeatures(): void {
  useNewFeatureStore.getState().setSeenFeatures(new Set())
  SaveState.delayedSave()
}
