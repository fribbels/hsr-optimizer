import { useEffect } from "react";
import { WebSocket } from "partysocket";
import { create, StoreApi, UseBoundStore } from "zustand";
import { ScannerParserJson, V4ParserCharacter, V4ParserLightCone, V4ParserRelic } from "lib/importer/kelzFormatParser";
import { ReliquaryArchiverParser } from "lib/importer/importConfig";
import DB, { AppPages } from "lib/state/db";
import { SaveState } from "lib/state/saveState";
import { TsUtils } from "lib/utils/TsUtils";
import { debounceEffect } from "lib/utils/debounceUtils";

type ScannerState = {
    // Whether we are connected to the scanner websocket
    connected: boolean

    // Whether to ingest data from the scanner websocket
    ingest: boolean

    // Relics parsed from the scanner websocket
    // key: relic unique id
    relics: Record<string, V4ParserRelic>

    // Light cones parsed from the scanner websocket
    // key: light cone unique id
    lightCones: Record<string, V4ParserLightCone>

    // Characters parsed from the scanner websocket
    // key: character avatar id
    characters: Record<string, V4ParserCharacter>
}

type ScannerActions = {
    // Turn on/off ingestion of scanner data
    setIngest: (ingest: boolean) => void

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

    // Update the state with a new relic
    updateRelic: (relic: V4ParserRelic) => void

    // Update the state with a new light cone
    updateLightCone: (lightCone: V4ParserLightCone) => void

    // Update the state with a new character
    updateCharacter: (character: V4ParserCharacter) => void

    // Delete a relic from the state
    deleteRelic: (relicId: string) => void

    // Delete a light cone from the state
    deleteLightCone: (lightConeId: string) => void
}

type ScannerStore = ScannerState & ScannerActions & PrivateScannerState & PrivateScannerActions

