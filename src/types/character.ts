import type data from 'data/game_data.json'
import { Parts } from 'lib/constants/constants'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { CustomImageConfig } from 'types/customImage'
import { Form } from 'types/form'
import { LightConeId } from 'types/lightCone'

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
  equipped: Build,
  name: string,
  scoringType: ScoringType,
  team: Array<BuildTeammate>,
  optimizerMetadata: {
    teammates: Array<{
      id: CharacterId,
      conditionals: unknown,
      lcConditionals: unknown,
    }>,
    setFilters: unknown,
    statFilters: unknown,
    setConditionals: unknown,
  },
}

export type BuildTeammate = {
  characterId: CharacterId,
  eidolon: number,
  lightConeId: LightConeId,
  superimposition: number,
}
