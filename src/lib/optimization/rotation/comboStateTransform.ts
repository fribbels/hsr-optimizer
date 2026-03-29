import { ComboType } from 'lib/optimization/rotation/comboType'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ConditionalDataType,
} from 'lib/constants/constants'
import { type DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  getTeammateOption,
  orderedSetConditionalFields,
  setConfigRegistry,
} from 'lib/sets/setConfigRegistry'
import { newTransformStateActions } from 'lib/optimization/rotation/actionTransform'
import {
  DEFAULT_BASIC,
  getAbilityKind,
  NULL_TURN_ABILITY_NAME,
  type TurnAbilityName,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type {
  ComboConditionalCategory,
  ComboConditionals,
  ComboSelectConditional,
  ComboState,
} from 'lib/optimization/combo/comboTypes'
import { initializeComboState } from 'lib/optimization/combo/comboInitializers'
import { type CharacterId } from 'types/character'
import {
  type CharacterConditionalsController,
  type ConditionalValueMap,
  type LightConeConditionalsController,
} from 'types/conditionals'
import {
  type Form,
  type OptimizerForm,
} from 'types/form'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'

export function transformComboState(request: Form, context: OptimizerContext) {
  const merge = request.comboType == ComboType.ADVANCED
    && !!request.comboStateJson
    && request.comboStateJson != '{}'

  const comboState = initializeComboState(request, merge)
  newTransformStateActions(comboState, request, context)
}

export function defineAction(
  rotation: boolean,
  actionIndex: number,
  comboState: ComboState,
  abilityName: TurnAbilityName,
  request: OptimizerForm,
  context: OptimizerContext,
) {
  const action: OptimizerAction = {
    characterConditionals: {},
    lightConeConditionals: {},
    setConditionals: {},
    teammate0: {
      characterConditionals: {},
      lightConeConditionals: {},
    },
    teammate1: {
      characterConditionals: {},
      lightConeConditionals: {},
    },
    teammate2: {
      characterConditionals: {},
      lightConeConditionals: {},
    },
    teammateDynamicConditionals: [] as DynamicConditional[],
  } as OptimizerAction
  action.actorId = context.characterId
  action.actorEidolon = context.characterEidolon
  action.actionIndex = actionIndex
  action.actionType = getAbilityKind(abilityName)
  action.actionName = abilityName
  action.actionIdentifier = rotation
    ? 'Rotation' + actionIndex
    : 'Default' + actionIndex

  const conditionalIndex = rotation ?  actionIndex : 0
  action.conditionalIndex = conditionalIndex

  action.characterConditionals = transformConditionals(conditionalIndex, comboState.comboCharacter.characterConditionals)
  action.lightConeConditionals = transformConditionals(conditionalIndex, comboState.comboCharacter.lightConeConditionals)
  action.setConditionals = transformSetConditionals(conditionalIndex, comboState.comboCharacter.setConditionals)
  action.setConditionals = overrideSetConditionals(action.setConditionals, context)

  if (comboState.comboTeammate0) {
    action.teammate0.actorId = comboState.comboTeammate0.metadata.characterId
    action.teammate0.actorEidolon = comboState.comboTeammate0.metadata.characterEidolon
    action.teammate0.characterConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate0.characterConditionals)
    action.teammate0.lightConeConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate0.lightConeConditionals)
  }

  if (comboState.comboTeammate1) {
    action.teammate1.actorId = comboState.comboTeammate1.metadata.characterId
    action.teammate1.actorEidolon = comboState.comboTeammate1.metadata.characterEidolon
    action.teammate1.characterConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate1.characterConditionals)
    action.teammate1.lightConeConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate1.lightConeConditionals)
  }

  if (comboState.comboTeammate2) {
    action.teammate2.actorId = comboState.comboTeammate2.metadata.characterId
    action.teammate2.actorEidolon = comboState.comboTeammate2.metadata.characterEidolon
    action.teammate2.characterConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate2.characterConditionals)
    action.teammate2.lightConeConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate2.lightConeConditionals)
  }

  return action
}

export function precomputeConditionals(action: OptimizerAction, comboState: ComboState, context: OptimizerContext) {
  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(comboState.comboCharacter.metadata)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(comboState.comboCharacter.metadata)

  const container = action.precomputedStats

  lightConeConditionals.initializeConfigurationsContainer?.(container, action, context)
  characterConditionals.initializeConfigurationsContainer?.(container, action, context)

  const teammates = [
    comboState.comboTeammate0,
    comboState.comboTeammate1,
    comboState.comboTeammate2,
  ].filter((x) => !!x?.metadata?.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!

    const teammateAction = {
      actorId: teammate.metadata.characterId,
      actorEidolon: teammate.metadata.characterEidolon,
      characterConditionals: transformConditionals(action.conditionalIndex, teammate.characterConditionals),
      lightConeConditionals: transformConditionals(action.conditionalIndex, teammate.lightConeConditionals),
      config: action.config,
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate.metadata)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate.metadata)

    teammateCharacterConditionals.initializeTeammateConfigurationsContainer?.(container, teammateAction, context)
    teammateLightConeConditionals.initializeTeammateConfigurationsContainer?.(container, teammateAction, context)
  }

  lightConeConditionals.precomputeEffectsContainer?.(container, action, context)
  characterConditionals.precomputeEffectsContainer?.(container, action, context)

  lightConeConditionals.precomputeMutualEffectsContainer?.(container, action, context, action)
  characterConditionals.precomputeMutualEffectsContainer?.(container, action, context, action)

  precomputeTeammates(action, comboState, context)
}

