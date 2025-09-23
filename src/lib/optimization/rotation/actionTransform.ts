import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  defineAction,
  getComboTypeAbilities,
} from 'lib/optimization/rotation/comboStateTransform'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import {
  Form,
  OptimizerForm,
} from 'types/form'
import { HitAction } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

function transformStateActions(comboState: ComboState, request: Form, context: OptimizerContext) {
  const { comboTurnAbilities, comboDot } = getComboTypeAbilities(request)

  // ComboTurnAbilities are the string[] representation of the rotation
  // ComboState contains the activation status of each conditional for each ability in the rotation
  // Calculating Combo DMG uses ComboTurnAbilities[1] -> ComboTurnAbilities[n]
  // Calculating each individual ability's default damage uses ComboTurnAbilities[0]
  // Therefore there will be an action calculation each default action definition, then also each rotation action

  // Combo Rotation

  const rotationActions: OptimizerAction[] = []

  for (let i = 1; i < comboTurnAbilities.length; i++) {
    rotationActions.push(defineAction(i, comboState, comboTurnAbilities, request, context))
  }

  // Defaults

  const defaultActions: OptimizerAction[] = []
}

export function calculateActionDeclarations(request: OptimizerForm, context: OptimizerContext) {
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

  context.actionDeclarations = actionDeclarations
}

