import { createOverlayStore } from 'lib/stores/createOverlayStore'
import { type AppPages } from 'lib/constants/appPages'
import type { Character } from 'types/character'

export type SaveBuildModalConfig = {
  source: AppPages.CHARACTERS | AppPages.OPTIMIZER
  character: Character | null
}

export const useSaveBuildModalStore = createOverlayStore<SaveBuildModalConfig>()
