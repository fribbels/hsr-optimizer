// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { SaveState } from 'lib/state/saveState'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { Relic } from 'types/relic'
import type { HsrOptimizerSaveFormat } from 'types/store'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// ---- Constants ----

const RELIC_1 = 'cd85c14c-a662-4413-a149-a379e6d538d3'

// ---- Factories ----

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: Kafka.id as CharacterId,
    equipped: {},
    form: {} as Character['form'],
    ...overrides,
  }
}

function makeRelic(overrides: Partial<Relic> = {}): Relic {
  return {
    id: RELIC_1,
    set: Sets.BrokenKeel,
    part: Parts.Head,
    enhance: 15,
    grade: 5,
    main: { stat: Stats.HP, value: 4032 },
    substats: [],
    ...overrides,
  } as Relic
}

function makeSavedState(overrides: Partial<HsrOptimizerSaveFormat> = {}): HsrOptimizerSaveFormat {
  return {
    relics: [],
    characters: [],
    ...overrides,
  }
}

// ---- Setup / Teardown ----

let setItemSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  localStorage.clear()
  setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

  // Reset stores to empty defaults
  useCharacterStore.setState({ characters: [], charactersById: {} })
  useRelicStore.setState({ relics: [], relicsById: {} })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

// ---- Tests ----

describe('save', () => {
  // save() wraps localStorage.setItem in try/catch for QuotaExceededError
  it('save catches QuotaExceededError from localStorage.setItem and does not crash', () => {
    const quota = new DOMException('quota exceeded', 'QuotaExceededError')
    setItemSpy.mockImplementation(() => {
      throw quota
    })

    // Seed stores with data so the empty-save guard doesn't block
    useCharacterStore.setState({ characters: [makeCharacter()] })
    useRelicStore.setState({ relics: [makeRelic()] })

    expect(() => SaveState.save()).not.toThrow()
  })

  it('save blocks deletion of existing characters when new state has empty characters', () => {
    // Seed localStorage with a state that has characters
    const existing = makeSavedState({ characters: [makeCharacter()] })
    localStorage.setItem('state', JSON.stringify(existing))

    // Stores are empty (simulating broken metadata / HMR)
    useCharacterStore.setState({ characters: [], charactersById: {} })
    useRelicStore.setState({ relics: [], relicsById: {} })

    // Clear the spy call history from our manual setItem above
    setItemSpy.mockClear()

    SaveState.save()

    // setItem should NOT have been called — save was blocked
    expect(setItemSpy).not.toHaveBeenCalled()
  })

  it('permitEmptySave allows one empty save then resets the flag', () => {
    // Seed localStorage with a state that has characters
    const existing = makeSavedState({ characters: [makeCharacter()] })
    localStorage.setItem('state', JSON.stringify(existing))
    setItemSpy.mockClear()

    // Stores are empty
    useCharacterStore.setState({ characters: [], charactersById: {} })

    // First save: permitted via permitEmptySave
    SaveState.permitEmptySave()
    SaveState.save()
    expect(setItemSpy).toHaveBeenCalledTimes(1)

    // Re-seed localStorage with characters so the guard has something to protect
    localStorage.setItem('state', JSON.stringify(makeSavedState({ characters: [makeCharacter()] })))
    setItemSpy.mockClear()

    // Second save without permitEmptySave: should be blocked
    SaveState.save()
    expect(setItemSpy).not.toHaveBeenCalled()
  })
})

describe('delayedSave', () => {
  it('delayedSave debounces multiple calls into a single save', () => {
    vi.useFakeTimers()

    // Seed stores so save doesn't get blocked by empty guard
    useCharacterStore.setState({ characters: [makeCharacter()] })
    useRelicStore.setState({ relics: [makeRelic()] })

    const saveSpy = vi.spyOn(SaveState, 'save')

    SaveState.delayedSave()
    SaveState.delayedSave()
    SaveState.delayedSave()

    expect(saveSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(5000)

    expect(saveSpy).toHaveBeenCalledTimes(1)
  })
})
