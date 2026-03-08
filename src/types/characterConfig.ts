import {
  CharacterId,
  Eidolon,
} from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { ScoringMetadata } from 'types/metadata'

export type CharacterDisplay = {
  imageCenter?: {
    x: number,
    y: number,
    z: number,
  },
  showcaseColor?: string,
}

export type CharacterConfig = {
  id: CharacterId,
  display: CharacterDisplay,
  conditionals: (e: Eidolon, withContent: boolean) => CharacterConditionalsController,
  /** Getter — defers evaluation to avoid circular imports between config files */
  scoring: ScoringMetadata,
}
