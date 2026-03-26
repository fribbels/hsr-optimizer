import type { Parts } from 'lib/constants/constants'
import type { SetConditionals } from 'lib/optimization/combo/comboTypes'
import type { ComboType } from 'lib/optimization/rotation/comboType'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import type { CharacterId } from 'types/character'
import type { ConditionalValueMap } from 'types/conditionals'
import type { LightConeId } from 'types/lightCone'
import type { Relic } from 'types/relic'

export type Build = Partial<Record<Parts, Relic['id']>>

export enum BuildSource {
  Character = 'character',
  Optimizer = 'optimizer',
}

// Uses canonical TeammateState field names — no renaming
export type SavedTeammate = {
  characterId: CharacterId
  characterEidolon: number
  lightCone: LightConeId
  lightConeSuperimposition: number
  teamRelicSet: string | undefined
  teamOrnamentSet: string | undefined
}

export type SavedTeammateWithConditionals = SavedTeammate & {
  characterConditionals: ConditionalValueMap
  lightConeConditionals: ConditionalValueMap
}

export type TeamTuple<T> = [T | null, T | null, T | null]

type SavedBuildBase = {
  name: string
  characterId: CharacterId
  equipped: Build
  characterEidolon: number
  lightCone: LightConeId
  lightConeSuperimposition: number
}

export type CharacterSavedBuild = SavedBuildBase & {
  source: BuildSource.Character
  team: TeamTuple<SavedTeammate>
}

export type OptimizerSavedBuild = SavedBuildBase & {
  source: BuildSource.Optimizer
  team: TeamTuple<SavedTeammateWithConditionals>
  characterConditionals: ConditionalValueMap
  lightConeConditionals: ConditionalValueMap
  setConditionals: SetConditionals
  comboType: ComboType
  comboStateJson: string
  comboPreprocessor: boolean
  comboTurnAbilities: TurnAbilityName[]
  deprioritizeBuffs: boolean
}

export type SavedBuild = CharacterSavedBuild | OptimizerSavedBuild
