import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { calculateContextConditionalRegistry } from 'lib/optimization/calculateConditionals'
import {
  ActionModifier,
  ModifierContext,
} from 'lib/optimization/context/calculateActions'
import { StatKey } from 'lib/optimization/engine/config/keys'
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
import { TsUtils } from 'lib/utils/TsUtils'
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
    const actionDef = actionDefinitions[actionDeclaration]
    actionDef.actionKind = actionDeclaration
    // @ts-ignore
    action.actionType = actionDeclaration
    action.hits = actionDef.hits as Hit[]

    for (const modifier of context.actionModifiers) {
      const self = buildModifierContext(action, modifier)
      modifier.modify(action, context, self)
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

      action.actionType = actionKind
      action.hits = actionDef.hits as Hit[]

      for (const modifier of context.actionModifiers) {
        const self = buildModifierContext(action, modifier)
        modifier.modify(action, context, self)
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

    const { primaryEntityRegistry, teammateEntityRegistry } = prepareEntitiesForAction(action, context)

    for (const hit of action.hits!) {
      hit.sourceEntityIndex = hit.sourceEntity
        ? primaryEntityRegistry.getIndex(hit.sourceEntity)
        : 0
      // scalingEntityIndex defaults to sourceEntityIndex if not specified
      hit.scalingEntityIndex = hit.scalingEntity
        ? primaryEntityRegistry.getIndex(hit.scalingEntity)
        : hit.sourceEntityIndex
    }

    const container = new ComputedStatsContainer()
    action.config = new ComputedStatsContainerConfig(action, context, primaryEntityRegistry)
    container.setConfig(action.config)
    if (request.trace) {
      container.enableTracing()
    }
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
  let maxStatsArrayLength = 0
  let maxEntitiesCount = 1
  let maxHitsCount = 0
  for (const action of allActions) {
    maxArrayLength = Math.max(maxArrayLength, action.config.arrayLength)
    maxStatsArrayLength = Math.max(maxStatsArrayLength, action.config.registersOffset)
    maxEntitiesCount = Math.max(maxEntitiesCount, action.config.entitiesLength)
    maxHitsCount = Math.max(maxHitsCount, action.config.hitsLength)
  }
  context.maxContainerArrayLength = maxArrayLength
  context.maxStatsArrayLength = maxStatsArrayLength
  context.maxEntitiesCount = maxEntitiesCount
  context.maxHitsCount = maxHitsCount

  // Initialize precomputed arrays for all actions before Phase 4
  // Use stats-only length so setPrecompute doesn't overwrite registers
  for (const action of allActions) {
    action.precomputedStats.a = new Float32Array(maxStatsArrayLength)
  }

  // ========== PHASE 4: PRECOMPUTATION ==========

  for (const action of allActions) {
    if (context.enemyWeaknessBroken) {
      action.precomputedStats.actionBuff(StatKey.ENEMY_WEAKNESS_BROKEN, 1)
    }

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

interface PreparedEntities {
  primaryEntityRegistry: NamedArray<OptimizerEntity>
  teammateEntityRegistry: NamedArray<OptimizerEntity>
}

function prepareEntitiesForAction(
  action: OptimizerAction,
  context: OptimizerContext,
): PreparedEntities {
  const entityDefinitionsMap: Record<string, any> = {}

  // Main character entities
  const characterController = context.characterController
  const primaryEntityNames = characterController.entityDeclaration()
  const charEntityDefs = TsUtils.clone(characterController.entityDefinition(action, context))

  Object.assign(entityDefinitionsMap, charEntityDefs)

  // Teammate entities
  const teammateEntityNames: string[] = []
  for (const teammateController of context.teammateControllers) {
    if (teammateController.entityDeclaration) {
      const controllerEntityNames = teammateController.entityDeclaration()
      teammateEntityNames.push(...controllerEntityNames)

      if (teammateController.entityDefinition) {
        const teammateEntityDefs = TsUtils.clone(teammateController.entityDefinition(action, context))
        Object.values(teammateEntityDefs).forEach((entityDefinition) => {
          entityDefinition.teammate = true
        })
        Object.assign(entityDefinitionsMap, teammateEntityDefs)
      }
    }
  }

  // Build primary entity registry
  const primaryEntities: OptimizerEntity[] = primaryEntityNames.map((name) => ({
    name: name,
    ...entityDefinitionsMap[name],
  }))
  const primaryEntityRegistry = new NamedArray(primaryEntities, (entity) => entity.name)

  // Build teammate entity registry
  const teammateEntities: OptimizerEntity[] = teammateEntityNames.map((name) => ({
    name: name,
    ...entityDefinitionsMap[name],
  }))
  const teammateEntityRegistry = new NamedArray(teammateEntities, (entity) => entity.name)

  return { primaryEntityRegistry, teammateEntityRegistry }
}

function buildModifierContext(
  action: OptimizerAction,
  modifier: ActionModifier,
): ModifierContext {
  if (!modifier.isTeammate) {
    return {
      characterId: modifier.characterId!,
      eidolon: modifier.eidolon ?? 0,
      isTeammate: false,
      ownConditionals: action.characterConditionals,
      ownLightConeConditionals: action.lightConeConditionals,
    }
  }

  // Find teammate slot
  const teammates = [action.teammate0, action.teammate1, action.teammate2]
  for (const teammate of teammates) {
    if (teammate?.actorId === modifier.characterId) {
      return {
        characterId: modifier.characterId!,
        eidolon: modifier.eidolon ?? teammate.actorEidolon ?? 0,
        isTeammate: true,
        ownConditionals: teammate.characterConditionals,
        ownLightConeConditionals: teammate.lightConeConditionals,
      }
    }
  }

  // Fallback (shouldn't happen)
  return {
    characterId: modifier.characterId!,
    eidolon: modifier.eidolon ?? 0,
    isTeammate: true,
    ownConditionals: {},
    ownLightConeConditionals: {},
  }
}

export function calculateActionDeclarations(request: OptimizerForm, context: OptimizerContext) {
  const characterConditionalController = CharacterConditionalsResolver.get(context)
  const actionDeclarations = characterConditionalController.actionDeclaration()

  // Tag main character's modifiers with source info
  const mainCharacterModifiers = characterConditionalController.actionModifiers()
  for (const modifier of mainCharacterModifiers) {
    modifier.characterId = context.characterId
    modifier.eidolon = context.characterEidolon
    modifier.isTeammate = false
  }
  const actionModifiers: ActionModifier[] = [...mainCharacterModifiers]

  // Also collect light cone modifiers for main character
  const lightConeController = LightConeConditionalsResolver.get(context)
  const lightConeModifiers = lightConeController.actionModifiers?.() ?? []
  actionModifiers.push(...lightConeModifiers)

  const teammates = [
    context.teammate0Metadata,
    context.teammate1Metadata,
    context.teammate2Metadata,
  ].filter((x) => !!x?.characterId)

  const teammateControllers: CharacterConditionalsController[] = []

  for (const teammate of teammates) {
    const teammateController = CharacterConditionalsResolver.get(teammate)
    teammateControllers.push(teammateController)

    // Tag teammate's character modifiers with source info
    const teammateActionModifiers = teammateController.actionModifiers?.() ?? []
    for (const modifier of teammateActionModifiers) {
      modifier.characterId = teammate.characterId
      modifier.eidolon = teammate.characterEidolon
      modifier.isTeammate = true
    }
    actionModifiers.push(...teammateActionModifiers)

    // Tag teammate's light cone modifiers with source info
    const teammateLcController = LightConeConditionalsResolver.get(teammate)
    const teammateLcModifiers = teammateLcController.actionModifiers?.() ?? []
    for (const modifier of teammateLcModifiers) {
      modifier.characterId = teammate.characterId
      modifier.isTeammate = true
    }
    actionModifiers.push(...teammateLcModifiers)
  }

  context.actionDeclarations = actionDeclarations
  context.actionModifiers = actionModifiers
  context.characterController = characterConditionalController
  context.teammateControllers = teammateControllers
}
