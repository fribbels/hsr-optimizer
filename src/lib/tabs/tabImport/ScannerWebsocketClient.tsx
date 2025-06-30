import { useEffect, useRef, useState } from 'react'
import useWebSocket from 'partysocket/use-ws'
import { create, StoreApi, UseBoundStore } from 'zustand'
import {
  ScannerParserJson,
  V4ParserCharacter,
  V4ParserGachaFunds,
  V4ParserLightCone,
  V4ParserMaterial,
  V4ParserRelic,
} from 'lib/importer/kelzFormatParser'
import { ReliquaryArchiverParser } from 'lib/importer/importConfig'
import DB, { AppPages } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { TsUtils } from 'lib/utils/TsUtils'
import { debounceEffect } from 'lib/utils/debounceUtils'
import stableStringify from 'json-stable-stringify'
import RelicRerollModal from 'lib/overlays/modals/RelicRerollModal'
import { EventEmitter } from 'lib/utils/events'

type ScannerState = {
  // The websocket url to connect to
  websocketUrl: string

  // Whether we are connected to the scanner websocket
  connected: boolean

  // Whether to ingest data from the scanner websocket
  ingest: boolean

  // Whether to ingest character data from the scanner websocket
  ingestCharacters: boolean

  // Whether to auto-import warp resources (jades, passes, pity)
  ingestWarpResources: boolean

  // Gacha funds parsed from the scanner websocket
  gachaFunds: V4ParserGachaFunds | null

  // Relics parsed from the scanner websocket
  // key: relic unique id
  relics: Record<string, V4ParserRelic>

  // List of recently updated relics by uid, most recent first
  recentRelics: string[]

  // Light cones parsed from the scanner websocket
  // key: light cone unique id
  lightCones: Record<string, V4ParserLightCone>

  // Materials parsed from the scanner websocket
  // key: material unique id
  materials: Record<string, V4ParserMaterial>

  // Characters parsed from the scanner websocket
  // key: character avatar id
  characters: Record<string, V4ParserCharacter>
}

type ScannerActions = {
  // Set the websocket url to connect to
  setWebsocketUrl: (websocketUrl: string) => void

  // Turn on/off ingestion of scanner data
  setIngest: (ingest: boolean) => void

  // Turn on/off ingestion of character data from the scanner websocket
  setIngestCharacters: (ingest: boolean) => void

  // Turn on/off auto-import of warp resources
  setIngestWarpResources: (ingest: boolean) => void

  // Fetch the full scan data, refreshed with the latest data
  buildFullScanData: () => ScannerParserJson | null
}

type PrivateScannerState = {
  // Initial scan data, or last updated scan data
  lastScanData: ScannerParserJson | null
}

type PrivateScannerActions = {
  // Turn on/off connection to the scanner websocket
  setConnected: (connected: boolean) => void

  // Update the state with a new initial scan
  updateInitialScan: (data: ScannerParserJson) => void

  // Update the state with a new gacha funds
  updateGachaFunds: (data: V4ParserGachaFunds) => void

  // Update the state with a new relic
  updateRelic: (relic: V4ParserRelic) => void

  // Update the state with a new light cone
  updateLightCone: (lightCone: V4ParserLightCone) => void

  // Update the state with a new material
  updateMaterial: (material: V4ParserMaterial) => void

  // Update the state with a new character
  updateCharacter: (character: V4ParserCharacter) => void

  // Delete a relic from the state
  deleteRelic: (relicId: string) => void

  // Delete a light cone from the state
  deleteLightCone: (lightConeId: string) => void
}

type ScannerStore = ScannerState &
  ScannerActions &
  PrivateScannerState &
  PrivateScannerActions

export const DEFAULT_WEBSOCKET_URL = 'ws://127.0.0.1:53313/ws'

