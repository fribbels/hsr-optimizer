import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { calculateContextConditionalRegistry } from 'lib/optimization/calculateConditionals'
import {
  ComputedStatsContainer,
  ComputedStatsContainerConfig,
  OptimizerEntity,
} from 'lib/optimization/engine/container/computedStatsContainer'
import { NamedArray } from 'lib/optimization/engine/util/namedArray'
import {
  countDotAbilities,
  defineAction,
  getComboTypeAbilities,
  precomputeConditionals,
  transformConditionals,
} from 'lib/optimization/rotation/comboStateTransform'
import { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  Form,
  OptimizerForm,
} from 'types/form'
import { Hit } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function newTransformStateActions(comboState: ComboState, request: Form, context: OptimizerContext) {
  const { comboTurnAbilities, comboDot } = getComboTypeAbilities(request)
  calculateActionDeclarations(request, context)

  let hitCounter = 0
  let actionCounter = 0

  // Helper to fully initialize an action with hits and register indices
  function initializeAction(
    comboIndex: number,
    actionName: string,
    isDefaultAction: boolean = false,
  ): OptimizerAction {
    // 1. Create action
    const action = defineAction(comboIndex, comboState, actionName as TurnAbilityName, request, context)

    // 2. Get initial hits from definition
    const actionKind = isDefaultAction ? actionName : action.actionType
    const actionDefinitions = context.characterController.actionDefinition(action, context)
    action.hits = actionDefinitions[actionKind].hits as Hit[] // Cast without registerIndex

    // 3. Apply modifiers (may add more hits)
    for (const modifier of context.actionModifiers) {
      modifier.modify(action, context)
    }

    // 4. Assign registerIndex to all hits (original + added by modifiers)
    action.registerIndices = []
    for (const hit of action.hits) {
      hit.registerIndex = hitCounter
      action.registerIndices.push(hitCounter)
      hitCounter++
    }

    // 5. Prepare action data and assign action register
    prepareActionData(action, isDefaultAction ? 0 : comboIndex, comboState, request, context)
    action.registerIndex = actionCounter++

    return action
  }

  // Create default actions
  const defaultActions = context.actionDeclarations.map((actionDeclaration) => initializeAction(0, actionDeclaration, true))

  // Create rotation actions
  const rotationActions = comboTurnAbilities.slice(1).map((turnAbility, index) => initializeAction(index + 1, turnAbility, false))

  // Store results
  context.defaultActions = defaultActions
  context.rotationActions = rotationActions
  context.outputRegistersLength = hitCounter

  // Finalize context
  const characterConditionalController = CharacterConditionalsResolver.get(context)
  context.dotAbilities = countDotAbilities(rotationActions)
  context.comboDot = comboDot || 0
  context.activeAbilities = characterConditionalController.activeAbilities ?? []
  context.activeAbilityFlags = context.activeAbilities.reduce((ability, flags) => ability | flags, 0)
}

function prepareEntitiesForAction(
  action: OptimizerAction,
  context: OptimizerContext,
): NamedArray<OptimizerEntity> {
  const entityNames: string[] = []
  const entityDefinitionsMap: Record<string, any> = {}

  // Main character entities
  const characterController = context.characterController
  const charEntityNames = characterController.entityDeclaration()
  const charEntityDefs = characterController.entityDefinition(action, context)

  entityNames.push(...charEntityNames)
  Object.assign(entityDefinitionsMap, charEntityDefs)

  // Teammate entities
  for (const teammateController of context.teammateControllers) {
    if (teammateController.entityDeclaration) {
      const teammateEntityNames = teammateController.entityDeclaration()
      entityNames.push(...teammateEntityNames)

      if (teammateController.entityDefinition) {
        const teammateEntityDefs = teammateController.entityDefinition(action, context)
        Object.assign(entityDefinitionsMap, teammateEntityDefs)
      }
    }
  }

  // Build OptimizerEntity array
  const entities: OptimizerEntity[] = entityNames.map((name) => ({
    name: name,
    primary: entityDefinitionsMap[name]?.primary ?? false,
    summon: entityDefinitionsMap[name]?.summon ?? false,
    memosprite: entityDefinitionsMap[name]?.memosprite ?? false,
  }))

  return new NamedArray(entities, (entity) => entity.name)
}

function prepareActionData(action: OptimizerAction, i: number, comboState: ComboState, request: Form, context: OptimizerContext) {
  // Build entities for this specific action
  const entityRegistry = prepareEntitiesForAction(action, context)

  const container = new ComputedStatsContainer()
  action.config = new ComputedStatsContainerConfig(action, context, entityRegistry)
  container.setConfig(action.config)

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
  const actionModifiers = [
    ...characterConditionalController.actionModifiers(),
  ]

  const teammates = [
    context.teammate0Metadata,
    context.teammate1Metadata,
    context.teammate2Metadata,
  ].filter((x) => !!x?.characterId)

  const teammateControllers: CharacterConditionalsController[] = []

  for (const teammate of teammates) {
    const teammateController = CharacterConditionalsResolver.get(teammate)
    teammateControllers.push(teammateController)

    const teammateActionModifiers = teammateController.actionModifiers?.() ?? []
    actionModifiers.push(...teammateActionModifiers)
  }

  context.actionDeclarations = actionDeclarations
  context.actionModifiers = actionModifiers
  context.characterController = characterConditionalController
  context.teammateControllers = teammateControllers
}
