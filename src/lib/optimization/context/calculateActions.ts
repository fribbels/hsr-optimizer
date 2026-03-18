import type { CharacterId } from 'types/character'
import type { ConditionalValueMap } from 'types/conditionals'
import type {
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