import { createOverlayStore } from 'lib/stores/infrastructure/createOverlayStore'
import type { CharacterId } from 'types/character'
import { type BuildSource } from 'types/savedBuild'

export type SaveBuildModalConfig = {
  source: BuildSource
  characterId: CharacterId
}

export const useSaveBuildModalStore = createOverlayStore<SaveBuildModalConfig>()
