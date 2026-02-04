import type data from 'data/game_data.json'
import { Parts } from 'lib/constants/constants'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { SetConditionals } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import type { Prettify } from 'types/common'
import { ConditionalValueMap } from 'types/conditionals'
import { CustomImageConfig } from 'types/customImage'
import {
  Form,
  OrnamentSetFilters,
  RelicSetFilters,
  StatFilters,
} from 'types/form'
import { LightConeId } from 'types/lightCone'
import { Relic } from 'types/relic'

export type CharacterId = keyof typeof data.characters

export type Eidolon = number

export type Build = Partial<Record<Parts, Relic['id']>>

// store.getState().characters[0]
export type Character = {
  id: CharacterId,
  equipped: Build,
  form: Form,
  rank: number, // order in character tab
  builds?: SavedBuild[],
  portrait?: CustomImageConfig,
}

export type SavedBuild = Prettify<
  {
    equipped: Build,
    name: string,
    team: Array<BuildTeammate>,
    optimizerMetadata: BuildOptimizerMetadata | null,
    deprioritizeBuffs: boolean,
  } & Omit<BuildTeammate, 'relicSet' | 'ornamentSet'>
>

export type BuildOptimizerMetadata = {
  conditionals: Partial<Record<CharacterId | LightConeId, ConditionalValueMap>>,
  comboStateJson: string | null,
  statFilters: StatFilters | null,
  setFilters: {
    ornaments: OrnamentSetFilters,
    relics: RelicSetFilters,
  },
  setConditionals: SetConditionals,
  presets: boolean,
}

export type BuildTeammate = {
  characterId: CharacterId,
  eidolon: number,
  lightConeId: LightConeId,
  superimposition: number,
  relicSet?: string,
  ornamentSet?: string,
}
