import { createOverlayStore } from 'lib/stores/createOverlayStore'
import type { CharacterModalForm } from 'lib/overlays/modals/CharacterModal'

export type CharacterModalConfig = {
  initialCharacter?: { form: CharacterModalForm } | null
  onOk: (form: CharacterModalForm) => void
}

export const useCharacterModalStore = createOverlayStore<CharacterModalConfig>()