const usePrivateScannerState = create<ScannerStore>((set, get) => ({
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

  setWebsocketUrl: (websocketUrl: string) => {
    set({ websocketUrl })
  },

  setIngest: (ingest: boolean) => {
    set({ ingest })

    if (ingest) {
      const state = get()
      const fullScanData = state.buildFullScanData()
      if (fullScanData) {
        ingestFullScan(fullScanData, state.ingestCharacters)
      }
    }
  },

  setIngestCharacters: (ingestCharacters: boolean) => {
    set({ ingestCharacters })

    if (ingestCharacters) {
      const fullScanData = get().buildFullScanData()
      if (fullScanData) {
        ingestFullScan(fullScanData, ingestCharacters)
      }
    }
  },

  setIngestWarpResources: (ingestWarpResources: boolean) => {
    set({ ingestWarpResources })

    // Re-emit events from the current state when enabled
    if (ingestWarpResources) {
      const state = get()
      const fullScanData = state.buildFullScanData()
      if (fullScanData) {
        emitScannerEvents(fullScanData)
      }
    }
  },

  setConnected: (connected: boolean) =>
    set({
      connected,

      /* always reset state when connection status changes */
      ingest: false,
      ingestCharacters: false,

      recentRelics: [],

      relics: {},
      lightCones: {},
      characters: {},
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
    const { lastScanData, characters, lightCones, relics } = get()
    if (!lastScanData) {
      return null
    }

    return {
      ...lastScanData,

      // Update with latest data
      characters: Object.values(characters),
      light_cones: Object.values(lightCones),
      relics: Object.values(relics),
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
      const existingForComparison = Object.entries(existingRelicCopy)
        .filter(([key]) => key !== 'lock' && key !== 'discard')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

      const newForComparison = Object.entries(newRelicCopy)
        .filter(([key]) => key !== 'lock' && key !== 'discard')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

      // Check if any other properties changed
      if (
        stableStringify(existingForComparison)
        !== stableStringify(newForComparison)
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

export const useScannerState: UseBoundStore<
  StoreApi<ScannerState & ScannerActions>
> = usePrivateScannerState
export const scannerChannel = new EventEmitter<ScannerEvent>()

type GachaResult = {
  banner_id: number
  banner_type: 'Character' | 'LightCone' | 'Standard'
  pity_4: PityUpdate
  pity_5: PityUpdate
  pull_results: string[] // character / light cone ids
}

type PityUpdate = {
  amount: number
} & (
  | {
    kind: 'AddPity'
  }
  | {
    kind: 'ResetPity'
    set_guarantee: boolean
  }
)

type ScannerEvent =
  | { event: 'InitialScan'; data: ScannerParserJson }
  | { event: 'GachaResult'; data: GachaResult }
  | { event: 'UpdateGachaFunds'; data: V4ParserGachaFunds }
  | { event: 'UpdateMaterials'; data: V4ParserMaterial[] }
  | { event: 'UpdateRelics'; data: V4ParserRelic[] }
  | { event: 'UpdateLightCones'; data: V4ParserLightCone[] }
  | { event: 'UpdateCharacters'; data: V4ParserCharacter[] }
  | { event: 'DeleteRelics'; data: string[] } // data: unique ids
  | { event: 'DeleteLightCones'; data: string[] } // data: unique ids

function ingestFullScan(data: ScannerParserJson, updateCharacters: boolean) {
  const newScan = ReliquaryArchiverParser.parse(data)
  if (newScan) {
    if (updateCharacters) {
      // TODO: Merge with input form
      // We sort by the characters ingame level before setting their level to 80 for the optimizer, so the default char order is more natural
      newScan.characters = newScan.characters.sort(
        (a, b) => b.characterLevel - a.characterLevel,
      )
      newScan.characters.map((c) => {
        c.characterLevel = 80
        c.lightConeLevel = 80
      })
    }

    DB.mergeRelicsWithState(
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

function initialScan(state: Readonly<ScannerStore>, data: ScannerParserJson) {
  state.updateInitialScan(data)

  if (state.ingest) {
    ingestFullScan(data, state.ingestCharacters)
  }
}

function updateRelic(state: Readonly<ScannerStore>, relic: V4ParserRelic) {
  state.updateRelic(relic)

  if (state.ingest) {
    const newRelic = ReliquaryArchiverParser.parseRelic(relic)
    if (newRelic) {
      if (newRelic.grade !== 5) {
        return // Ignore non-5* relics
      }

      const oldRelic = DB.getRelicById(newRelic.id)

      // Only rescore if the relic stats have changed
      const needsRescore
        = !oldRelic
        || TsUtils.objectHash(oldRelic.augmentedStats)
        !== TsUtils.objectHash(newRelic.augmentedStats)
      if (oldRelic != null && !state.ingestCharacters) {
        // Keep the owner of relic as the existing owner when character ingestion is disabled
        newRelic.equippedBy = oldRelic.equippedBy
      }

      if (needsRescore) {
        window.rescoreSingleRelic(newRelic)
      } else {
        // Copy over weights from the existing relic
        newRelic.weights = oldRelic?.weights
      }

      DB.setRelic(newRelic)
    }
  }
}

function updateLightCone(
  state: Readonly<ScannerStore>,
  lightCone: V4ParserLightCone,
) {
  state.updateLightCone(lightCone)

  // Light Cones don't have any ingestion side-effects
  // Only used for determining equipment on characters
}

function updateMaterial(
  state: Readonly<ScannerStore>,
  material: V4ParserMaterial,
) {
  state.updateMaterial(material)

  // Materials don't have any ingestion side-effects
}

function updateCharacter(
  state: Readonly<ScannerStore>,
  character: V4ParserCharacter,
) {
  state.updateCharacter(character)

  if (state.ingest && state.ingestCharacters) {
    const parsed = ReliquaryArchiverParser.parseCharacter(
      character,
      Object.values(state.lightCones),
    )
    if (parsed) {
      DB.addFromForm(parsed, false)
    }
  }
}

function deleteRelic(state: Readonly<ScannerStore>, relicId: string) {
  const relic = state.relics[relicId]
  state.deleteRelic(relicId)

  if (state.ingest) {
    // Only 5* relics will exist in the DB as we drop everything else
    if (relic.rarity === 5) {
      DB.deleteRelic(relicId)
    }
  }
}

function deleteLightCone(state: Readonly<ScannerStore>, lightConeId: string) {
  state.deleteLightCone(lightConeId)
}

// Add a state for the reroll modal
type RerollModalState = {
  isOpen: boolean
  relic: V4ParserRelic | null
}

export function ScannerWebsocket() {
  const relicSelectionBuffer = useRef<string[]>([])
  // Add state for the reroll modal
  const [rerollModal, setRerollModal] = useState<RerollModalState>({
    isOpen: false,
    relic: null,
  })

  // Function to handle displaying the reroll modal
  const showRerollModal = (relic: V4ParserRelic) => {
    setRerollModal({
      isOpen: true,
      relic,
    })
  }

  // Function to close the reroll modal
  const closeRerollModal = () => {
    setRerollModal({
      isOpen: false,
      relic: null,
    })
  }

  const websocketUrl = usePrivateScannerState((s) => s.websocketUrl)

  useWebSocket(websocketUrl, undefined, {
    onOpen: () => {
      usePrivateScannerState.getState().setConnected(true)
    },
    onClose: () => {
      usePrivateScannerState.getState().setConnected(false)
    },
    onMessage: (message) => {
      const event: ScannerEvent = JSON.parse(message.data)
      const state = usePrivateScannerState.getState()

      // TODO: Optimize by batching updates to the db where possible
      switch (event.event) {
        case 'InitialScan':
          initialScan(state, event.data)
          break
        case 'GachaResult':
          // We don't store any state for gacha results
          // Since they are only relative currently
          break
        case 'UpdateGachaFunds':
          state.updateGachaFunds(event.data)
          break
        case 'UpdateRelics':
          event.data.forEach((relic) => {
            // Check if relic has reroll_substats before updating
            if (relic.reroll_substats && relic.reroll_substats.length > 0) {
              // Show reroll modal with the relic data
              showRerollModal(relic)
            }

            updateRelic(state, relic)
            relicSelectionBuffer.current.push(relic._uid)
          })
          break
        case 'UpdateMaterials':
          event.data.forEach((material) => {
            updateMaterial(state, material)
          })
          break
        case 'UpdateLightCones':
          event.data.forEach((lightCone) => {
            updateLightCone(state, lightCone)
          })
          break
        case 'UpdateCharacters':
          event.data.forEach((character) => {
            updateCharacter(state, character)
          })
          break
        case 'DeleteRelics':
          event.data.forEach((relicId) => {
            deleteRelic(state, relicId)
          })
          break
        case 'DeleteLightCones':
          event.data.forEach((lightConeId) => {
            deleteLightCone(state, lightConeId)
          })
          break
        default:
          console.error(`Unknown event: ${JSON.stringify(event)}`)
          break
      }

      // Broadcast the event
      if (state.ingest) {
        // TODO: Should we always broadcast (ignore ingest flag?)
        scannerChannel.send(event)
      }

      debounceEffect('scannerWebsocketForceUpdates', 100, () => {
        DB.refreshRelics()

        const activeKey = window.store.getState().activeKey
        switch (activeKey) {
          case AppPages.CHARACTERS:
            window.forceCharacterTabUpdate()
            break
          case AppPages.RELICS:
            if (relicSelectionBuffer.current.length > 0) {
              const ids = Array.from(
                new Set(
                  relicSelectionBuffer.current.filter(
                    (id) => state.relics[id], // Ensure the relic still exists
                  ),
                ),
              )

              window.setSelectedRelicIDs?.(ids)
              relicSelectionBuffer.current = []
            }

            window.relicsGrid?.current?.api.redrawRows()
            break
          case AppPages.OPTIMIZER:
            window.optimizerGrid?.current?.api.redrawRows()
            break
        }
      })

      SaveState.delayedSave()
    },
  })

  return (
    <>
      {/* Render the reroll modal */}
      <RelicRerollModal
        open={rerollModal.isOpen}
        onClose={closeRerollModal}
        relic={rerollModal.relic!}
      />
    </>
  )
}
