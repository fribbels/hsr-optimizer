import { createOverlayStore } from 'lib/stores/createOverlayStore'
import { AppPages } from 'lib/constants/appPages'
import { Character } from 'types/character'

export type SaveBuildModalConfig = {
  source: AppPages.CHARACTERS | AppPages.OPTIMIZER
  character: Character | null
}

export const useSaveBuildModalStore = createOverlayStore<SaveBuildModalConfig>()
