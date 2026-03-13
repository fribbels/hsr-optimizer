import { createOverlayStore } from 'lib/stores/createOverlayStore'
import { CharacterId } from 'types/character'
import { Parts } from 'lib/constants/constants'
import { Relic } from 'types/relic'

export type RelicModalConfig = {
  selectedRelic: Relic | null
  selectedPart?: Parts | null
  defaultWearer?: CharacterId
  onOk: (relic: Relic) => void
  next?: () => void
  prev?: () => void
}

export const useRelicModalStore = createOverlayStore<RelicModalConfig>()
