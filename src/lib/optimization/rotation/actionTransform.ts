import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { calculateContextConditionalRegistry } from 'lib/optimization/calculateConditionals'
import { calculateActions } from 'lib/optimization/context/calculateActions'
import { ComputedStatsContainer } from 'lib/optimization/engine/computedStatsContainer'
import {
  countDotAbilities,
  defineAction,
  getComboTypeAbilities,
  precomputeConditionals,
  transformConditionals,
} from 'lib/optimization/rotation/comboStateTransform'
import { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
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

export function newTransformStateActions(comboState: ComboState, request: Form, context: OptimizerContext) {
  const { comboTurnAbilities, comboDot } = getComboTypeAbilities(request)
  calculateActionDeclarations(request, context)

  // ComboTurnAbilities are the string[] representation of the rotation
  // ComboState contains the activation status of each conditional for each ability in the rotation
  // Calculating Combo DMG uses ComboTurnAbilities[1] -> ComboTurnAbilities[n]
  // Calculating each individual ability's default damage uses ComboTurnAbilities[0]
  // Therefore there will be an action calculation each default action definition, then also each rotation action

  // Combo Rotation

  const rotationActions: OptimizerAction[] = []

  for (let i = 1; i < comboTurnAbilities.length; i++) {
    rotationActions.push(defineAction(i, comboState, comboTurnAbilities[i], request, context))
  }

  // Defaults

  const defaultActions: OptimizerAction[] = []

  for (let i = 0; i < context.actionDeclarations.length; i++) {
    const actionDeclaration = context.actionDeclarations[i]
    defaultActions.push(defineAction(0, comboState, actionDeclaration as TurnAbilityName, request, context))
  }

  context.defaultActions = defaultActions
  context.rotationActions = rotationActions

  // calculateActions(request, context)

  for (let i = 0; i < rotationActions.length; i++) {
    prepareActionData(rotationActions[i], i, comboState, request, context)
  }

  for (let i = 0; i < defaultActions.length; i++) {
    prepareActionData(defaultActions[i], 0, comboState, request, context)
  }

  const characterConditionalController = CharacterConditionalsResolver.get(context)

  context.dotAbilities = countDotAbilities(rotationActions)
  context.comboDot = comboDot || 0
  context.activeAbilities = characterConditionalController.activeAbilities ?? []
  context.activeAbilityFlags = context.activeAbilities.reduce((ability, flags) => ability | flags, 0)
}

function prepareActionData(action: OptimizerAction, i: number, comboState: ComboState, request: Form, context: OptimizerContext) {
  const container = new ComputedStatsContainer(context)
  console.log(container)

  action.precomputedStats = container

  if (comboState.comboTeammate0) {
    action.teammate0.actorId = comboState.comboTeammate0.metadata.characterId
    action.teammate0.characterConditionals = transformConditionals(i, comboState.comboTeammate0.characterConditionals)
    action.teammate0.lightConeConditionals = transformConditionals(i, comboState.comboTeammate0.lightConeConditionals)
  }

  if (comboState.comboTeammate1) {
    action.teammate1.actorId = comboState.comboTeammate1.metadata.characterId
    action.teammate1.characterConditionals = transformConditionals(i, comboState.comboTeammate1.characterConditionals)
    action.teammate1.lightConeConditionals = transformConditionals(i, comboState.comboTeammate1.lightConeConditionals)
  }

  if (comboState.comboTeammate2) {
    action.teammate2.actorId = comboState.comboTeammate2.metadata.characterId
    action.teammate2.characterConditionals = transformConditionals(i, comboState.comboTeammate2.characterConditionals)
    action.teammate2.lightConeConditionals = transformConditionals(i, comboState.comboTeammate2.lightConeConditionals)
  }

  precomputeConditionals(action, comboState, context)
  calculateContextConditionalRegistry(action, context)
}

export function calculateActionDeclarations(request: OptimizerForm, context: OptimizerContext) {
  const characterConditionalController = CharacterConditionalsResolver.get(context)
  const actionDeclarations = characterConditionalController.actionDeclaration()
  const actionDefinitionProvider = characterConditionalController.actionDefinition
  const actionMapping: Record<string, ((action: OptimizerAction, context: OptimizerContext) => HitAction[])> = {}
  const actionModifiers = [
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
    actionModifiers.concat(actionModifiers)
  }

  context.actionDeclarations = actionDeclarations
  context.actionModifiers = actionModifiers
  context.actionMapping = actionMapping
}
