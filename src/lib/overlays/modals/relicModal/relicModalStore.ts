import type { Parts } from 'lib/constants/constants'
import { createOverlayStore } from 'lib/stores/infrastructure/createOverlayStore'
import type { CharacterId } from 'types/character'
import type { Relic } from 'types/relic'

export type RelicModalConfig = {
  selectedRelic: Relic | null,
  selectedPart?: Parts,
  defaultWearer?: CharacterId,
  // selectedRelic is what the modal displays at submit time; the prev/next arrows can change it
  onOk: (relic: Relic, selectedRelic: Relic | null) => void,
  next?: () => void,
  prev?: () => void,
}

export const useRelicModalStore = createOverlayStore<RelicModalConfig>()
