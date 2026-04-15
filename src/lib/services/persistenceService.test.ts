// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { DefaultSettingOptions } from 'lib/constants/settingsConstants'
import {
  loadSaveData,
  mergePartialRelics,
  mergeRelics,
  resetAll,
} from 'lib/services/persistenceService'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  savedSessionDefaults,
  useGlobalStore,
} from 'lib/stores/app/appStore'
import {
  getCharacters,
  useCharacterStore,
} from 'lib/stores/character/characterStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import {
  getRelicById,
  getRelics,
  useRelicStore,
} from 'lib/stores/relic/relicStore'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/optimizerMenuIds'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import type { ScoringMetadata } from 'types/metadata'
import type { Relic } from 'types/relic'
import { BuildSource } from 'types/savedBuild'
import type {
  HsrOptimizerSaveFormat,
  UserSettings,
} from 'types/store'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// ---- Mocks ----

vi.mock('lib/state/saveState', () => ({
  SaveState: { delayedSave: vi.fn(), permitEmptySave: vi.fn() },
}))

vi.mock('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions', () => ({
  recalculatePermutations: vi.fn(),
}))

// ---- Initialize metadata ----

Metadata.initialize()

// ---- Constants ----

const RELIC_HEAD_OLD = 'a1111111-1111-1111-1111-111111111111'
const RELIC_HEAD_NEW = 'b2222222-2222-2222-2222-222222222222'
const RELIC_BODY_OLD = 'c3333333-3333-3333-3333-333333333333'
const RELIC_BODY_NEW = 'd4444444-4444-4444-4444-444444444444'
const RELIC_FEET = 'e5555555-5555-5555-5555-555555555555'

const RELIC_HEAD_DUP = 'g7777777-7777-7777-7777-777777777777'
const STALE_CHARACTER_ID = '9999' as CharacterId

// ---- Factories ----

function makeRelic(overrides: Partial<Relic> = {}): Relic {
  return {
    id: RELIC_HEAD_OLD,
    set: Sets.MusketeerOfWildWheat,
    part: Parts.Head,
    grade: 5,
    enhance: 15,
    equippedBy: undefined,
    verified: false,
    ageIndex: 0,
    weightScore: 0,
    initialRolls: 0,
    main: { stat: Stats.HP, value: 705 },
    augmentedStats: {} as Relic['augmentedStats'],
    substats: [
      { stat: Stats.ATK, value: 38 },
      { stat: Stats.DEF, value: 38 },
      { stat: Stats.HP_P, value: 4.3 },
      { stat: Stats.ATK_P, value: 4.3 },
    ],
    previewSubstats: [],
    ...overrides,
  }
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: Kafka.id,
    equipped: {},
    form: { characterId: Kafka.id } as Form,
    builds: [],
    ...overrides,
  }
}

function emptySaveData(overrides: Partial<HsrOptimizerSaveFormat> = {}): HsrOptimizerSaveFormat {
  return {
    relics: [],
    characters: [],
    ...overrides,
  }
}

// ---- Reset ----

beforeEach(() => {
  useRelicStore.setState(useRelicStore.getInitialState())
  useCharacterStore.setState(useCharacterStore.getInitialState())
  useScoringStore.setState(useScoringStore.getInitialState())
  useOptimizerDisplayStore.setState(useOptimizerDisplayStore.getInitialState())
  useGlobalStore.setState({
    settings: DefaultSettingOptions,
    savedSession: savedSessionDefaults,
  })
})

// ---- Tests ----

