import type {
  CharacterId,
  Eidolon,
} from 'types/character'
import type { CharacterConditionalsController } from 'types/conditionals'
import type { LightConeId } from 'types/lightCone'
import type { ScoringMetadata } from 'types/metadata'

export type CharacterDisplay = {
  imageCenter?: {
    x: number,
    y: number,
    z: number,
  },
  spineCenter?: {
    x: number,
    y: number,
    z: number,
  },
  backgroundCenterOffset?: {
    x: number,
    y: number,
    z: number,
  },
  disableSpine?: boolean,
  showcaseColor?: string,
  gridPortraitOffset?: number,
}

export type CharacterConfig = {
  id: CharacterId,
  defaultLightCone: LightConeId,
  display: CharacterDisplay,
  conditionals: CharacterConditionalFunction,
  /** Getter — defers evaluation to avoid circular imports between config files */
  scoring: ScoringMetadata,
}

export type CharacterConditionalFunction = (e: Eidolon, withContent: boolean) => CharacterConditionalsController
