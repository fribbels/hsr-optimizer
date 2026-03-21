import {
  ConditionalDataType,
} from 'lib/constants/constants'
import { NULL_TURN_ABILITY_NAME } from 'lib/optimization/rotation/turnAbilityConfig'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'

import type {
  ComboCharacter,
  ComboDataKey,
  ComboNumberConditional,
  ComboState,
  ComboTeammate,
} from './comboDrawerTypes'
import {
  forEachActivation,
  getEntityConditionals,
  resolveSourceKeyRoute,
  shiftLeft,
} from './comboDrawerUtils'

// ---------------------------------------------------------------------------
// Locators
// ---------------------------------------------------------------------------

export function locateComboCategory(sourceKey: string, contentItemId: string, comboState: ComboState) {
  const route = resolveSourceKeyRoute(sourceKey)
  if (!route) return null
  const entity = comboState[route.entityKey as keyof ComboState] as ComboCharacter | ComboTeammate | null
  if (!entity) return null
  const conditionals = getEntityConditionals(entity, route.conditionalsKey)
  if (!conditionals) return null
  return conditionals[contentItemId] ?? null
}

export function locateActivationsDataKey(dataKey: ComboDataKey, comboState: ComboState) {
  if (!dataKey.id) return null

  const comboCategory = locateComboCategory(dataKey.source, dataKey.id, comboState)
  if (!comboCategory) return null

  if (comboCategory.type == ConditionalDataType.BOOLEAN) {
    const comboBooleanConditional = comboCategory
    const activations = comboBooleanConditional.activations
    return {
      comboConditional: comboBooleanConditional,
      activations: activations,
      index: dataKey.index,
      value: activations[dataKey.index],
    }
  } else if (comboCategory.type == ConditionalDataType.NUMBER) {
    const comboNumberConditional = comboCategory
    const activations = comboNumberConditional.partitions[dataKey.partitionIndex].activations
    return {
      comboConditional: comboNumberConditional,
      activations: activations,
      index: dataKey.index,
      value: activations[dataKey.index],
    }
  } else if (comboCategory.type == ConditionalDataType.SELECT) {
    const comboSelectConditional = comboCategory
    const activations = comboSelectConditional.partitions[dataKey.partitionIndex].activations
    return {
      comboConditional: comboSelectConditional,
      activations: activations,
      index: dataKey.index,
      value: activations[dataKey.index],
    }
  } else {
    // No other types
  }

  return null
}

export function locateActivations(keyString: string, comboState: ComboState) {
  const dataKey: ComboDataKey = JSON.parse(keyString)
  return locateActivationsDataKey(dataKey, comboState)
}

// ---------------------------------------------------------------------------
// Updaters
// ---------------------------------------------------------------------------

export function updateActivation(keyString: string, activate: boolean, comboState: ComboState) {
  const dataKey: ComboDataKey = JSON.parse(keyString)
  if (!dataKey.id) return
  if (dataKey.index == 0) return

  const locatedActivations = locateActivations(keyString, comboState)
  if (!locatedActivations) return

  if (locatedActivations.comboConditional.type == ConditionalDataType.NUMBER || locatedActivations.comboConditional.type == ConditionalDataType.SELECT) {
    // Numbers are activated onDrag
  } else {
    locatedActivations.activations[locatedActivations.index] = activate
  }
}

export function updatePartitionActivation(keyString: string, comboState: ComboState) {
  const dataKey: ComboDataKey = JSON.parse(keyString)
  if (!dataKey.id) return
  if (dataKey.index == 0) return

  const locatedActivations = locateActivations(keyString, comboState)
  if (!locatedActivations) return

  if (locatedActivations.comboConditional.type == ConditionalDataType.NUMBER || locatedActivations.comboConditional.type == ConditionalDataType.SELECT) {
    const numberConditional = locatedActivations.comboConditional as ComboNumberConditional
    const partitionIndex = dataKey.partitionIndex
    const activationIndex = dataKey.index
    for (let i = 0; i < numberConditional.partitions.length; i++) {
      const partition = numberConditional.partitions[i]

      partition.activations[activationIndex] = i == partitionIndex
    }

    return { ...comboState }
  }
}

