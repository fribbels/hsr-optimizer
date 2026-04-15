import type { Parts } from 'lib/constants/constants'
import { createOverlayStore } from 'lib/stores/infrastructure/createOverlayStore'
import type { CharacterId } from 'types/character'
import type { Relic } from 'types/relic'

export type RelicModalConfig = {
  selectedRelic: Relic | null,
  selectedPart?: Parts,
  defaultWearer?: CharacterId,
  onOk: (relic: Relic) => void,
  next?: () => void,
  prev?: () => void,
}

export const useRelicModalStore = createOverlayStore<RelicModalConfig>()