describe('mergeRelics', () => {
  // Remap loop must accumulate across parts, not spread from the original each time
  it('mergeRelics accumulates remap across multiple equipped parts', () => {
    const headOld = makeRelic({ id: RELIC_HEAD_OLD, part: Parts.Head, equippedBy: Kafka.id })
    const bodyOld = makeRelic({
      id: RELIC_BODY_OLD,
      part: Parts.Body,
      equippedBy: Kafka.id,
      set: Sets.MusketeerOfWildWheat,
      main: { stat: Stats.ATK_P, value: 43.2 },
    })

    const char = makeCharacter({
      equipped: { [Parts.Head]: RELIC_HEAD_OLD, [Parts.Body]: RELIC_BODY_OLD },
    })

    useRelicStore.getState().setRelics([headOld, bodyOld])
    useCharacterStore.getState().setCharacters([char])

    // Verified import with different IDs, no newCharacters so remap loop is sole updater
    const headNew = makeRelic({ id: RELIC_HEAD_NEW, part: Parts.Head, verified: true })
    const bodyNew = makeRelic({
      id: RELIC_BODY_NEW,
      part: Parts.Body,
      verified: true,
      set: Sets.MusketeerOfWildWheat,
      main: { stat: Stats.ATK_P, value: 43.2 },
    })

    mergeRelics([headNew, bodyNew], [])

    const kafka = getCharacters().find((c) => c.id === Kafka.id)!

    // Both parts should have remapped to the new IDs
    expect(kafka.equipped[Parts.Head]).toBe(RELIC_HEAD_NEW)
    expect(kafka.equipped[Parts.Body]).toBe(RELIC_BODY_NEW)
  })

  it('mergeRelics single-part remap preserves other equipment slots', () => {
    const headOld = makeRelic({ id: RELIC_HEAD_OLD, part: Parts.Head, equippedBy: Kafka.id })
    const feet = makeRelic({
      id: RELIC_FEET,
      part: Parts.Feet,
      equippedBy: Kafka.id,
      set: Sets.MusketeerOfWildWheat,
      main: { stat: Stats.SPD, value: 25.0 },
    })

    const char = makeCharacter({
      equipped: { [Parts.Head]: RELIC_HEAD_OLD, [Parts.Feet]: RELIC_FEET },
    })

    useRelicStore.getState().setRelics([headOld, feet])
    useCharacterStore.getState().setCharacters([char])

    // Only head gets a new ID via verified import, feet keeps same ID
    const headNew = makeRelic({ id: RELIC_HEAD_NEW, part: Parts.Head, verified: true })
    const feetSame = makeRelic({
      id: RELIC_FEET,
      part: Parts.Feet,
      set: Sets.MusketeerOfWildWheat,
      main: { stat: Stats.SPD, value: 25.0 },
    })

    mergeRelics([headNew, feetSame], [])

    const kafka = getCharacters().find((c) => c.id === Kafka.id)!
    expect(kafka.equipped[Parts.Head]).toBe(RELIC_HEAD_NEW)
    expect(kafka.equipped[Parts.Feet]).toBe(RELIC_FEET)
  })

  // Saved build remap must update 'equipped', not add a phantom 'build' key
  it('mergeRelics saved build remap uses equipped key not phantom build key', () => {
    const headOld = makeRelic({ id: RELIC_HEAD_OLD, part: Parts.Head, equippedBy: Kafka.id })

    const char = makeCharacter({
      equipped: { [Parts.Head]: RELIC_HEAD_OLD },
      builds: [{
        source: BuildSource.Character,
        name: 'Test Build',
        characterId: Kafka.id,
        characterEidolon: 0,
        lightCone: '21001' as LightConeId,
        lightConeSuperimposition: 1,
        equipped: { [Parts.Head]: RELIC_HEAD_OLD },
        team: [null, null, null],
      }],
    })

    useRelicStore.getState().setRelics([headOld])
    useCharacterStore.getState().setCharacters([char])

    // Verified import with new ID triggers remap of saved build
    const headNew = makeRelic({ id: RELIC_HEAD_NEW, part: Parts.Head, verified: true })
    mergeRelics([headNew], [])

    const kafka = getCharacters().find((c) => c.id === Kafka.id)!
    const build = kafka.builds![0]

    // Should have updated 'equipped', not added a phantom 'build' key
    expect(build.equipped[Parts.Head]).toBe(RELIC_HEAD_NEW)
    expect((build as any).build).toBeUndefined()
  })

  // mergeRelics must clone the character array, not mutate the live store reference
  it('mergeRelics clones character array instead of mutating live store reference', () => {
    const headOld = makeRelic({ id: RELIC_HEAD_OLD, part: Parts.Head, equippedBy: Kafka.id })

    const char = makeCharacter({
      equipped: { [Parts.Head]: RELIC_HEAD_OLD },
    })

    useRelicStore.getState().setRelics([headOld])
    useCharacterStore.getState().setCharacters([char])

    // Capture the live store array and its first element before merge
    const liveArrayBefore = getCharacters()
    const originalKafka = liveArrayBefore[0]

    // Verified import with different ID triggers remap, no newCharacters
    const headNew = makeRelic({ id: RELIC_HEAD_NEW, part: Parts.Head, verified: true })
    mergeRelics([headNew], [])

    // The original array element should NOT have been replaced in-place.
    // With the bug, liveArrayBefore[0] is replaced because mergeRelics mutates
    // the live store array directly via characters[idx] = newObj.
    expect(liveArrayBefore[0]).toBe(originalKafka)
  })
})