export function updateAddPartition(comboState: ComboState, sourceKey: string, contentItemId: string, partitionIndex: number) {
  const comboCategory = locateComboCategory(sourceKey, contentItemId, comboState) as ComboNumberConditional
  if (!comboCategory) return

  const selectedPartition = comboCategory.partitions[partitionIndex]

  comboCategory.partitions.push({
    value: selectedPartition.value,
    activations: Array(selectedPartition.activations.length).fill(false),
  })

  return { ...comboState }
}

export function updateDeletePartition(comboState: ComboState, sourceKey: string, contentItemId: string, partitionIndex: number) {
  if (partitionIndex == 0) return

  const comboCategory = locateComboCategory(sourceKey, contentItemId, comboState) as ComboNumberConditional
  if (!comboCategory) return

  comboCategory.partitions.splice(partitionIndex, 1)

  for (let i = 0; i < comboCategory.partitions[0].activations.length; i++) {
    let hasValue = false
    for (let j = 0; j < comboCategory.partitions.length; j++) {
      if (comboCategory.partitions[j].activations[i]) {
        hasValue = true
        break
      }
    }

    if (!hasValue) {
      comboCategory.partitions[0].activations[i] = true
    }
  }

  return { ...comboState }
}

export function updateBooleanDefaultSelection(comboState: ComboState, sourceKey: string, contentItemId: string, value: boolean) {
  const dataKey: ComboDataKey = {
    id: contentItemId,
    source: sourceKey,
    index: 0,
    partitionIndex: 0,
  }

  const locatedActivations = locateActivationsDataKey(dataKey, comboState)
  if (!locatedActivations) return

  if (locatedActivations.comboConditional.type == ConditionalDataType.NUMBER || locatedActivations.comboConditional.type == ConditionalDataType.SELECT) {
    // Default number is always active
  } else {
    for (let i = 0; i < locatedActivations.activations.length; i++) {
      locatedActivations.activations[i] = value
    }

    return { ...comboState }
  }
}

export function updateNumberDefaultSelection(comboState: ComboState, sourceKey: string, contentItemId: string, partitionIndex: number, value: number) {
  const dataKey: ComboDataKey = {
    id: contentItemId,
    source: sourceKey,
    index: 0,
    partitionIndex: partitionIndex,
  }

  const locatedActivations = locateActivationsDataKey(dataKey, comboState)
  if (!locatedActivations) return

  if (locatedActivations.comboConditional.type == ConditionalDataType.NUMBER || locatedActivations.comboConditional.type == ConditionalDataType.SELECT) {
    // Default number is always active
    const comboNumberConditional = locatedActivations.comboConditional as ComboNumberConditional
    comboNumberConditional.partitions[partitionIndex].value = value

    return { ...comboState }
  } else {
    //
  }
}

// Index is 0 indexed, and only includes the interactable elements, not including the [0] default
export function updateAbilityRotation(comboState: ComboState, index: number, turnAbilityName: TurnAbilityName) {
  const comboTurnAbilities = comboState.comboTurnAbilities

  if (index > comboTurnAbilities.length) return
  if (turnAbilityName == NULL_TURN_ABILITY_NAME) {
    if (comboTurnAbilities.length <= 2) return
    comboTurnAbilities.splice(index, 1)
    const entities = [comboState.comboCharacter, comboState.comboTeammate0, comboState.comboTeammate1, comboState.comboTeammate2]
    for (const entity of entities) {
      if (entity) forEachActivation(entity, (arr) => shiftLeft(arr, index))
    }
  } else {
    comboTurnAbilities[index] = turnAbilityName
    const entities = [comboState.comboCharacter, comboState.comboTeammate0, comboState.comboTeammate1, comboState.comboTeammate2]
    for (const entity of entities) {
      if (entity) forEachActivation(entity, (arr) => { arr[index] = arr[0] })
    }
  }

  return { ...comboState }
}

