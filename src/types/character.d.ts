import { Parts } from 'lib/constants/constants'
import { Form } from 'types/form'
import { CustomPortrait } from 'types/store'

export type CharacterId = string

export type Eidolon = number

export type Build = {
  [key in Parts]?: string;
}

// store.getState().characters[0]
export type Character = {
  id: CharacterId
  equipped: Build
  form: Form
  rank: number // order in character tab
  builds: SavedBuild[]
  portrait?: CustomPortrait
}

export type SavedBuild = {
  build: string[]
  name: string
  score: {
    score: string
    rating: string
  }
}