describe('loadSaveData', () => {
  // resetAll must clear scoring overrides even though the empty save format has no overrides field
  it('resetAll clears scoring overrides from store', () => {
    useScoringStore.getState().setScoringMetadataOverrides({
      [Kafka.id]: { stats: { [Stats.ATK_P]: 0.5 } } as ScoringMetadata,
    })

    resetAll()

    expect(useScoringStore.getState().scoringMetadataOverrides).toEqual({})
  })

  // Scoring overrides for characters not in game metadata should be filtered out
  it('loadSaveData filters scoring overrides for characters not in game metadata', () => {
    const saveData = emptySaveData({
      scoringMetadataOverrides: {
        [STALE_CHARACTER_ID]: { stats: { [Stats.ATK_P]: 1 } } as ScoringMetadata,
        [Kafka.id]: { stats: { [Stats.ATK_P]: 0.5 } } as ScoringMetadata,
      },
    })

    loadSaveData(saveData, false, false)

    const overrides = useScoringStore.getState().scoringMetadataOverrides
    // Stale character override should have been removed
    expect(overrides[STALE_CHARACTER_ID]).toBeUndefined()
    // Valid character override should remain
    expect(overrides[Kafka.id]).toBeDefined()
  })

  // menuState loading must create a new object, not mutate the store reference in-place
  it('loadSaveData creates new menuState object reference not in-place mutation', () => {
    const menuStateBefore = useOptimizerDisplayStore.getState().menuState

    const saveData = emptySaveData({
      optimizerMenuState: {
        [OptimizerMenuIds.characterOptions]: true,
        [OptimizerMenuIds.teammates]: false,
      },
    })

    loadSaveData(saveData, false, false)

    // The original reference should NOT have been mutated
    expect(menuStateBefore[OptimizerMenuIds.characterOptions]).toBeUndefined()
  })

  it('loadSaveData merges settings with DefaultSettingOptions for missing keys', () => {
    const partialSettings = {
      RelicEquippingBehavior: 'Replace',
    } as UserSettings

    const saveData = emptySaveData({ settings: partialSettings })
    loadSaveData(saveData, false, false)

    const settings = useGlobalStore.getState().settings
    expect(settings.PermutationsSidebarBehavior).toBe(DefaultSettingOptions.PermutationsSidebarBehavior)
    expect(settings.RelicEquippingBehavior).toBe('Replace')
  })

  it('loadSaveData does not crash when characters field is missing', () => {
    const saveData = { relics: [] } as unknown as HsrOptimizerSaveFormat
    expect(() => loadSaveData(saveData, false, false)).not.toThrow()
  })

  it('loadSaveData does not crash when relics field is not an array', () => {
    const saveData = { characters: [], relics: 'bad' } as unknown as HsrOptimizerSaveFormat
    expect(() => loadSaveData(saveData, false, false)).not.toThrow()
  })
})