const usePrivateScannerState = create<ScannerStore>((set, get) => ({
    connected: false,
    ingest: false,

    lastScanData: null,

    relics: {},
    lightCones: {},
    characters: {},

    setIngest: (ingest: boolean) => {
        set({ ingest })

        if (ingest) {
            const fullScanData = get().buildFullScanData()
            if (fullScanData) {
                ingestFullScan(fullScanData)
            }
        }
    },

    setConnected: (connected: boolean) => set({ 
        connected,

        /* always reset state when connection status changes */ 
        ingest: false,
        relics: {},
        lightCones: {},
        characters: {},
    }),

    updateInitialScan: (data: ScannerParserJson) => set({
        lastScanData: data,

        relics: Object.fromEntries(data.relics.map((relic) => [relic._uid, relic])),
        lightCones: Object.fromEntries(data.light_cones.map((lightCone) => [lightCone._uid, lightCone])),
        characters: Object.fromEntries(data.characters.map((character) => [character.id, character])),
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

    updateRelic: (relic: V4ParserRelic) => set({
        relics: {
            ...usePrivateScannerState.getState().relics,
            [relic._uid]: relic
        }
    }),

    updateLightCone: (lightCone: V4ParserLightCone) => set({
        lightCones: {
            ...usePrivateScannerState.getState().lightCones,
            [lightCone._uid]: lightCone
        }
    }),

    updateCharacter: (character: V4ParserCharacter) => set({
        characters: {
            ...usePrivateScannerState.getState().characters,
            [character.id]: character
        }
    }),

    deleteRelic: (relicId: string) => set({
        relics: Object.fromEntries(
            Object.entries(usePrivateScannerState.getState().relics).filter(([key]) => key !== relicId)
        )
    }),

    deleteLightCone: (lightConeId: string) => set({
        lightCones: Object.fromEntries(
            Object.entries(usePrivateScannerState.getState().lightCones).filter(([key]) => key !== lightConeId)
        )
    }),
}))

export const useScannerState: UseBoundStore<StoreApi<ScannerState & ScannerActions>> = usePrivateScannerState

type ScannerEvent = 
    | { event: "InitialScan", data: ScannerParserJson }
    | { event: "UpdateRelic", data: V4ParserRelic }
    | { event: "UpdateLightCone", data: V4ParserLightCone }
    | { event: "UpdateCharacter", data: V4ParserCharacter }
    | { event: "DeleteRelic", data: string } // data: unique id
    | { event: "DeleteLightCone", data: string } // data: unique id

function ingestFullScan(data: ScannerParserJson) {
    const newScan = ReliquaryArchiverParser.parse(data)
    if (newScan) {
        // TODO: Merge with input form
        // We sort by the characters ingame level before setting their level to 80 for the optimizer, so the default char order is more natural
        newScan.characters = newScan.characters.sort((a, b) => b.characterLevel - a.characterLevel)
        newScan.characters.map((c) => {
            c.characterLevel = 80
            c.lightConeLevel = 80
        })

        DB.mergeRelicsWithState(newScan.relics, newScan.characters)
        console.info("Ingested initial scan")
    }
}

export function ScannerWebsocket() {
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:53313/ws', undefined, {
            maxReconnectionDelay: 1000,
        })

        ws.addEventListener("open", () => {
            usePrivateScannerState.getState().setConnected(true)
        })

        ws.addEventListener("close", () => {
            usePrivateScannerState.getState().setConnected(false)
        })

        function initialScan(state: Readonly<ScannerStore>, data: ScannerParserJson) {
            state.updateInitialScan(data)

            if (state.ingest) {
                ingestFullScan(data)
            }
        }

        function updateRelic(state: Readonly<ScannerStore>, relic: V4ParserRelic) {
            state.updateRelic(relic)

            if (state.ingest) {
                let newRelic = ReliquaryArchiverParser.parseRelic(relic)
                if (newRelic) {
                    const oldRelic = DB.getRelicById(newRelic.id)

                    // Only rescore if the relic stats have changed
                    if (!oldRelic || TsUtils.objectHash(oldRelic.augmentedStats) !== TsUtils.objectHash(newRelic.augmentedStats)) {
                        // Hack to prevent excessive resource usage, only rescore 5* relics on initial import
                        if (newRelic.grade === 5) {
                            window.rescoreSingleRelic(newRelic)
                        }
                    } else if (oldRelic != null) {
                        // Copy over stats
                        // TODO: Deduplicate from DB.mergeRelicsWithState
                        if (newRelic.verified || !oldRelic.verified) {
                            // Inherit the new verified speed stats
                            oldRelic.verified = newRelic.verified
                            oldRelic.substats = newRelic.substats
                            oldRelic.augmentedStats = newRelic.augmentedStats
                        }
                  
                        if (newRelic.equippedBy) {
                            // Update the owner of the existing relic with the newly imported owner
                            oldRelic.equippedBy = newRelic.equippedBy
                        }

                        newRelic = oldRelic
                    }

                    DB.setRelic(newRelic)
                }
            }
        }

        function updateLightCone(state: Readonly<ScannerStore>, lightCone: V4ParserLightCone) {
            state.updateLightCone(lightCone)

            // Light Cones are not ingested
            // Only used for determining equipment on characters
        }

        function updateCharacter(state: Readonly<ScannerStore>, character: V4ParserCharacter) {
            state.updateCharacter(character)

            if (state.ingest) {
                const parsed = ReliquaryArchiverParser.parseCharacter(character, Object.values(state.lightCones))
                if (parsed) {
                    DB.addFromForm(parsed, false)
                }
            }
        }

        function deleteRelic(state: Readonly<ScannerStore>, relicId: string) {
            state.deleteRelic(relicId)

            if (state.ingest) {
                DB.deleteRelic(relicId)
            }
        }

        function deleteLightCone(state: Readonly<ScannerStore>, lightConeId: string) {
            state.deleteLightCone(lightConeId)
        }

        ws.addEventListener("message", (message) => {
            const event: ScannerEvent = JSON.parse(message.data)
            const state = usePrivateScannerState.getState()
            switch (event.event) {
                case "InitialScan":
                    initialScan(state, event.data)
                    break
                case "UpdateRelic":
                    updateRelic(state, event.data)
                    break
                case "UpdateLightCone":
                    updateLightCone(state, event.data)
                    break
                case "UpdateCharacter":
                    updateCharacter(state, event.data)
                    break
                case "DeleteRelic":
                    deleteRelic(state, event.data)
                    break
                case "DeleteLightCone":
                    deleteLightCone(state, event.data)
                    break
                default:
                    console.error(`Unknown event: ${JSON.stringify(event)}`)
                    break
            }

            debounceEffect("scannerWebsocketForceUpdates", 100, () => {
                const activeKey = window.store.getState().activeKey
                if (activeKey === AppPages.CHARACTERS) {
                    window.forceCharacterTabUpdate()
                }

                DB.refreshRelics()
            })
            
            SaveState.delayedSave()
        })

        return () => {
            ws.close()
        }
    }, [])

    return null
}
