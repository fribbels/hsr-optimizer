import { createOverlayStore } from 'lib/stores/infrastructure/createOverlayStore'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

export type CharacterModalForm = {
  characterId?: CharacterId | null,
  lightCone?: LightConeId | null,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teamOrnamentSet?: string,
  teamRelicSet?: string,
}

export type CharacterModalConfig = {
  initialCharacter?: { form: CharacterModalForm } | null,
  onOk: (form: CharacterModalForm) => boolean | void,
  showSetSelection?: boolean,
}

export const useCharacterModalStore = createOverlayStore<CharacterModalConfig>()
