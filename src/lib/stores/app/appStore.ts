import { ShowcasePreset } from 'lib/characterPreview/debugVisualConfigStore'
import {
  COMPUTE_ENGINE_GPU_STABLE,
  CURRENT_OPTIMIZER_VERSION,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { DefaultSettingOptions } from 'lib/constants/settingsConstants'
import { ScoringType } from 'lib/scoring/scoringConfig'
import { getDefaultActiveKey } from 'lib/tabs/navigation/constants'
import type {
  GlobalSavedSession,
  HsrOptimizerStore,
} from 'types/store'
import { create } from 'zustand'

export const savedSessionDefaults: GlobalSavedSession = {
  [SavedSessionKeys.optimizerCharacterId]: null,
  [SavedSessionKeys.scoringType]: ScoringType.DPS_SCORE,
  [SavedSessionKeys.computeEngine]: COMPUTE_ENGINE_GPU_STABLE,
  [SavedSessionKeys.showcaseStandardMode]: false,
  [SavedSessionKeys.showcaseDarkMode]: false,
  [SavedSessionKeys.showcasePreset]: ShowcasePreset.SHINE,
  [SavedSessionKeys.showcaseUID]: true,
  [SavedSessionKeys.showcaseL2D]: true,
  [SavedSessionKeys.showcasePreciseSpd]: false,
  [SavedSessionKeys.sidebarCollapsed]: false,
  [SavedSessionKeys.characterGridDensity]: 'default',
  [SavedSessionKeys.teamShowcaseSavedTeams]: [],
}

export const useGlobalStore = create<HsrOptimizerStore>()((set) => ({
  version: CURRENT_OPTIMIZER_VERSION,
  completedMigrations: {},

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
  setCompletedMigrations: (x) => set(() => ({ completedMigrations: x })),
  setSettings: (x) => set(() => ({ settings: x })),
  setSavedSession: (x) => set(() => ({ savedSession: x })),
  setSavedSessionKey: (key, x) =>
    set((state) => {
      if (Object.is(state.savedSession[key], x)) return state
      return { savedSession: { ...state.savedSession, [key]: x } }
    }),
}))
