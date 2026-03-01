import { ScoringMetadata } from 'types/metadata'
import { CharacterId, Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'

export type CharacterInfo = {
  displayName?: string
}

export type CharacterDisplay = {
  imageCenter?: {
    x: number
    y: number
    z: number
  }
  showcaseColor?: string
}

export type CharacterConfig = {
  id: CharacterId
  info: CharacterInfo
  conditionals: (e: Eidolon, withContent: boolean) => CharacterConditionalsController
  scoring: ScoringMetadata
  display: CharacterDisplay
}
