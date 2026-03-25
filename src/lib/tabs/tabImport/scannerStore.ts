import { objectHash } from 'lib/utils/objectUtils'
import { ReliquaryArchiverParser } from 'lib/importer/importConfig'
import {
  getActivatedBuffs,
  getMappedCharacterId,
  type ScannerParserJson,
  type V4ParserCharacter,
  type V4ParserGachaFunds,
  type V4ParserLightCone,
  type V4ParserMaterial,
  type V4ParserRelic,
} from 'lib/importer/kelzFormatParser'
import { SaveState } from 'lib/state/saveState'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import { getRelicById, getRelics } from 'lib/stores/relic/relicStore'
import { EventEmitter } from 'lib/utils/frontendUtils'
import type { CharacterId } from 'types/character'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'

type ScannerState = {
  // The websocket url to connect to
  websocketUrl: string,

  // Whether we are connected to the scanner websocket
  connected: boolean,

  // Whether to ingest data from the scanner websocket
  ingest: boolean,

  // Whether to ingest character data from the scanner websocket
  ingestCharacters: boolean,

  // Whether to auto-import warp resources (jades, passes, pity)
  ingestWarpResources: boolean,

  // Gacha funds parsed from the scanner websocket
  gachaFunds: V4ParserGachaFunds | null,

  // Relics parsed from the scanner websocket
  // key: relic unique id
  relics: Record<string, V4ParserRelic>,

  // List of recently updated relics by uid, most recent first
  recentRelics: string[],

  // Light cones parsed from the scanner websocket
  // key: light cone unique id
  lightCones: Record<string, V4ParserLightCone>,

  // Materials parsed from the scanner websocket
  // key: material unique id
  materials: Record<string, V4ParserMaterial>,

  // Characters parsed from the scanner websocket
  // key: character avatar id
  characters: Record<string, V4ParserCharacter>,

  // Map of character ids to their buffed version if activated
  activatedBuffs: Record<string, CharacterId>,
}

type ScannerActions = {
  // Set the websocket url to connect to
  setWebsocketUrl: (websocketUrl: string) => void,

  // Turn on/off ingestion of scanner data
  setIngest: (ingest: boolean) => void,

  // Turn on/off ingestion of character data from the scanner websocket
  setIngestCharacters: (ingest: boolean) => void,

  // Turn on/off auto-import of warp resources
  setIngestWarpResources: (ingest: boolean) => void,

  // Fetch the full scan data, refreshed with the latest data
  buildFullScanData: () => ScannerParserJson | null,
}

type PrivateScannerState = {
  // Initial scan data, or last updated scan data
  lastScanData: ScannerParserJson | null,
}

type PrivateScannerActions = {
  // Turn on/off connection to the scanner websocket
  setConnected: (connected: boolean) => void,

  // Update the state with a new initial scan
  updateInitialScan: (data: ScannerParserJson) => void,

  // Update the state with a new gacha funds
  updateGachaFunds: (data: V4ParserGachaFunds) => void,

  // Update the state with a new relic
  updateRelic: (relic: V4ParserRelic) => void,

  // Update the state with a new light cone
  updateLightCone: (lightCone: V4ParserLightCone) => void,

  // Update the state with a new material
  updateMaterial: (material: V4ParserMaterial) => void,

  // Update the state with a new character
  updateCharacter: (character: V4ParserCharacter) => void,

  // Update the state with a new activated buffs record
  updateActivatedBuffs: (activatedBuffs: Record<string, CharacterId>) => void,

  // Delete a relic from the state
  deleteRelic: (relicId: string) => void,

  // Delete a light cone from the state
  deleteLightCone: (lightConeId: string) => void,
}

export type ScannerStore =
  & ScannerState
  & ScannerActions
  & PrivateScannerState
  & PrivateScannerActions

export const DEFAULT_WEBSOCKET_URL = 'ws://127.0.0.1:23313/ws'

