import { create } from 'zustand'

type OverlayStore<TConfig> = {
  open: boolean,
  config: TConfig | null, // stays populated after close to avoid animation flash
  openOverlay: (config: TConfig) => void,
  closeOverlay: () => void,
  updateConfig: (partial: Partial<TConfig>) => void,
}

export function createOverlayStore<TConfig>() {
  return create<OverlayStore<TConfig>>((set) => ({
    open: false,
    config: null,
    openOverlay: (config) => set({ open: true, config }),
    closeOverlay: () => set({ open: false }),
    // NOTE: config is NOT nullified on close. This prevents a visual flash
    // during Mantine's close animation (content unmounts via {open && <Content />}
    // but the backdrop fades out). Stale config is harmless since content is
    // unmounted. Config is overwritten on next openOverlay() call.
    updateConfig: (partial) =>
      set((state) => ({
        config: state.config ? { ...state.config, ...partial } : null,
      })),
  }))
}

export type { OverlayStore }
