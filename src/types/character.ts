import type data from 'data/game_data.json'
import type { Parts } from 'lib/constants/constants'
import type { SetConditionals } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import type { Prettify } from 'types/common'
import type { ConditionalValueMap } from 'types/conditionals'
import type { CustomImageConfig } from 'types/customImage'
import type { SetFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicSetFilterModal/relicSetFilterModalTypes'
import type {
  Form,
  OrnamentSetFilters,
  RelicSetFilters,
  StatFilters,
} from 'types/form'
import type { LightConeId } from 'types/lightCone'
import type { Relic } from 'types/relic'

export type CharacterId = keyof typeof data.characters

export type Eidolon = number

export type Build = Partial<Record<Parts, Relic['id']>>

// store.getState().characters[0]
export type Character = {
  id: CharacterId,
  equipped: Build,
  form: Form,
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
  comboStateJson: string | null,
  statFilters: StatFilters | null,
  setFilters?: SetFilters,
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
  characterConditionals: ConditionalValueMap | undefined,
  lightConeConditionals: ConditionalValueMap | undefined,
}