export const usePrivateScannerState = createTabAwareStore<ScannerStore>((set, get) => ({
  websocketUrl: DEFAULT_WEBSOCKET_URL,

  connected: false,
  ingest: false,
  ingestCharacters: false,
  ingestWarpResources: false,

  lastScanData: null,

  recentRelics: [],

  gachaFunds: null,

  relics: {},
  lightCones: {},
  materials: {},
  characters: {},

  activatedBuffs: {},

  setWebsocketUrl: (websocketUrl: string) => {
    set({ websocketUrl })

    SaveState.delayedSave()
  },

  setIngest: (ingest: boolean) => {
    set({ ingest })

    const state = get()
    if (state.connected && ingest) {
      const fullScanData = state.buildFullScanData()
      if (fullScanData) {
        ingestFullScan(fullScanData, state.ingestCharacters)
      }
    }

    SaveState.delayedSave()
  },

  setIngestCharacters: (ingestCharacters: boolean) => {
    set({ ingestCharacters })

    const state = get()
    if (state.connected && state.ingest && ingestCharacters) {
      const fullScanData = state.buildFullScanData()
      if (fullScanData) {
        ingestFullScan(fullScanData, ingestCharacters)
      }
    }

    SaveState.delayedSave()
  },

  setIngestWarpResources: (ingestWarpResources: boolean) => {
    set({ ingestWarpResources })

    // Re-emit events from the current state when enabled
    const state = get()
    if (state.connected && state.ingest && ingestWarpResources) {
      const fullScanData = state.buildFullScanData()
      if (fullScanData) {
        emitScannerEvents(fullScanData)
      }
    }

    SaveState.delayedSave()
  },

  setConnected: (connected: boolean) =>
    set({
      connected,

      /* always reset state when connection status changes */
      recentRelics: [],

      relics: {},
      lightCones: {},
      characters: {},
      materials: {},
      gachaFunds: null,
      activatedBuffs: {},
      lastScanData: null,
    }),

  updateInitialScan: (data: ScannerParserJson) =>
    set({
      lastScanData: data,

      recentRelics: data.relics
        .slice(-6)
        .reverse()
        .map((relic) => relic._uid),

      gachaFunds: data.gacha,

      relics: Object.fromEntries(
        data.relics.map((relic) => [relic._uid, relic]),
      ),
      lightCones: Object.fromEntries(
        data.light_cones.map((lightCone) => [lightCone._uid, lightCone]),
      ),
      materials: Object.fromEntries(
        data.materials.map((material) => [material.id, material]),
      ),
      characters: Object.fromEntries(
        data.characters.map((character) => [character.id, character]),
      ),
    }),

  buildFullScanData: () => {
    const { lastScanData, characters, lightCones, relics, materials, gachaFunds } = get()
    if (!lastScanData) {
      return null
    }

    return {
      ...lastScanData,

      // Update with latest data
      characters: Object.values(characters),
      light_cones: Object.values(lightCones),
      relics: Object.values(relics),
      materials: Object.values(materials),
      gacha: gachaFunds ?? lastScanData.gacha,
    } satisfies ScannerParserJson
  },

  updateGachaFunds: (data: V4ParserGachaFunds) =>
    set({
      gachaFunds: data,
    }),

  updateRelic: (relic: V4ParserRelic) => {
    const { relics, recentRelics } = get()

    // Check if we should update recentRelics
    let shouldUpdateRecentRelics = false

    // Add to recentRelics if it's a new relic
    if (!recentRelics.slice(0, 6).includes(relic._uid)) {
      shouldUpdateRecentRelics = true
    } else {
      // Compare properties excluding lock/discard status
      const existingRelicCopy = { ...relics[relic._uid] }
      const newRelicCopy = { ...relic }

      // Create new objects without lock/discard properties for comparison
      const { discard: _existingDiscard, lock: _existingLock, ...existingForComparison } = existingRelicCopy

      const { discard: _newDiscard, lock: _newLock, ...newForComparison } = newRelicCopy

      // Check if any other properties changed
      if (
        objectHash(existingForComparison)
          !== objectHash(newForComparison)
      ) {
        shouldUpdateRecentRelics = true
      }
    }

    set({
      relics: {
        ...relics,
        [relic._uid]: relic,
      },
      // Only update recentRelics if needed
      ...(shouldUpdateRecentRelics
        ? {
          recentRelics: [
            relic._uid,
            ...recentRelics.filter((id) => id !== relic._uid),
          ],
        }
        : {}),
    })
  },

  updateLightCone: (lightCone: V4ParserLightCone) =>
    set({
      lightCones: {
        ...usePrivateScannerState.getState().lightCones,
        [lightCone._uid]: lightCone,
      },
    }),

  updateMaterial: (material: V4ParserMaterial) =>
    set({
      materials: {
        ...usePrivateScannerState.getState().materials,
        [material.id]: material,
      },
    }),

  updateCharacter: (character: V4ParserCharacter) =>
    set({
      characters: {
        ...usePrivateScannerState.getState().characters,
        [character.id]: character,
      },
    }),

  updateActivatedBuffs: (activatedBuffs: Record<string, CharacterId>) =>
    set({
      activatedBuffs,
    }),

  deleteRelic: (relicId: string) =>
    set({
      relics: Object.fromEntries(
        Object.entries(usePrivateScannerState.getState().relics).filter(
          ([key]) => key !== relicId,
        ),
      ),
      recentRelics: get().recentRelics.filter((id) => id !== relicId),
    }),

  deleteLightCone: (lightConeId: string) =>
    set({
      lightCones: Object.fromEntries(
        Object.entries(usePrivateScannerState.getState().lightCones).filter(
          ([key]) => key !== lightConeId,
        ),
      ),
    }),
}))

