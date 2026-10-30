import type data from 'data/game_data.json'
import type { CustomImageConfig } from 'types/customImage'
import type { Form } from 'types/form'
import type {
  Build,
  SavedBuild,
} from 'types/savedBuild'

export type { Build, SavedBuild }

export type CharacterId = keyof typeof data.characters

export type Eidolon = number

export type ExFlags = number

export enum ExEidolon {
  EX1 = 1,
}

export type Character = {
  id: CharacterId,
  equipped: Build,
  form: Form,
  builds?: SavedBuild[],
  portrait?: CustomImageConfig,
}
