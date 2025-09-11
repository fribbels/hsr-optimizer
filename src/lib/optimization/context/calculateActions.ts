import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { OptimizerEntity } from 'lib/optimization/engine/computedStatsContainer'
import {
  CharacterConditionalsController,
  LightConeConditionalsController,
} from 'types/conditionals'
import { OptimizerForm } from 'types/form'
import { HitAction } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export type ActionModifier = { modify: (action: OptimizerAction, context: OptimizerContext) => void }

export function calculateEntities(request: OptimizerForm, context: OptimizerContext) {
  const characterConditionalController = CharacterConditionalsResolver.get(context)

  // Define entities
  const entities: OptimizerEntity[] = [
    ...characterConditionalController.entityDeclaration(),
  ]

  const teammates = [
    context.teammate0Metadata,
    context.teammate1Metadata,
    context.teammate2Metadata,
  ].filter((x) => !!x.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate)

    if (teammateCharacterConditionals.entityDeclaration) {
      entities.push(...teammateCharacterConditionals.entityDeclaration())
    }
  }

  context.entities = entities
}

export function calculateActions(request: OptimizerForm, context: OptimizerContext) {
  const actions = context.actions

  const characterConditionalController = CharacterConditionalsResolver.get(context)
  const actionDeclarations = characterConditionalController.actionDeclaration()
  const actionDefinitionProvider = characterConditionalController.actionDefinition
  const actionMapping: Record<string, ((action: OptimizerAction, context: OptimizerContext) => HitAction[]) | undefined> = {}
  const modifiers = [
    ...characterConditionalController.actionModifiers(),
  ]

  // Define action mapping

  for (const actionDeclaration of actionDeclarations) {
    actionMapping[actionDeclaration] = actionDefinitionProvider
  }

  const teammates = [
    context.teammate0Metadata,
    context.teammate1Metadata,
    context.teammate2Metadata,
  ].filter((x) => !!x.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate)

    const actionDeclarations = teammateCharacterConditionals.actionDeclaration?.() ?? []
    const actionDefinitionProvider = teammateCharacterConditionals.actionDefinition
    for (const actionDeclaration of actionDeclarations) {
      actionMapping[actionDeclaration] = actionDefinitionProvider
    }

    const actionModifiers = teammateCharacterConditionals.actionModifiers?.() ?? []
    modifiers.concat(actionModifiers)
  }

  // Condense

  const hitActions: HitAction[] = []
  for (let i = 1; i < actions.length; i++) {
    const action = actions[i]!
    const provider = actionMapping[action.actionType]!
    const hitAction = provider(action, context).find((x) => x.name == action.actionType)!

    hitActions[i] = hitAction
    action.hits = hitAction.hits
  }

  context.hitActions = hitActions

  // Apply modifiers

  for (let i = 1; i < actions.length; i++) {
    const action = actions[i]!
    for (const modifier of modifiers) {
      modifier.modify(action, context)
    }
  }
}

export function getTeammateMetadata(context: OptimizerContext) {
  const teammateCharacterConditionalControllers: CharacterConditionalsController[] = []
  const teammateLightConeConditionalControllers: LightConeConditionalsController[] = []

  const teammates = [
    context.teammate0Metadata,
    context.teammate1Metadata,
    context.teammate2Metadata,
  ].filter((x) => !!x.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!

    const characterConditionals = CharacterConditionalsResolver.get(teammate)
    const lightConeConditionals = LightConeConditionalsResolver.get(teammate)

    teammateCharacterConditionalControllers.push(characterConditionals)
    teammateLightConeConditionalControllers.push(lightConeConditionals)
  }

  return {
    teammateCharacterConditionalControllers,
    teammateLightConeConditionalControllers,
  }
}