export const useScannerState = usePrivateScannerState
export const scannerChannel = new EventEmitter<ScannerEvent>()

type GachaResult = {
  banner_id: number,
  banner_type: 'Character' | 'LightCone' | 'Standard',
  pity_4: PityUpdate,
  pity_5: PityUpdate,
  pull_results: string[], // character / light cone ids
}

type PityUpdate =
  & {
    amount: number,
  }
  & (
    | {
      kind: 'AddPity',
    }
    | {
      kind: 'ResetPity',
      set_guarantee: boolean,
    }
  )

export type ScannerEvent =
  | { event: 'InitialScan', data: ScannerParserJson }
  | { event: 'GachaResult', data: GachaResult }
  | { event: 'UpdateGachaFunds', data: V4ParserGachaFunds }
  | { event: 'UpdateMaterials', data: V4ParserMaterial[] }
  | { event: 'UpdateRelics', data: V4ParserRelic[] }
  | { event: 'UpdateLightCones', data: V4ParserLightCone[] }
  | { event: 'UpdateCharacters', data: V4ParserCharacter[] }
  | { event: 'DeleteRelics', data: string[] } // data: unique ids
  | { event: 'DeleteLightCones', data: string[] } // data: unique ids

function ingestFullScan(data: ScannerParserJson, updateCharacters: boolean) {
  const activatedBuffs = getActivatedBuffs(data.characters)
  usePrivateScannerState.getState().updateActivatedBuffs(activatedBuffs)

  const newScan = ReliquaryArchiverParser.parse(data)
  if (newScan) {
    if (updateCharacters) {
      // TODO: Merge with input form
      // We sort by the characters ingame level before setting their level to 80 for the optimizer, so the default char order is more natural
      newScan.characters = newScan.characters.sort(
        (a, b) => b.characterLevel - a.characterLevel,
      )
      newScan.characters.forEach((c) => {
        c.characterLevel = 80
        c.lightConeLevel = 80
      })
    }

    persistenceService.mergeRelics(
      newScan.relics,
      updateCharacters ? newScan.characters : [],
    )
    console.info('Ingested initial scan')

    emitScannerEvents(data)
  }
}

