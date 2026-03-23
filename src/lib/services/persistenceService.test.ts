// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Metadata } from 'lib/state/metadataInitializer'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { getCharacters, useCharacterStore } from 'lib/stores/character/characterStore'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { savedSessionDefaults, useGlobalStore } from 'lib/stores/app/appStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { DefaultSettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/optimizerMenuIds'
import { loadSaveData, mergeRelics, resetAll } from 'lib/services/persistenceService'
import type { Character, CharacterId } from 'types/character'
import type { Relic } from 'types/relic'
import type { Form } from 'types/form'
import type { HsrOptimizerSaveFormat, UserSettings } from 'types/store'
import type { ScoringMetadata } from 'types/metadata'

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
  // PERSIST-1: Multi-part remap accumulation bug.
  // When newCharacters is empty, the remap loop is the ONLY mechanism to update
  // character equipment IDs. Each iteration spreads from character.equipped (original)
  // instead of the accumulated newEquipped, so only the last part's remap survives.
  it('mergeRelics accumulates remap across multiple equipped parts (PERSIST-1)', () => {
    const headOld = makeRelic({ id: RELIC_HEAD_OLD, part: Parts.Head, equippedBy: Kafka.id })
    const bodyOld = makeRelic({
      id: RELIC_BODY_OLD, part: Parts.Body, equippedBy: Kafka.id,
      set: Sets.MusketeerOfWildWheat, main: { stat: Stats.ATK_P, value: 43.2 },
    })

    const char = makeCharacter({
      equipped: { [Parts.Head]: RELIC_HEAD_OLD, [Parts.Body]: RELIC_BODY_OLD },
    })

    useRelicStore.getState().setRelics([headOld, bodyOld])
    useCharacterStore.getState().setCharacters([char])

    // Verified import with different IDs, no newCharacters so remap loop is sole updater
    const headNew = makeRelic({ id: RELIC_HEAD_NEW, part: Parts.Head, verified: true })
    const bodyNew = makeRelic({
      id: RELIC_BODY_NEW, part: Parts.Body, verified: true,
      set: Sets.MusketeerOfWildWheat, main: { stat: Stats.ATK_P, value: 43.2 },
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
      id: RELIC_FEET, part: Parts.Feet, equippedBy: Kafka.id,
      set: Sets.MusketeerOfWildWheat, main: { stat: Stats.SPD, value: 25.0 },
    })

    const char = makeCharacter({
      equipped: { [Parts.Head]: RELIC_HEAD_OLD, [Parts.Feet]: RELIC_FEET },
    })

    useRelicStore.getState().setRelics([headOld, feet])
    useCharacterStore.getState().setCharacters([char])

    // Only head gets a new ID via verified import, feet keeps same ID
    const headNew = makeRelic({ id: RELIC_HEAD_NEW, part: Parts.Head, verified: true })
    const feetSame = makeRelic({
      id: RELIC_FEET, part: Parts.Feet,
      set: Sets.MusketeerOfWildWheat, main: { stat: Stats.SPD, value: 25.0 },
    })

    mergeRelics([headNew, feetSame], [])

    const kafka = getCharacters().find((c) => c.id === Kafka.id)!
    expect(kafka.equipped[Parts.Head]).toBe(RELIC_HEAD_NEW)
    expect(kafka.equipped[Parts.Feet]).toBe(RELIC_FEET)
  })

  // PERSIST-2: Saved build remap returns { ...savedBuild, build: updatedBuild }
  // which adds a phantom 'build' key instead of updating 'equipped'.
  it('mergeRelics saved build remap uses equipped key not phantom build key (PERSIST-2)', () => {
    const headOld = makeRelic({ id: RELIC_HEAD_OLD, part: Parts.Head, equippedBy: Kafka.id })

    const char = makeCharacter({
      equipped: { [Parts.Head]: RELIC_HEAD_OLD },
      builds: [{
        name: 'Test Build',
        characterId: Kafka.id,
        eidolon: 0,
        lightConeId: '21001' as any,
        superimposition: 1,
        equipped: { [Parts.Head]: RELIC_HEAD_OLD },
        team: [],
        optimizerMetadata: null,
        deprioritizeBuffs: false,
        characterConditionals: undefined,
        lightConeConditionals: undefined,
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

  // CHAR-2: mergeRelics calls getCharacters() returning the live store array,
  // then mutates elements in-place via characters[idx] = ... in the remap loop.
  it('mergeRelics clones character array instead of mutating live store reference (CHAR-2)', () => {
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
  // SCORING-3: resetAll calls loadSaveData with empty save format but the format
  // has no scoringMetadataOverrides field, so existing overrides are never cleared.
  it('resetAll clears scoring overrides from store (SCORING-3)', () => {
    useScoringStore.getState().setScoringMetadataOverrides({
      [Kafka.id]: { stats: { [Stats.ATK_P]: 0.5 } } as ScoringMetadata,
    })

    resetAll()

    expect(useScoringStore.getState().scoringMetadataOverrides).toEqual({})
  })

  // SCORING-5: loadSaveData loads ALL scoring overrides from save data including
  // ones for characters that don't exist in game metadata. They should be filtered.
  it('loadSaveData filters scoring overrides for characters not in game metadata (SCORING-5)', () => {
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

  // DISPLAY-1: menuState loading gets the store reference, mutates it in-place,
  // then passes the same reference back to setMenuState.
  it('loadSaveData creates new menuState object reference not in-place mutation (DISPLAY-1)', () => {
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

  it('loadSaveData merges settings with DefaultSettingOptions for missing keys (GLOBAL-3)', () => {
    const partialSettings = {
      RelicEquippingBehavior: 'Replace',
    } as UserSettings

    const saveData = emptySaveData({ settings: partialSettings })
    loadSaveData(saveData, false, false)

    const settings = useGlobalStore.getState().settings
    expect(settings.PermutationsSidebarBehavior).toBe(DefaultSettingOptions.PermutationsSidebarBehavior)
    expect(settings.RelicEquippingBehavior).toBe('Replace')
  })
})
