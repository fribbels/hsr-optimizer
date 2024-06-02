import { Parts, SetsOrnaments, SetsRelics, StatsValues } from '../lib/constants'
import { AssetRelativeUrl, DataMineId, Element, ExternalPath, GUID, InternalPath, Promotions, Rarity } from './Common'
import { Form } from './Form'

export type CharacterId = string // "1004"

export type Eidolon = (0 | 1 | 2 | 3 | 4 | 5 | 6) | number

export type Traces = {
  [key in StatsValues]: number;
}

export type Build = {
  [key in Parts]?: GUID;
}

// DB.getMetadata().characters
export type MetadataCharacter = {
  id: DataMineId
  name: string // "Dan Heng"
  tag: string // "danheng"
  rarity: Rarity
  path: InternalPath | ExternalPath
  element: Element
  max_sp: number
  ranks: string[]
  skills: string[]
  skill_trees: string[]
  icon: AssetRelativeUrl
  preview: AssetRelativeUrl
  portrait: AssetRelativeUrl
  promotions: Promotions
  traces: Traces
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
}

export type SavedBuild = {
  build: string[]
  name: string
  score: {
    score: number
    rating: string
  }
}

export type UnrankedCharacter = Omit<Character, 'rank'>
