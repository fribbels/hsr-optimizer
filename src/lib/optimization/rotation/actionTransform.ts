import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
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

  // ========== PHASE 1: STRUCTURE DEFINITION ==========

  const defaultActions: OptimizerAction[] = context.actionDeclarations.map((actionDeclaration, index) => {
    const action = defineAction(false, index, comboState, actionDeclaration as TurnAbilityName, request, context)

    const actionDefinitions = context.characterController.actionDefinition(action, context)
    action.hits = actionDefinitions[actionDeclaration].hits as Hit[]

    for (const modifier of context.actionModifiers) {
      modifier.modify(action, context)
    }

    return action
  })

  const rotationActions: OptimizerAction[] = comboTurnAbilities.slice(1)
    .map((turnAbility, index) => {
      const comboIndex = index + 1
      const action = defineAction(true, comboIndex, comboState, turnAbility, request, context)

      const actionKind = action.actionType
      const actionDefinitions = context.characterController.actionDefinition(action, context)
      const actionDef = actionDefinitions[actionKind]

      // Skip marker abilities that don't have hit definitions
      if (!actionDef) {
        return null
      }

      action.hits = actionDef.hits as Hit[]

      for (const modifier of context.actionModifiers) {
        modifier.modify(action, context)
      }

      return action
    })
    .filter((action): action is OptimizerAction => action !== null)

  // ========== PHASE 2: REGISTRATION ==========

  let hitCounter = 0
  let actionCounter = 0
  const allActions = [...defaultActions, ...rotationActions]

  for (const action of allActions) {
    action.registerIndices = []

    for (let i = 0; i < action.hits!.length; i++) {
      const hit = action.hits![i]
      hit.localHitIndex = i
      hit.registerIndex = hitCounter
      action.registerIndices.push(hitCounter)
      hitCounter++
    }
    action.registerIndex = actionCounter++
  }

  context.outputRegistersLength = hitCounter
  context.defaultActions = defaultActions
  context.rotationActions = rotationActions
  context.allActions = allActions

  // ========== PHASE 3: CONFIGURATION ==========

  for (let i = 0; i < allActions.length; i++) {
    const action = allActions[i]
    const isDefault = i < defaultActions.length
    const comboIndex = isDefault ? 0 : (i - defaultActions.length + 1)

    const entityRegistry = prepareEntitiesForAction(action, context)

    for (const hit of action.hits!) {
      hit.sourceEntityIndex = hit.sourceEntity
        ? entityRegistry.getIndex(hit.sourceEntity)
        : 0
    }

    const container = new ComputedStatsContainer()
    action.config = new ComputedStatsContainerConfig(action, context, entityRegistry)
    container.setConfig(action.config)
    action.precomputedStats = container

    if (comboState.comboTeammate0) {
      action.teammate0.actorId = comboState.comboTeammate0.metadata.characterId
      action.teammate0.characterConditionals = transformConditionals(comboIndex, comboState.comboTeammate0.characterConditionals)
      action.teammate0.lightConeConditionals = transformConditionals(comboIndex, comboState.comboTeammate0.lightConeConditionals)
    }

    if (comboState.comboTeammate1) {
      action.teammate1.actorId = comboState.comboTeammate1.metadata.characterId
      action.teammate1.characterConditionals = transformConditionals(comboIndex, comboState.comboTeammate1.characterConditionals)
      action.teammate1.lightConeConditionals = transformConditionals(comboIndex, comboState.comboTeammate1.lightConeConditionals)
    }

    if (comboState.comboTeammate2) {
      action.teammate2.actorId = comboState.comboTeammate2.metadata.characterId
      action.teammate2.characterConditionals = transformConditionals(comboIndex, comboState.comboTeammate2.characterConditionals)
      action.teammate2.lightConeConditionals = transformConditionals(comboIndex, comboState.comboTeammate2.lightConeConditionals)
    }
  }

  // ========== CALCULATE MAX ARRAY LENGTH ==========

  // Calculate maximum values for container reuse optimization
  let maxArrayLength = 0
  let maxEntitiesCount = 1
  let maxHitsCount = 0
  for (const action of allActions) {
    maxArrayLength = Math.max(maxArrayLength, action.config.arrayLength)
    maxEntitiesCount = Math.max(maxEntitiesCount, action.config.entitiesLength)
    maxHitsCount = Math.max(maxHitsCount, action.config.hitsLength)
  }
  context.maxContainerArrayLength = maxArrayLength
  context.maxEntitiesCount = maxEntitiesCount
  context.maxHitsCount = maxHitsCount

  // Initialize precomputed arrays for all actions before Phase 4
  for (const action of allActions) {
    // action.precomputedStats.a = new Float32Array(action.config.arrayLength)
    action.precomputedStats.a = new Float32Array(maxArrayLength)
  }

  // ========== PHASE 4: PRECOMPUTATION ==========

  for (const action of allActions) {
    precomputeConditionals(action, comboState, context)
    calculateContextConditionalRegistry(action, context)
  }

  // ========== FINALIZE CONTEXT ==========

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
    ...entityDefinitionsMap[name],
  }))

  return new NamedArray(entities, (entity) => entity.name)
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
