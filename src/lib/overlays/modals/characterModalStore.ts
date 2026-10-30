import { createOverlayStore } from 'lib/stores/infrastructure/createOverlayStore'
import type {
  CharacterId,
  ExFlags,
} from 'types/character'
import type { LightConeId } from 'types/lightCone'

export type CharacterModalForm = {
  characterId?: CharacterId | null,
  lightCone?: LightConeId | null,
  characterEidolon: number,
  characterEx: ExFlags,
  lightConeSuperimposition: number,
  teamOrnamentSet?: string,
  teamRelicSet?: string,
}

export type CharacterModalConfig = {
  initialForm?: CharacterModalForm | null,
  onOk: (form: CharacterModalForm) => boolean | void,
  showSetSelection?: boolean,
}

export const useCharacterModalStore = createOverlayStore<CharacterModalConfig>()
