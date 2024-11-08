import { CustomPortrait } from 'types/store'
import { Parts, SetsOrnaments, SetsRelics, StatsValues } from '../lib/constants'
import { GUID } from './Common'
import { Form } from './Form'

export type CharacterId = string // "1004"

export type Eidolon = (0 | 1 | 2 | 3 | 4 | 5 | 6) | number

export type Traces = {
  [key in StatsValues]: number;
}

export type Build = {
  [key in Parts]?: GUID;
}

// Db.getMetadata().characters
export type MetadataCharacter = {
  id: string
  name: string // "Dan Heng"
  rarity: number
  path: string
  element: string
  max_sp: number
  portrait: CustomPortrait
  traces: Record<string, number>
  imageCenter: { x: number; y: number }
  displayName: string // injected on hydration
  scoringMetadata: {
    stats: { [key in StatsValues]: number }
    parts: { [key in Parts]: StatsValues[] }
    relicSets: SetsRelics[]
    ornamentSets: SetsOrnaments[]
    characterId: CharacterId
  }
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

export type UnrankedCharacter = Omit<Character, 'rank'>
