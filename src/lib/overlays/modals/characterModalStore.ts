import { createOverlayStore } from 'lib/stores/createOverlayStore'
import { CharacterModalForm } from 'lib/overlays/modals/CharacterModal'
import { Form } from 'types/form'

export type CharacterModalConfig = {
  initialCharacter?: { form: CharacterModalForm } | null
  onOk: (form: Form) => void
}

export const useCharacterModalStore = createOverlayStore<CharacterModalConfig>()
