import { type ConditionalDataType } from 'lib/constants/constants'
import type {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import { type defaultSetConditionals } from 'lib/optimization/defaultForm'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

export type ComboConditionals = {
  [key: string]: ComboConditionalCategory,
}

export type ComboConditionalCategory = ComboBooleanConditional | ComboNumberConditional | ComboSelectConditional

export type ComboBooleanConditional = {
  type: ConditionalDataType.BOOLEAN,
  activations: boolean[],
  display?: boolean,
}

export type ComboNumberConditional = {
  type: ConditionalDataType.NUMBER,
  partitions: ComboSubNumberConditional[],
  display?: boolean,
}

export type ComboSubNumberConditional = {
  value: number,
  activations: boolean[],
}

export type ComboSelectConditional = {
  type: ConditionalDataType.SELECT,
  partitions: ComboSubSelectConditional[],
  display?: boolean,
}

export type ComboSubSelectConditional = {
  value: number,
  activations: boolean[],
}

export type ComboCharacterMetadata = {
  characterId: CharacterId,
  characterEidolon: number,
  path: PathName,
  lightCone: LightConeId,
  lightConeSuperimposition: number,
  lightConePath: PathName,
  element: ElementName,
}

export type ComboCharacter = {
  metadata: ComboCharacterMetadata,
  characterConditionals: ComboConditionals,
  lightConeConditionals: ComboConditionals,
  setConditionals: ComboConditionals,
  displayedRelicSets: string[],
  displayedOrnamentSets: string[],
}

export type ComboTeammate = {
  metadata: ComboCharacterMetadata,
  characterConditionals: ComboConditionals,
  lightConeConditionals: ComboConditionals,
  relicSetConditionals: ComboConditionals,
  ornamentSetConditionals: ComboConditionals,
}

export type ComboState = {
  comboCharacter: ComboCharacter,
  comboTeammate0: ComboTeammate | null,
  comboTeammate1: ComboTeammate | null,
  comboTeammate2: ComboTeammate | null,
  comboTurnAbilities: TurnAbilityName[],
  version?: string,
}

export const COMBO_STATE_JSON_VERSION = '1.1'

export type SetConditionals = typeof defaultSetConditionals

export type ComboDataKey = {
  id: string,
  source: string,
  partitionIndex: number,
  index: number,
}
