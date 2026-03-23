import { createOverlayStore } from 'lib/stores/infrastructure/createOverlayStore'
import type { Character } from 'types/character'

export type BuildsModalConfig = {
  selectedCharacter: Character | null
}

export const useBuildsModalStore = createOverlayStore<BuildsModalConfig>()
