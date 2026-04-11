import {
  COMPUTE_ENGINE_GPU_STABLE,
  CURRENT_OPTIMIZER_VERSION,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { getDefaultActiveKey } from 'lib/constants/appPages'
import { DefaultSettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import type {
  GlobalSavedSession,
  HsrOptimizerStore,
} from 'types/store'
import { create } from 'zustand'

export const savedSessionDefaults: GlobalSavedSession = {
  [SavedSessionKeys.optimizerCharacterId]: null,
  [SavedSessionKeys.scoringType]: ScoringType.COMBAT_SCORE,
  [SavedSessionKeys.computeEngine]: COMPUTE_ENGINE_GPU_STABLE,
  [SavedSessionKeys.showcaseStandardMode]: false,
  [SavedSessionKeys.showcaseDarkMode]: false,
  [SavedSessionKeys.showcaseUID]: true,
  [SavedSessionKeys.showcasePreciseSpd]: false,
  [SavedSessionKeys.sidebarCollapsed]: false,
  [SavedSessionKeys.characterGridDensity]: 'default',
}

export const useGlobalStore = create<HsrOptimizerStore>()((set) => ({
  version: CURRENT_OPTIMIZER_VERSION,

  scoringAlgorithmFocusCharacter: undefined,
  statTracesDrawerFocusCharacter: undefined,

  activeKey: getDefaultActiveKey(),

  savedSession: savedSessionDefaults,

  settings: DefaultSettingOptions,

  setVersion: (x) => {
    if (!x) return
    return set(() => ({ version: x }))
  },
  setActiveKey: (x) => set(() => ({ activeKey: x })),
  setScoringAlgorithmFocusCharacter: (characterId) => set(() => ({ scoringAlgorithmFocusCharacter: characterId })),
  setStatTracesDrawerFocusCharacter: (characterId) => set(() => ({ statTracesDrawerFocusCharacter: characterId })),
  setSettings: (x) => set(() => ({ settings: x })),
  setSavedSession: (x) => set(() => ({ savedSession: x })),
  setSavedSessionKey: (key, x) =>
    set((state) => ({
      savedSession: { ...state.savedSession, [key]: x },
    })),
}))
