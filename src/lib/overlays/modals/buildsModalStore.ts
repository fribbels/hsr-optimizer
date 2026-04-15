import { createOverlayStore } from 'lib/stores/infrastructure/createOverlayStore'
import type { CharacterId } from 'types/character'

export type BuildsModalConfig = {
  characterId: CharacterId,
}

export const useBuildsModalStore = createOverlayStore<BuildsModalConfig>()
