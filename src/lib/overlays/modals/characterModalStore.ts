import { createOverlayStore } from 'lib/stores/infrastructure/createOverlayStore'
import type { CharacterModalForm } from 'lib/overlays/modals/CharacterModal'

export type CharacterModalConfig = {
  initialCharacter?: { form: CharacterModalForm } | null
  onOk: (form: CharacterModalForm) => void
  showSetSelection?: boolean
}

export const useCharacterModalStore = createOverlayStore<CharacterModalConfig>()