describe('mergeRelics — cleanup loop stale reference', () => {
  it('cleans multiple invalid equipped slots on same character', () => {
    const deletedHead = 'deleted-head-id'
    const deletedBody = 'deleted-body-id'
    const validFeet = makeRelic({
      id: RELIC_FEET,
      part: Parts.Feet,
      equippedBy: Kafka.id,
      set: Sets.MusketeerOfWildWheat,
      main: { stat: Stats.SPD, value: 25 },
    })

    const char = makeCharacter({
      equipped: {
        [Parts.Head]: deletedHead,
        [Parts.Body]: deletedBody,
        [Parts.Feet]: RELIC_FEET,
      },
    })

    useRelicStore.getState().setRelics([validFeet])
    useCharacterStore.getState().setCharacters([char])

    mergeRelics([validFeet], [])

    const kafka = getCharacters().find((c) => c.id === Kafka.id)!
    expect(kafka.equipped[Parts.Head]).toBeUndefined()
    expect(kafka.equipped[Parts.Body]).toBeUndefined()
    expect(kafka.equipped[Parts.Feet]).toBe(RELIC_FEET)
  })
})

describe('mergeRelics — hash collision drops relics', () => {
  it('does not drop old relics with duplicate hashes', () => {
    // Two identical relics (same stats = same hash) with different IDs
    const relic1 = makeRelic({ id: RELIC_HEAD_OLD, ageIndex: 0 })
    const relic2 = makeRelic({ id: RELIC_HEAD_DUP, ageIndex: 1 })

    useRelicStore.getState().setRelics([relic1, relic2])
    useCharacterStore.getState().setCharacters([])

    // Import empty — all old relics should survive
    mergeRelics([], [])

    const relics = getRelics()
    const ids = relics.map((r) => r.id)
    expect(ids).toContain(RELIC_HEAD_OLD)
    expect(ids).toContain(RELIC_HEAD_DUP)
  })
})

describe('mergeRelics — ageIndex dropped during merge', () => {
  it('preserves new relic ageIndex when equippedBy is set', () => {
    const oldRelic = makeRelic({ id: RELIC_HEAD_OLD, ageIndex: 0, equippedBy: Kafka.id })
    const char = makeCharacter({ equipped: { [Parts.Head]: RELIC_HEAD_OLD } })

    useRelicStore.getState().setRelics([oldRelic])
    useCharacterStore.getState().setCharacters([char])

    // Import same relic with new ageIndex and equippedBy, with characters
    const newRelic = makeRelic({ id: RELIC_HEAD_OLD, ageIndex: 99, equippedBy: Kafka.id })
    mergeRelics([newRelic], [{ characterId: Kafka.id } as Form])

    const stored = getRelicById(RELIC_HEAD_OLD)!
    expect(stored.ageIndex).toBe(99)
  })
})

describe('mergePartialRelics — match pool deduplication', () => {
  it('does not match same old relic to two new relics', () => {
    // One old relic at enhance 0
    const oldRelic = makeRelic({ id: RELIC_HEAD_OLD, enhance: 0 })
    useRelicStore.getState().setRelics([oldRelic])
    useCharacterStore.getState().setCharacters([])

    // Two new relics at enhance 3 — both could match the old one
    const new1 = makeRelic({ id: RELIC_HEAD_NEW, enhance: 3 })
    const new2 = makeRelic({ id: RELIC_BODY_NEW, enhance: 3 })

    mergePartialRelics([new1, new2], [])

    // One should match the old relic (updating it), the other should be added as new
    const relics = getRelics()
    expect(relics.length).toBe(2)
  })
})
