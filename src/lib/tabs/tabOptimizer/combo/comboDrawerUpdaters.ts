import {
  ABILITY_LIMIT,
  ConditionalDataType,
} from 'lib/constants/constants'
import {
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'
import { NULL_TURN_ABILITY_NAME } from 'lib/optimization/rotation/turnAbilityConfig'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { SaveState } from 'lib/state/saveState'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { getForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import type { Form } from 'types/form'

import { COMBO_STATE_JSON_VERSION } from './comboDrawerTypes'
import type {
  ComboConditionals,
  ComboDataKey,
  ComboNumberConditional,
  ComboState,
  ComboTeammate,
  NestedObject,
} from './comboDrawerTypes'

// ---------------------------------------------------------------------------
// Locators
// ---------------------------------------------------------------------------

export function locateComboCategory(sourceKey: string, contentItemId: string, comboState: ComboState) {
  let comboConditionals: ComboConditionals

  if (sourceKey.includes('comboCharacter')) {
    const character = comboState.comboCharacter

    if (sourceKey.includes('RelicSets')) {
      comboConditionals = character.setConditionals
    } else if (sourceKey.includes('LightCone')) {
      comboConditionals = character.lightConeConditionals
    } else {
      comboConditionals = character.characterConditionals
    }
  } else if (sourceKey.includes('comboTeammate')) {
    const teammateIndexString = sourceKey.substring(0, 14) as 'comboTeammate0' | 'comboTeammate1' | 'comboTeammate2'
    const teammate = comboState[teammateIndexString]
    if (!teammate) return null
    if (sourceKey.includes('RelicSet')) {
      comboConditionals = teammate.relicSetConditionals
    } else if (sourceKey.includes('OrnamentSet')) {
      comboConditionals = teammate.ornamentSetConditionals
    } else if (sourceKey.includes('LightCone')) {
      comboConditionals = teammate.lightConeConditionals
    } else {
      comboConditionals = teammate.characterConditionals
    }
  } else {
    return null
  }

  return comboConditionals[contentItemId]
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
// Private helpers
// ---------------------------------------------------------------------------

function shiftLeft(arr: boolean[], index: number) {
  arr.splice(index, 1)
  arr.push(arr[0])
}

function shiftAllActivations(obj: NestedObject, index: number): void {
  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) continue

    if (key === 'activations' && Array.isArray(obj[key])) {
      shiftLeft(obj[key] as boolean[], index)
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      shiftAllActivations(obj[key] as NestedObject, index)
    }
  }
}

function setActivationIndexToDefault(obj: NestedObject, index: number): void {
  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) continue

    if (key === 'activations' && Array.isArray(obj[key])) {
      obj[key][index] = (obj[key] as boolean[])[0]
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      setActivationIndexToDefault(obj[key] as NestedObject, index)
    }
  }
}

function change(
  changeConditional: {
    // eslint-disable-next-line
    [key: string]: any,
  },
  originalConditional: ComboConditionals,
  set: boolean = false,
) {
  for (const [key, value] of Object.entries(changeConditional)) {
    const comboCategory = originalConditional[key]
    if (!comboCategory) continue
    if (comboCategory.type == ConditionalDataType.BOOLEAN) {
      for (let i = 0; i <= ABILITY_LIMIT; i++) {
        if (set) {
          // Set conditionals use legacy [undefined, value] format
          // eslint-disable-next-line
          comboCategory.activations[i] = value[1]
        } else {
          comboCategory.activations[i] = value
        }
      }
    }
  }
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

export function updateSelectedSets(comboState: ComboState, sets: string[], isOrnaments: boolean) {
  const setConditionals = comboState.comboCharacter.setConditionals

  if (isOrnaments) {
    comboState.comboCharacter.displayedOrnamentSets = sets

    for (const setName of Object.values(SetsOrnaments)) {
      if (sets.includes(setName)) {
        setConditionals[setName].display = true
      } else {
        setConditionals[setName].display = false
      }
    }
  } else {
    comboState.comboCharacter.displayedRelicSets = sets

    for (const setName of Object.values(SetsRelics)) {
      if (sets.includes(setName)) {
        setConditionals[setName].display = true
      } else {
        setConditionals[setName].display = false
      }
    }
  }

  updateFormState(comboState)
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
    shiftAllActivations(comboState, index)
  } else {
    comboTurnAbilities[index] = turnAbilityName
    setActivationIndexToDefault(comboState, index)
  }

  return { ...comboState }
}

export function updateFormState(comboState: ComboState) {
  comboState.version = COMBO_STATE_JSON_VERSION

  // Update store directly
  useOptimizerRequestStore.getState().setComboStateJson(JSON.stringify(comboState))
  useOptimizerRequestStore.getState().setComboTurnAbilities(comboState.comboTurnAbilities)

  const form = getForm()
  const found = getCharacterById(form.characterId)
  if (found) {
    useCharacterStore.getState().setCharacter({ ...found, form: { ...found.form, ...form } })
  }

  SaveState.delayedSave(1000)
}

export function updateConditionalChange(comboState: ComboState, changeEvent: Form) {
  if (changeEvent.characterConditionals) change(changeEvent.characterConditionals, comboState.comboCharacter.characterConditionals)
  if (changeEvent.lightConeConditionals) change(changeEvent.lightConeConditionals, comboState.comboCharacter.lightConeConditionals)
  if (changeEvent.setConditionals) change(changeEvent.setConditionals, comboState.comboCharacter.setConditionals, true)

  if (changeEvent.teammate0?.characterConditionals) change(changeEvent.teammate0.characterConditionals, comboState.comboTeammate0?.characterConditionals ?? {})
  if (changeEvent.teammate0?.lightConeConditionals) change(changeEvent.teammate0.lightConeConditionals, comboState.comboTeammate0?.lightConeConditionals ?? {})

  if (changeEvent.teammate1?.characterConditionals) change(changeEvent.teammate1.characterConditionals, comboState.comboTeammate1?.characterConditionals ?? {})
  if (changeEvent.teammate1?.lightConeConditionals) change(changeEvent.teammate1.lightConeConditionals, comboState.comboTeammate1?.lightConeConditionals ?? {})

  if (changeEvent.teammate2?.characterConditionals) change(changeEvent.teammate2.characterConditionals, comboState.comboTeammate2?.characterConditionals ?? {})
  if (changeEvent.teammate2?.lightConeConditionals) change(changeEvent.teammate2.lightConeConditionals, comboState.comboTeammate2?.lightConeConditionals ?? {})

  updateFormState(comboState)
  return { ...comboState }
}