function emitScannerEvents(data: ScannerParserJson) {
  // Emit consumer events
  scannerChannel.send({
    event: 'UpdateGachaFunds',
    data: data.gacha,
  })

  scannerChannel.send({
    event: 'UpdateMaterials',
    data: data.materials,
  })

  scannerChannel.send({
    event: 'UpdateRelics',
    data: data.relics,
  })

  scannerChannel.send({
    event: 'UpdateLightCones',
    data: data.light_cones,
  })

  scannerChannel.send({
    event: 'UpdateCharacters',
    data: data.characters,
  })
}

export function initialScan(state: Readonly<ScannerStore>, data: ScannerParserJson) {
  state.updateInitialScan(data)

  if (state.ingest) {
    ingestFullScan(data, state.ingestCharacters)
  }
}

export function handleUpdateRelic(state: Readonly<ScannerStore>, relic: V4ParserRelic) {
  state.updateRelic(relic)

  if (state.ingest) {
    const newRelic = ReliquaryArchiverParser.parseRelic(relic, state.activatedBuffs)
    if (newRelic) {
      if (newRelic.grade !== 5) {
        return // Ignore non-5* relics
      }

      const oldRelic = getRelicById(newRelic.id)

      if (oldRelic != null && !state.ingestCharacters) {
        // Keep the owner of relic as the existing owner when character ingestion is disabled
        newRelic.equippedBy = oldRelic.equippedBy
      }

      equipmentService.upsertRelicWithEquipment(newRelic)
    }
  }
}

export function handleUpdateLightCone(
  state: Readonly<ScannerStore>,
  lightCone: V4ParserLightCone,
) {
  state.updateLightCone(lightCone)

  // Light Cones don't have any ingestion side-effects
  // Only used for determining equipment on characters
}

export function handleUpdateMaterial(
  state: Readonly<ScannerStore>,
  material: V4ParserMaterial,
) {
  state.updateMaterial(material)

  // Materials don't have any ingestion side-effects
}

export function handleUpdateCharacter(
  state: Readonly<ScannerStore>,
  character: V4ParserCharacter,
) {
  state.updateCharacter(character)

  if (state.ingest && state.ingestCharacters) {
    // Re-read fresh state to avoid stale activatedBuffs/lightCones in batch processing
    const freshState = usePrivateScannerState.getState()
    const mappedCharacter = getMappedCharacterId(character)
    const previousMappedCharacter = freshState.activatedBuffs[character.id] ?? character.id
    const activatedBuffs = {
      ...freshState.activatedBuffs,
      [character.id]: mappedCharacter,
    }

    if (mappedCharacter !== previousMappedCharacter) {
      freshState.updateActivatedBuffs(activatedBuffs)
    }

    // Create/update the character first so it exists in the store before relic relocation
    const parsed = ReliquaryArchiverParser.parseCharacter(
      character,
      activatedBuffs,
      Object.values(freshState.lightCones),
    )
    if (parsed) {
      persistenceService.upsertCharacterFromForm(parsed)
    }

    if (mappedCharacter !== previousMappedCharacter) {
      const oldRelics = getRelics().filter((relic) => relic.equippedBy === previousMappedCharacter)
      for (const relic of oldRelics) {
        equipmentService.equipRelic(relic, mappedCharacter as CharacterId)
      }
    }
  }
}

export function handleDeleteRelic(state: Readonly<ScannerStore>, relicId: string) {
  const relic = state.relics[relicId]
  state.deleteRelic(relicId)

  if (state.ingest && relic) {
    // Only 5* relics will exist in the DB as we drop everything else
    if (relic.rarity === 5) {
      equipmentService.removeRelic(relicId)
    }
  }
}

export function handleDeleteLightCone(state: Readonly<ScannerStore>, lightConeId: string) {
  state.deleteLightCone(lightConeId)
}
