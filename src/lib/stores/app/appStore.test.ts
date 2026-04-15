// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import {
  AppPages,
  getDefaultActiveKey,
} from 'lib/constants/appPages'
import {
  COMPUTE_ENGINE_CPU,
  CURRENT_OPTIMIZER_VERSION,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import {
  DefaultSettingOptions,
  SettingOptions,
} from 'lib/constants/settingsConstants'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import {
  savedSessionDefaults,
  useGlobalStore,
} from 'lib/stores/app/appStore'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

// ---- Helpers ----

function state() {
  return useGlobalStore.getState()
}

// ---- Reset ----

beforeEach(() => {
  useGlobalStore.setState(useGlobalStore.getInitialState())
})

// ---- Tests ----

describe('useGlobalStore', () => {
  describe('initial state', () => {
    it('store initializes with default version, active page, savedSession, and settings', () => {
      expect(state().version).toBe(CURRENT_OPTIMIZER_VERSION)
      expect(state().activeKey).toBe(getDefaultActiveKey())
      expect(state().savedSession).toEqual(savedSessionDefaults)
      expect(state().settings).toEqual(DefaultSettingOptions)
      expect(state().scoringAlgorithmFocusCharacter).toBeUndefined()
      expect(state().statTracesDrawerFocusCharacter).toBeUndefined()
    })
  })

  describe('simple setters', () => {
    it('setActiveKey, setScoringAlgorithmFocusCharacter, and setStatTracesDrawerFocusCharacter update their fields', () => {
      state().setActiveKey(AppPages.OPTIMIZER)
      expect(state().activeKey).toBe(AppPages.OPTIMIZER)

      state().setScoringAlgorithmFocusCharacter(Kafka.id)
      expect(state().scoringAlgorithmFocusCharacter).toBe(Kafka.id)

      state().setScoringAlgorithmFocusCharacter(null)
      expect(state().scoringAlgorithmFocusCharacter).toBeNull()

      state().setStatTracesDrawerFocusCharacter(Kafka.id)
      expect(state().statTracesDrawerFocusCharacter).toBe(Kafka.id)
    })

    it('setVersion ignores falsy input and updates with a valid string', () => {
      state().setVersion(undefined)
      expect(state().version).toBe(CURRENT_OPTIMIZER_VERSION)

      state().setVersion('')
      expect(state().version).toBe(CURRENT_OPTIMIZER_VERSION)

      state().setVersion('2.0.0')
      expect(state().version).toBe('2.0.0')
    })
  })

  describe('saved session management', () => {
    it('setSavedSessionKey updates a single key without affecting other session keys', () => {
      state().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
      expect(state().savedSession.computeEngine).toBe(COMPUTE_ENGINE_CPU)
      expect(state().savedSession.scoringType).toBe(ScoringType.COMBAT_SCORE)
      expect(state().savedSession.optimizerCharacterId).toBeNull()
    })

    it('setSavedSessionKey handles different value types: boolean, string, and null', () => {
      state().setSavedSessionKey(SavedSessionKeys.showcaseDarkMode, true)
      expect(state().savedSession.showcaseDarkMode).toBe(true)

      state().setSavedSessionKey(SavedSessionKeys.optimizerCharacterId, Kafka.id)
      expect(state().savedSession.optimizerCharacterId).toBe(Kafka.id)

      state().setSavedSessionKey(SavedSessionKeys.optimizerCharacterId, null)
      expect(state().savedSession.optimizerCharacterId).toBeNull()
    })

    it('setSavedSession replaces the entire session object', () => {
      const custom = { ...savedSessionDefaults, showcaseDarkMode: true, scoringType: ScoringType.SUBSTAT_SCORE }
      state().setSavedSession(custom)
      expect(state().savedSession).toEqual(custom)
    })
  })

  describe('settings management', () => {
    it('setSettings replaces the settings object entirely', () => {
      const newSettings = { ...DefaultSettingOptions, RelicEquippingBehavior: SettingOptions.RelicEquippingBehavior.Swap }
      state().setSettings(newSettings)
      expect(state().settings).toEqual(newSettings)
    })
  })
})
