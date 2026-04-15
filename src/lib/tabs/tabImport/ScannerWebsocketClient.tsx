import { AppPages } from 'lib/constants/appPages'
import { type V4ParserRelic } from 'lib/importer/kelzFormatParser'
import { RelicRerollModal } from 'lib/overlays/modals/RelicRerollModal'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { gridStore } from 'lib/stores/gridStore'
import {
  handleDeleteLightCone,
  handleDeleteRelic,
  handleUpdateCharacter,
  handleUpdateLightCone,
  handleUpdateMaterial,
  handleUpdateRelic,
  initialScan,
  scannerChannel,
  type ScannerEvent,
  usePrivateScannerState,
} from 'lib/tabs/tabImport/scannerStore'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { debounceEffect } from 'lib/utils/frontendUtils'
import useWebSocket from 'partysocket/use-ws'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

// Re-export public API for backward compatibility
export { DEFAULT_WEBSOCKET_URL, scannerChannel, useScannerState } from 'lib/tabs/tabImport/scannerStore'

// Add a state for the reroll modal
type RerollModalState = {
  isOpen: boolean,
  relic: V4ParserRelic | null,
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

  // Ensure we mark ourselves as disconnected when the component unmounts
  useEffect(() => {
    return () => {
      usePrivateScannerState.getState().setConnected(false)
    }
  }, [])

  useWebSocket(websocketUrl, undefined, {
    onOpen: () => {
      usePrivateScannerState.getState().setConnected(true)
    },
    onClose: () => {
      usePrivateScannerState.getState().setConnected(false)
    },
    onMessage: (message) => {
      let event: ScannerEvent
      try {
        event = JSON.parse(message.data)
      } catch (e) {
        console.error('Failed to parse scanner message', e)
        return
      }

      const state = usePrivateScannerState.getState()

      try {
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
          case 'UpdateRelics': {
            event.data.forEach((relic) => {
              handleUpdateRelic(state, relic)
              relicSelectionBuffer.current.push(relic._uid)
            })
            const firstRerollRelic = event.data.find(
              (relic) => relic.reroll_substats && relic.reroll_substats.length > 0,
            )
            if (firstRerollRelic) {
              showRerollModal(firstRerollRelic)
            }
            break
          }
          case 'UpdateMaterials':
            event.data.forEach((material) => {
              handleUpdateMaterial(state, material)
            })
            break
          case 'UpdateLightCones':
            event.data.forEach((lightCone) => {
              handleUpdateLightCone(state, lightCone)
            })
            break
          case 'UpdateCharacters':
            event.data.forEach((character) => {
              handleUpdateCharacter(state, character)
            })
            break
          case 'DeleteRelics':
            event.data.forEach((relicId) => {
              handleDeleteRelic(state, relicId)
            })
            break
          case 'DeleteLightCones':
            event.data.forEach((lightConeId) => {
              handleDeleteLightCone(state, lightConeId)
            })
            break
          default:
            console.error(`Unknown event: ${JSON.stringify(event)}`)
            break
        }
      } catch (e) {
        console.error('Error processing scanner event', event.event, e)
      }

      // Broadcast the event
      if (state.ingest) {
        // TODO: Should we always broadcast (ignore ingest flag?)
        scannerChannel.send(event)
      }

      debounceEffect('scannerWebsocketForceUpdates', 100, () => {
        const activeKey = useGlobalStore.getState().activeKey
        switch (activeKey) {
          case AppPages.RELICS:
            if (relicSelectionBuffer.current.length > 0) {
              const ids = Array.from(
                new Set(
                  relicSelectionBuffer.current.filter(
                    (id) => usePrivateScannerState.getState().relics[id], // Ensure the relic still exists
                  ),
                ),
              )

              useRelicsTabStore.getState().setSelectedRelicsIds(ids)
              relicSelectionBuffer.current = []
            }
            break
          case AppPages.OPTIMIZER:
            gridStore.optimizerGridApi()?.redrawRows()
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
        relic={rerollModal.relic}
      />
    </>
  )
}
