// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_WEBSOCKET_URL,
  handleDeleteRelic,
  handleUpdateCharacter,
  usePrivateScannerState,
  useScannerState,
} from './scannerStore'
import type { ScannerParserJson, V4ParserCharacter, V4ParserRelic } from 'lib/importer/kelzFormatParser'
import type { CharacterId } from 'types/character'
import { getRelics } from 'lib/stores/relic/relicStore'
import { SaveState } from 'lib/state/saveState'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import { ReliquaryArchiverParser } from 'lib/importer/importConfig'

// ---- Mocks ----

vi.mock('lib/state/saveState', () => ({
  SaveState: { delayedSave: vi.fn() },
}))

vi.mock('lib/services/persistenceService', () => ({
  mergeRelics: vi.fn(),
  upsertCharacterFromForm: vi.fn(),
}))

vi.mock('lib/services/equipmentService', () => ({
  upsertRelicWithEquipment: vi.fn(),
  removeRelic: vi.fn(),
  equipRelic: vi.fn(),
}))

vi.mock('lib/stores/relic/relicStore', () => ({
  getRelicById: vi.fn(),
  getRelics: vi.fn(() => []),
}))

vi.mock('lib/importer/importConfig', () => ({
  ReliquaryArchiverParser: {
    parse: vi.fn(),
    parseRelic: vi.fn(),
    parseCharacter: vi.fn(),
  },
}))

vi.mock('lib/importer/kelzFormatParser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lib/importer/kelzFormatParser')>()
  return {
    ...actual,
    getActivatedBuffs: vi.fn(() => ({})),
    getMappedCharacterId: vi.fn((c: V4ParserCharacter) => c.id as CharacterId),
  }
})

// ---- Constants ----

const RELIC_UID_1 = 'cd85c14c-a662-4413-a149-a379e6d538d3'
const RELIC_UID_2 = '0bd7404f-3420-4bf5-9e45-f79343728685'
const RELIC_UID_3 = '77ac4c85-21a7-4526-999a-6e54646dda6d'
const LC_UID_1 = 'e1f2a3b4-c5d6-7890-abcd-ef1234567890'
const MATERIAL_ID_1 = '2'       // Trailblaze EXP
const CHAR_ID_1 = '1001'        // March 7th
const CHAR_ID_2 = '1002'        // Dan Heng

// ---- Helpers ----

function state() {
  return usePrivateScannerState.getState()
}

function makeRelic(overrides: Partial<V4ParserRelic> = {}): V4ParserRelic {
  return {
    _uid: RELIC_UID_1,
    set_id: 101,
    set_name: 'TestSet',
    rarity: 5,
    level: 15,
    slot_id: 1,
    mainstat: 'HP',
    substats: [],
    location: '',
    lock: false,
    discard: false,
    _flat: {} as any,
    ...overrides,
  } as V4ParserRelic
}

function makeScanData(overrides: Partial<ScannerParserJson> = {}): ScannerParserJson {
  return {
    source: 'test',
    build: 'test',
    version: 4,
    metadata: {} as any,
    relics: [makeRelic({ _uid: RELIC_UID_1 }), makeRelic({ _uid: RELIC_UID_2 })],
    light_cones: [{ _uid: LC_UID_1 } as any],
    characters: [{ id: CHAR_ID_1 } as any],
    materials: [{ id: MATERIAL_ID_1, amount: 100 } as any],
    gacha: { stellar_jade: 1000, oneiric_shard: 500 } as any,
    ...overrides,
  } as ScannerParserJson
}

// ---- Reset ----

beforeEach(() => {
  usePrivateScannerState.setState(usePrivateScannerState.getInitialState())
  vi.clearAllMocks()
})

// ---- Tests ----