function precomputeTeammates(action: OptimizerAction, comboState: ComboState, context: OptimizerContext) {
  // Precompute teammate effects
  const x = action.precomputedStats
  const teammateSetEffects: Record<string, boolean> = {}
  const teammates = [
    comboState.comboTeammate0,
    comboState.comboTeammate1,
    comboState.comboTeammate2,
  ].filter((t) => !!t?.metadata?.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!
    // This is set to null so empty light cones don't get overwritten by the main lc. TODO: There's probably a better place for this
    const teammateRequest = Object.assign({}, teammates[i])

    const teammateAction = {
      actorId: teammate.metadata.characterId,
      actorEidolon: teammate.metadata.characterEidolon,
      characterConditionals: transformConditionals(action.conditionalIndex, teammate.characterConditionals),
      lightConeConditionals: transformConditionals(action.conditionalIndex, teammate.lightConeConditionals),
      config: action.config,
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate.metadata)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate.metadata)

    if (teammateCharacterConditionals.precomputeMutualEffectsContainer) {
      teammateCharacterConditionals.precomputeMutualEffectsContainer(x, teammateAction, context, action)
    }
    if (teammateCharacterConditionals.precomputeTeammateEffectsContainer) {
      teammateCharacterConditionals.precomputeTeammateEffectsContainer(x, teammateAction, context, action)
    }

    if (teammateLightConeConditionals.precomputeMutualEffectsContainer) {
      teammateLightConeConditionals.precomputeMutualEffectsContainer(x, teammateAction, context)
    }
    if (teammateLightConeConditionals.precomputeTeammateEffectsContainer) {
      teammateLightConeConditionals.precomputeTeammateEffectsContainer(x, teammateAction, context)
    }

    for (const [key, value] of [...Object.entries(teammateRequest.relicSetConditionals), ...Object.entries(teammateRequest.ornamentSetConditionals)]) {
      if (value.type == ConditionalDataType.BOOLEAN) {
        const booleanComboConditional = value
        if (!booleanComboConditional.activations[action.conditionalIndex]) {
          continue
        }
      } else {
        continue
      }

      const teammateOption = getTeammateOption(key)
      if (!teammateOption) continue
      if (teammateOption.nonstackable && teammateSetEffects[key]) continue

      teammateOption.effect({
        x,
        characterElement: comboState.comboCharacter.metadata.element,
        teammateElement: teammateRequest.metadata.element,
        teammateActorId: teammateAction.actorId,
      })

      // Track unique buffs
      teammateSetEffects[key] = true
    }
  }

  action.config.teammateSetEffects = teammateSetEffects
}

export function transformConditionals(actionIndex: number, conditionals: ComboConditionals) {
  const result: Record<string, number | boolean> = {}
  for (const [key, category] of Object.entries(conditionals)) {
    result[key] = transformConditional(category, actionIndex)
  }

  return result as ConditionalValueMap
}

function transformConditional(category: ComboConditionalCategory, actionIndex: number) {
  if (category.type == ConditionalDataType.BOOLEAN) {
    const booleanCategory = category
    return booleanCategory.activations[actionIndex] ?? false
  }

  const partitionCategory = category as ComboSelectConditional
  for (let i = 0; i < partitionCategory.partitions.length; i++) {
    const partition = partitionCategory.partitions[i]
    if (partition.activations[actionIndex]) {
      return partition.value
    }
  }

  return partitionCategory.partitions[0]?.value ?? 0
}

function transformSetConditionals(actionIndex: number, conditionals: ComboConditionals): SetConditional {
  const result: Record<string, boolean | number> = {}
  for (const field of orderedSetConditionalFields) {
    const comboEntry = conditionals[field.setKey]
    if (!comboEntry) {
      result[field.fieldName] = 0
      continue
    }
    result[field.fieldName] = transformConditional(comboEntry, actionIndex)
  }
  return result as SetConditional
}

export function getDefaultComboTurnAbilities(characterId: CharacterId, characterEidolon: number) {
  const simulation = getGameMetadata().characters[characterId]?.scoringMetadata?.simulation
  return {
    comboTurnAbilities: [...(simulation?.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC])],
  }
}

export function getComboTypeAbilities(form: OptimizerForm) {
  if (form.comboType == ComboType.SIMPLE) {
    return getDefaultComboTurnAbilities(form.characterId, form.characterEidolon)
  }

  return {
    comboTurnAbilities: form.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC],
  }
}

function overrideSetConditionals(setConditionals: SetConditional, context: OptimizerContext): SetConditional {
  const record = setConditionals as Record<string, boolean | number>
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.overrideConditional) {
      const prefix = config.display.conditionalType === ConditionalDataType.BOOLEAN ? 'enabled' : 'value'
      const fieldName = `${prefix}${config.setKey}`
      if (record[fieldName] !== undefined) {
        record[fieldName] = config.conditionals.overrideConditional(record[fieldName], context)
      }
    }
  }
  return setConditionals
}

