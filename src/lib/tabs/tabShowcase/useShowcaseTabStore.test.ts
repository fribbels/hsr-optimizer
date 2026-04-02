// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { getSelectedCharacter, useShowcaseTabStore } from './useShowcaseTabStore'
import { ShowcaseScreen, type ShowcaseTabCharacter } from './showcaseTabTypes'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { CUSTOM_TEAM, DEFAULT_TEAM, Parts } from 'lib/constants/constants'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { Relic } from 'types/relic'

// ---- Constants ----

const RELIC_1 = 'cd85c14c-a662-4413-a149-a379e6d538d3'
const RELIC_2 = '0bd7404f-3420-4bf5-9e45-f79343728685'

// ---- Helpers ----

function state() {
  return useShowcaseTabStore.getState()
}

function makeShowcaseCharacter(overrides: Partial<ShowcaseTabCharacter> = {}): ShowcaseTabCharacter {
  return {
    id: Kafka.id,
    index: 0,
    key: 'kafka-0',
    form: {
      characterId: Kafka.id,
      lightCone: '23006' as LightConeId,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    equipped: {
      [Parts.Head]: makeRelic(RELIC_1, Kafka.id),
      [Parts.Hands]: null,
      [Parts.Body]: null,
      [Parts.Feet]: null,
      [Parts.PlanarSphere]: null,
      [Parts.LinkRope]: null,
    } as Record<Parts, Relic | null | undefined>,
    ...overrides,
  } as ShowcaseTabCharacter
}

function makeRelic(id: string, equippedBy: CharacterId): Relic {
  return { id, equippedBy } as Relic
}

function seedWithCharacters(count = 2) {
  const characters = Array.from({ length: count }, (_, i) =>
    makeShowcaseCharacter({
      id: i === 0 ? Kafka.id : Jingliu.id,
      index: i,
      key: `char-${i}`,
      form: {
        characterId: i === 0 ? Kafka.id : Jingliu.id,
        lightCone: '23006' as LightConeId,
        characterEidolon: 0,
        lightConeSuperimposition: 1,
      },
    }),
  )
  state().setFetchResult(characters)
  // Transition to Loaded screen for override tests
  state().setScreen(ShowcaseScreen.Loaded)
}

// ---- Reset ----

beforeEach(() => {
  useShowcaseTabStore.setState(useShowcaseTabStore.getInitialState())
})

// ---- Tests ----

describe('useShowcaseTabStore', () => {
  describe('initial state', () => {
    it('store initializes with Landing screen, no data, default session, and empty preferences', () => {
      expect(state().screen).toBe(ShowcaseScreen.Landing)
      expect(state().loading).toBe(false)
      expect(state().latestRefreshDate).toBeNull()
      expect(state().availableCharacters).toBeNull()
      expect(state().selectedIndex).toBe(0)
      expect(state().savedSession).toEqual({ scorerId: null, sidebarOpen: true })
      expect(state().showcasePreferences).toEqual({})
      expect(state().showcaseTeamPreferenceById).toEqual({})
      expect(state().showcaseTemporaryOptionsByCharacter).toEqual({})
      expect(state().portraitColorByCharacterId).toEqual({})
      expect(state().portraitSwatchesByCharacterId).toEqual({})
    })
  })

  describe('fetch lifecycle', () => {
    it('startFetch sets loading true and transitions Landing to Loading screen', () => {
      expect(state().screen).toBe(ShowcaseScreen.Landing)

      state().startFetch()

      expect(state().loading).toBe(true)
      expect(state().screen).toBe(ShowcaseScreen.Loading)
    })

    it('startFetch keeps Loaded screen when re-fetching (shows button spinner only)', () => {
      state().setScreen(ShowcaseScreen.Loaded)

      state().startFetch()

      expect(state().loading).toBe(true)
      expect(state().screen).toBe(ShowcaseScreen.Loaded)
    })

    it('setFetchResult stores characters, resets selectedIndex to 0, and clears loading', () => {
      state().startFetch()
      const characters = [makeShowcaseCharacter()]

      state().setFetchResult(characters)

      expect(state().availableCharacters).toEqual(characters)
      expect(state().selectedIndex).toBe(0)
      expect(state().loading).toBe(false)
    })

    it('handleFetchFailure clears loading and transitions Loading to Loaded', () => {
      state().startFetch()
      expect(state().screen).toBe(ShowcaseScreen.Loading)

      state().handleFetchFailure()

      expect(state().loading).toBe(false)
      expect(state().screen).toBe(ShowcaseScreen.Loaded)
    })

    it('handleFetchFailure keeps Loaded screen on re-fetch failure (old data preserved)', () => {
      seedWithCharacters()
      state().startFetch()

      state().handleFetchFailure()

      expect(state().loading).toBe(false)
      expect(state().screen).toBe(ShowcaseScreen.Loaded)
      expect(state().availableCharacters).not.toBeNull()
    })

    it('setLatestRefreshDate updates the throttle timestamp', () => {
      const date = new Date('2026-03-22')
      state().setLatestRefreshDate(date)
      expect(state().latestRefreshDate).toBe(date)
    })
  })

  describe('character selection and override', () => {
    it('selectCharacter updates selectedIndex', () => {
      seedWithCharacters()

      state().selectCharacter(1)
      expect(state().selectedIndex).toBe(1)
    })

    it('getSelectedCharacter returns character at selectedIndex', () => {
      seedWithCharacters()

      state().selectCharacter(0)
      expect(getSelectedCharacter()?.id).toBe(Kafka.id)

      state().selectCharacter(1)
      expect(getSelectedCharacter()?.id).toBe(Jingliu.id)
    })

    it('getSelectedCharacter returns null when availableCharacters is null', () => {
      expect(getSelectedCharacter()).toBeNull()
    })

    it('applyCharacterOverride updates the character at selectedIndex with new form data', () => {
      seedWithCharacters()
      state().selectCharacter(0)

      const newForm: ShowcaseTabCharacter['form'] = {
        characterId: Jingliu.id,
        lightCone: '23014' as LightConeId,
        characterEidolon: 2,
        lightConeSuperimposition: 3,
      }
      state().applyCharacterOverride(newForm)

      const updated = state().availableCharacters![0]
      expect(updated.id).toBe(Jingliu.id)
      expect(updated.form).toEqual(newForm)
    })

    it('applyCharacterOverride updates equippedBy on relics to new character ID', () => {
      seedWithCharacters(1)
      state().selectCharacter(0)

      const newForm: ShowcaseTabCharacter['form'] = {
        characterId: Jingliu.id,
        lightCone: '23014' as LightConeId,
        characterEidolon: 0,
        lightConeSuperimposition: 1,
      }
      state().applyCharacterOverride(newForm)

      const headRelic = state().availableCharacters![0].equipped[Parts.Head]
      expect(headRelic?.equippedBy).toBe(Jingliu.id)
    })

    it('applyCharacterOverride preserves null relics in equipped', () => {
      seedWithCharacters(1)

      const newForm: ShowcaseTabCharacter['form'] = {
        characterId: Jingliu.id,
        lightCone: '23014' as LightConeId,
        characterEidolon: 0,
        lightConeSuperimposition: 1,
      }
      state().applyCharacterOverride(newForm)

      const hands = state().availableCharacters![0].equipped[Parts.Hands]
      expect(hands).toBeNull()
    })

    it('applyCharacterOverride preserves other characters in the array', () => {
      seedWithCharacters(2)
      state().selectCharacter(0)

      const newForm: ShowcaseTabCharacter['form'] = {
        characterId: Jingliu.id,
        lightCone: '23014' as LightConeId,
        characterEidolon: 0,
        lightConeSuperimposition: 1,
      }
      state().applyCharacterOverride(newForm)

      // Character at index 1 should be unchanged
      expect(state().availableCharacters![1].id).toBe(Jingliu.id)
    })

    it('applyCharacterOverride does not crash when availableCharacters is null', () => {
      // availableCharacters is null by default
      expect(state().availableCharacters).toBeNull()

      const form: ShowcaseTabCharacter['form'] = {
        characterId: Kafka.id,
        lightCone: '23006' as LightConeId,
        characterEidolon: 0,
        lightConeSuperimposition: 1,
      }

      // Should not throw
      expect(() => state().applyCharacterOverride(form)).not.toThrow()
      // availableCharacters should remain null
      expect(state().availableCharacters).toBeNull()
    })

    it('applyCharacterOverride does not crash when selectedIndex exceeds array length', () => {
      seedWithCharacters(1)
      state().selectCharacter(5) // out of bounds

      const form: ShowcaseTabCharacter['form'] = {
        characterId: Kafka.id,
        lightCone: '23006' as LightConeId,
        characterEidolon: 0,
        lightConeSuperimposition: 1,
      }

      expect(() => state().applyCharacterOverride(form)).not.toThrow()
      expect(state().availableCharacters).toHaveLength(1)
    })
  })

  describe('session management', () => {
    it('setScorerId updates savedSession.scorerId preserving sidebarOpen', () => {
      state().setScorerId('123456789')
      expect(state().savedSession.scorerId).toBe('123456789')
      expect(state().savedSession.sidebarOpen).toBe(true)
    })

    it('setSidebarOpen updates savedSession.sidebarOpen preserving scorerId', () => {
      state().setScorerId('123456789')
      state().setSidebarOpen(false)
      expect(state().savedSession.sidebarOpen).toBe(false)
      expect(state().savedSession.scorerId).toBe('123456789')
    })

    it('setSavedSession replaces all session fields via spread', () => {
      state().setScorerId('123456789')

      state().setSavedSession({ scorerId: null, sidebarOpen: false })

      expect(state().savedSession).toEqual({ scorerId: null, sidebarOpen: false })
    })
  })

  describe('per-character preferences', () => {
    it('setShowcasePreferences replaces the entire preferences map', () => {
      const prefs = { [Kafka.id]: { color: '#ff0000' } }
      state().setShowcasePreferences(prefs as any)
      expect(state().showcasePreferences).toBe(prefs)
    })

    it('setShowcaseTeamPreference adds an entry for a character preserving others', () => {
      state().setShowcaseTeamPreference(Kafka.id, CUSTOM_TEAM)
      state().setShowcaseTeamPreference(Jingliu.id, DEFAULT_TEAM)

      expect(state().showcaseTeamPreferenceById[Kafka.id]).toBe(CUSTOM_TEAM)
      expect(state().showcaseTeamPreferenceById[Jingliu.id]).toBe(DEFAULT_TEAM)
    })

    it('setSpdBenchmark sets value for a character preserving other characters', () => {
      state().setSpdBenchmark(Kafka.id, 160)
      state().setSpdBenchmark(Jingliu.id, 170)

      expect(state().showcaseTemporaryOptionsByCharacter[Kafka.id]?.spdBenchmark).toBe(160)
      expect(state().showcaseTemporaryOptionsByCharacter[Jingliu.id]?.spdBenchmark).toBe(170)
    })

    it('setSpdBenchmark preserves other fields in the same character temp options', () => {
      // Seed with an existing field
      useShowcaseTabStore.setState({
        showcaseTemporaryOptionsByCharacter: {
          [Kafka.id]: { spdBenchmark: 100 },
        },
      })

      state().setSpdBenchmark(Kafka.id, 160)
      expect(state().showcaseTemporaryOptionsByCharacter[Kafka.id]?.spdBenchmark).toBe(160)
    })
  })

  describe('portrait palette', () => {
    it('setPortraitPalette sets color and swatches for a character', () => {
      state().setPortraitPalette(Kafka.id, '#abc123', ['#111', '#222'])

      expect(state().portraitColorByCharacterId[Kafka.id]).toBe('#abc123')
      expect(state().portraitSwatchesByCharacterId[Kafka.id]).toEqual(['#111', '#222'])
    })

    it('setPortraitPalette with undefined color does not overwrite the color map', () => {
      state().setPortraitPalette(Kafka.id, '#abc123', ['#111'])
      state().setPortraitPalette(Kafka.id, undefined, ['#222', '#333'])

      // Color should remain from first call
      expect(state().portraitColorByCharacterId[Kafka.id]).toBe('#abc123')
      // Swatches should be updated
      expect(state().portraitSwatchesByCharacterId[Kafka.id]).toEqual(['#222', '#333'])
    })

    it('setPortraitPalette preserves other characters colors and swatches', () => {
      state().setPortraitPalette(Kafka.id, '#aaa', ['#111'])
      state().setPortraitPalette(Jingliu.id, '#bbb', ['#222'])

      expect(state().portraitColorByCharacterId[Kafka.id]).toBe('#aaa')
      expect(state().portraitColorByCharacterId[Jingliu.id]).toBe('#bbb')
    })
  })

  describe('screen state machine', () => {
    it('Landing → Loading via startFetch', () => {
      state().startFetch()
      expect(state().screen).toBe(ShowcaseScreen.Loading)
    })

    it('Loading → Loaded via setScreen', () => {
      state().startFetch()
      state().setScreen(ShowcaseScreen.Loaded)
      expect(state().screen).toBe(ShowcaseScreen.Loaded)
    })

    it('Loading → Loaded via handleFetchFailure', () => {
      state().startFetch()
      state().handleFetchFailure()
      expect(state().screen).toBe(ShowcaseScreen.Loaded)
    })

    it('Loaded → Loaded on re-fetch (startFetch keeps Loaded)', () => {
      state().setScreen(ShowcaseScreen.Loaded)
      state().startFetch()
      expect(state().screen).toBe(ShowcaseScreen.Loaded)
    })

    it('Loaded → Loaded on re-fetch failure (handleFetchFailure keeps Loaded)', () => {
      state().setScreen(ShowcaseScreen.Loaded)
      state().handleFetchFailure()
      expect(state().screen).toBe(ShowcaseScreen.Loaded)
    })
  })
})