describe('scannerStore', () => {
  describe('initial state', () => {
    it('store initializes with default websocket URL, disconnected, no data, and all collections empty', () => {
      expect(state().websocketUrl).toBe(DEFAULT_WEBSOCKET_URL)
      expect(state().connected).toBe(false)
      expect(state().ingest).toBe(false)
      expect(state().ingestCharacters).toBe(false)
      expect(state().ingestWarpResources).toBe(false)
      expect(state().lastScanData).toBeNull()
      expect(state().gachaFunds).toBeNull()
      expect(state().relics).toEqual({})
      expect(state().lightCones).toEqual({})
      expect(state().materials).toEqual({})
      expect(state().characters).toEqual({})
      expect(state().recentRelics).toEqual([])
      expect(state().activatedBuffs).toEqual({})
    })

    it('useScannerState and usePrivateScannerState reference the same store', () => {
      expect(useScannerState).toBe(usePrivateScannerState)
    })
  })

  describe('connection lifecycle', () => {
    it('setConnected(true) sets connected and resets all data collections', () => {
      // Seed some data first
      state().updateRelic(makeRelic({ _uid: RELIC_UID_1 }))
      state().updateLightCone({ _uid: LC_UID_1 } as any)
      state().updateCharacter({ id: CHAR_ID_1 } as any)
      state().updateMaterial({ id: MATERIAL_ID_1 } as any)

      state().setConnected(true)

      expect(state().connected).toBe(true)
      expect(state().relics).toEqual({})
      expect(state().lightCones).toEqual({})
      expect(state().characters).toEqual({})
      expect(state().materials).toEqual({})
      expect(state().gachaFunds).toBeNull()
      expect(state().recentRelics).toEqual([])
    })

    it('setConnected(false) sets connected false and resets all data collections', () => {
      state().setConnected(true)
      state().updateRelic(makeRelic())

      state().setConnected(false)

      expect(state().connected).toBe(false)
      expect(state().relics).toEqual({})
    })

    it('setConnected(false) resets activatedBuffs to empty object', () => {
      state().updateActivatedBuffs({ [CHAR_ID_1]: CHAR_ID_2 as CharacterId })

      state().setConnected(false)

      expect(state().activatedBuffs).toEqual({})
    })

    it('setConnected(false) resets lastScanData to null', () => {
      state().updateInitialScan(makeScanData())
      expect(state().lastScanData).not.toBeNull()

      state().setConnected(false)

      expect(state().lastScanData).toBeNull()
    })
  })

  describe('initial scan', () => {
    it('updateInitialScan populates all collections from parsed data', () => {
      const scanData = makeScanData()
      state().updateInitialScan(scanData)

      expect(state().lastScanData).toBe(scanData)
      expect(Object.keys(state().relics)).toHaveLength(2)
      expect(state().relics[RELIC_UID_1]).toBeDefined()
      expect(state().relics[RELIC_UID_2]).toBeDefined()
      expect(state().lightCones[LC_UID_1]).toBeDefined()
      expect(state().characters[CHAR_ID_1]).toBeDefined()
      expect(state().materials[MATERIAL_ID_1]).toBeDefined()
      expect(state().gachaFunds).toEqual(scanData.gacha)
    })

    it('updateInitialScan sets recentRelics to last 6 UIDs reversed', () => {
      const relics = Array.from({ length: 8 }, (_, i) =>
        makeRelic({ _uid: `r-uid-${String(i).padStart(3, '0')}` }),
      )
      state().updateInitialScan(makeScanData({ relics }))

      expect(state().recentRelics).toHaveLength(6)
      // Last 6 relics reversed: 7,6,5,4,3,2
      expect(state().recentRelics[0]).toBe('r-uid-007')
      expect(state().recentRelics[5]).toBe('r-uid-002')
    })
  })

  describe('buildFullScanData', () => {
    it('returns null when lastScanData is null', () => {
      expect(state().buildFullScanData()).toBeNull()
    })

    it('merges lastScanData with current characters, lightCones, and relics', () => {
      state().updateInitialScan(makeScanData())
      // Add a new relic after initial scan
      state().updateRelic(makeRelic({ _uid: RELIC_UID_3 }))

      const result = state().buildFullScanData()!

      expect(result.relics).toHaveLength(3)
      expect(result.source).toBe('test')
    })

    it('buildFullScanData includes current materials in the result', () => {
      state().updateInitialScan(makeScanData())

      // Update a material after initial scan
      state().updateMaterial({ id: 'mat-002', amount: 50 } as any)

      const result = state().buildFullScanData()!

      // Should include both original and updated materials
      expect(result.materials).toHaveLength(2)
    })

    it('buildFullScanData includes current gachaFunds in the result', () => {
      state().updateInitialScan(makeScanData())

      // Update gacha after initial scan
      const updatedGacha = { stellar_jade: 2000, oneiric_shard: 1000 } as any
      state().updateGachaFunds(updatedGacha)

      const result = state().buildFullScanData()!

      expect(result.gacha).toEqual(updatedGacha)
    })
  })

  describe('relic updates', () => {
    it('updateRelic adds a new relic to the relics record', () => {
      state().updateRelic(makeRelic({ _uid: RELIC_UID_1 }))

      expect(state().relics[RELIC_UID_1]).toBeDefined()
      expect(state().relics[RELIC_UID_1]._uid).toBe(RELIC_UID_1)
    })

    it('updateRelic for a new relic prepends its UID to recentRelics', () => {
      state().updateRelic(makeRelic({ _uid: RELIC_UID_1 }))
      state().updateRelic(makeRelic({ _uid: RELIC_UID_2 }))

      expect(state().recentRelics[0]).toBe(RELIC_UID_2)
      expect(state().recentRelics[1]).toBe(RELIC_UID_1)
    })

    it('updateRelic for existing relic with only lock/discard change does not update recentRelics', () => {
      state().updateRelic(makeRelic({ _uid: RELIC_UID_1, lock: false, discard: false }))
      const beforeRecent = state().recentRelics

      state().updateRelic(makeRelic({ _uid: RELIC_UID_1, lock: true, discard: false }))

      expect(state().recentRelics).toBe(beforeRecent)
    })
  })

  describe('deletion', () => {
    it('deleteRelic removes relic from relics record', () => {
      state().updateRelic(makeRelic({ _uid: RELIC_UID_1 }))
      state().updateRelic(makeRelic({ _uid: RELIC_UID_2 }))

      state().deleteRelic(RELIC_UID_1)

      expect(state().relics[RELIC_UID_1]).toBeUndefined()
      expect(state().relics[RELIC_UID_2]).toBeDefined()
    })

    it('deleteRelic removes relic UID from recentRelics', () => {
      state().updateRelic(makeRelic({ _uid: RELIC_UID_1 }))
      state().updateRelic(makeRelic({ _uid: RELIC_UID_2 }))

      state().deleteRelic(RELIC_UID_1)

      expect(state().recentRelics).not.toContain(RELIC_UID_1)
      expect(state().recentRelics).toContain(RELIC_UID_2)
    })

    it('deleteLightCone removes from lightCones record', () => {
      state().updateLightCone({ _uid: LC_UID_1 } as any)

      state().deleteLightCone(LC_UID_1)

      expect(state().lightCones[LC_UID_1]).toBeUndefined()
    })

    it('handleDeleteRelic does not crash when relic is not found in state', () => {
      // Seed with ingest enabled so we reach the relic.rarity check
      usePrivateScannerState.setState({ ingest: true })

      // Call handleDeleteRelic with an ID that doesn't exist in state
      expect(() => handleDeleteRelic(state(), 'nonexistent-id')).not.toThrow()
    })
  })

  describe('other data updates', () => {
    it('updateLightCone adds to lightCones record', () => {
      state().updateLightCone({ _uid: LC_UID_1, name: 'TestLC' } as any)
      expect(state().lightCones[LC_UID_1]).toBeDefined()
    })

    it('updateMaterial adds to materials record', () => {
      state().updateMaterial({ id: MATERIAL_ID_1, amount: 42 } as any)
      expect(state().materials[MATERIAL_ID_1]).toBeDefined()
    })

    it('updateCharacter adds to characters record', () => {
      state().updateCharacter({ id: CHAR_ID_1 } as any)
      expect(state().characters[CHAR_ID_1]).toBeDefined()
    })

    it('updateGachaFunds sets gachaFunds', () => {
      const gacha = { stellar_jade: 500, oneiric_shard: 100 } as any
      state().updateGachaFunds(gacha)
      expect(state().gachaFunds).toEqual(gacha)
    })

    it('updateActivatedBuffs replaces the activatedBuffs record', () => {
      const buffs = { [CHAR_ID_1]: CHAR_ID_2 as CharacterId }
      state().updateActivatedBuffs(buffs)
      expect(state().activatedBuffs).toEqual(buffs)
    })
  })

  describe('settings', () => {
    it('setWebsocketUrl updates the URL and triggers save', () => {
      state().setWebsocketUrl('ws://custom:9999/ws')

      expect(state().websocketUrl).toBe('ws://custom:9999/ws')
      expect(SaveState.delayedSave).toHaveBeenCalled()
    })

    it('setIngest updates the ingest flag and triggers save', () => {
      state().setIngest(true)

      expect(state().ingest).toBe(true)
      expect(SaveState.delayedSave).toHaveBeenCalled()
    })

    it('setIngestCharacters updates the flag and triggers save', () => {
      state().setIngestCharacters(true)

      expect(state().ingestCharacters).toBe(true)
      expect(SaveState.delayedSave).toHaveBeenCalled()
    })

    it('setIngestWarpResources updates the flag and triggers save', () => {
      state().setIngestWarpResources(true)

      expect(state().ingestWarpResources).toBe(true)
      expect(SaveState.delayedSave).toHaveBeenCalled()
    })
  })

  describe('handleUpdateCharacter — C4 operation ordering', () => {
    it('creates character before relocating relics when mapping changes', () => {
      usePrivateScannerState.setState({
        ingest: true,
        ingestCharacters: true,
        activatedBuffs: { [CHAR_ID_1]: 'previousId' as CharacterId },
      })

      vi.mocked(getRelics).mockReturnValueOnce([
        { equippedBy: 'previousId' as CharacterId, id: RELIC_UID_1, part: 'Head' } as any,
      ])
      vi.mocked(ReliquaryArchiverParser.parseCharacter).mockReturnValueOnce({ characterId: CHAR_ID_1 } as any)

      const callOrder: string[] = []
      vi.mocked(persistenceService.upsertCharacterFromForm).mockImplementation((() => { callOrder.push('upsertCharacter') }) as any)
      vi.mocked(equipmentService.equipRelic).mockImplementation(() => { callOrder.push('equipRelic') })

      handleUpdateCharacter(state(), {
        id: CHAR_ID_1, name: 'March 7th', path: 'Preservation',
        level: 80, ascension: 6, eidolon: 0,
      })

      expect(callOrder).toEqual(['upsertCharacter', 'equipRelic'])
    })
  })
})
