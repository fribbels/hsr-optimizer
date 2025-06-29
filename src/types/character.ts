import type data from 'data/game_data.json'
import { Parts } from 'lib/constants/constants'
import { CustomImageConfig } from 'types/customImage'
import { Form } from 'types/form'

export type CharacterId = keyof typeof data.characters

export type Eidolon = number

export type Build = {
  [key in Parts]?: string
}

// store.getState().characters[0]
export type Character = {
  id: CharacterId,
  equipped: Build,
  form: Form,
  rank: number, // order in character tab
  builds: SavedBuild[],
  portrait?: CustomImageConfig,
}

export type SavedBuild = {
  build: string[],
  name: string,
  score: {
    score: string,
    rating: string,
  },
}
