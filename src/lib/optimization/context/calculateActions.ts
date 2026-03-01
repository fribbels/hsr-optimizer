import { CharacterId } from 'types/character'
import { ConditionalValueMap } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export interface ModifierContext {
  characterId: CharacterId
  eidolon: number
  isTeammate: boolean
  ownConditionals: ConditionalValueMap
  ownLightConeConditionals: ConditionalValueMap
}

export type ActionModifier = {
  characterId?: CharacterId
  eidolon?: number
  isTeammate?: boolean
  modify: (action: OptimizerAction, context: OptimizerContext, self: ModifierContext) => void
}