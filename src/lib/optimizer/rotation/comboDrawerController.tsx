import { CharacterConditional, CharacterConditionalMap } from 'types/CharacterConditional'
import { ConditionalMap, ContentItem } from 'types/Conditionals'
import { Form, Teammate } from 'types/Form'
import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditional, LightConeConditionalMap } from 'types/LightConeConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { defaultSetConditionals } from 'lib/defaultForm'
import { SetsOrnaments, SetsRelics } from 'lib/constants'
import { SaveState } from 'lib/saveState'
import DB from 'lib/db'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { SelectionSets } from 'lib/optimizer/rotation/setConditionalContent'

export enum ConditionalType {
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  SELECT = 'select',
}

export type ComboConditionals = {
  [key: string]: ComboConditionalCategory
}

export type ComboConditionalCategory = ComboBooleanConditional | ComboNumberConditional | ComboSelectConditional

export type ComboBooleanConditional = {
  type: ConditionalType.BOOLEAN
  activations: boolean[]
  display?: boolean
}

export type ComboNumberConditional = {
  type: ConditionalType.NUMBER
  partitions: ComboSubNumberConditional[]
  display?: boolean
}

export type ComboSubNumberConditional = {
  value: number
  activations: boolean[]
}

export type ComboSelectConditional = {
  type: ConditionalType.SELECT
  partitions: ComboSubSelectConditional[]
  display?: boolean
}

export type ComboSubSelectConditional = {
  value: number
  activations: boolean[]
}

export type ComboCharacterMetadata = {
  characterId: string
  characterEidolon: number
  lightCone: string
  lightConeSuperimposition: number
}

export type ComboCharacter = {
  metadata: ComboCharacterMetadata
  characterConditionals: ComboConditionals
  lightConeConditionals: ComboConditionals
  setConditionals: ComboConditionals
  displayedRelicSets: string[]
  displayedOrnamentSets: string[]
}

export type ComboTeammate = {
  metadata: ComboCharacterMetadata
  characterConditionals: ComboConditionals
  lightConeConditionals: ComboConditionals
  relicSetConditionals: ComboConditionals
  ornamentSetConditionals: ComboConditionals
}

export type ComboState = {
  comboCharacter: ComboCharacter
  comboTeammate0: ComboTeammate | null
  comboTeammate1: ComboTeammate | null
  comboTeammate2: ComboTeammate | null
  comboAbilities: string[]
}

export type SetConditionals = typeof defaultSetConditionals

export function initializeComboState(request: Form, merge: boolean) {
  const comboState = {} as ComboState

  if (!request.characterId) return comboState

  const actionCount = 9
  // @ts-ignore
  comboState.comboAbilities = [null]
  for (let i = 1; i <= 9; i++) {
    const action = request.comboAbilities[i]
    if (action == null) break

    comboState.comboAbilities.push(action)
  }

  const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(request)
  const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(request)

  const requestCharacterConditionals = request.characterConditionals
  const requestLightConeConditionals = request.lightConeConditionals

  const requestSetConditionals = request.setConditionals

  comboState.comboCharacter = {
    metadata: {
      characterId: request.characterId,
      characterEidolon: request.characterEidolon,
      lightCone: request.lightCone,
      lightConeSuperimposition: request.lightConeSuperimposition,
    },
    characterConditionals: generateComboConditionals(
      requestCharacterConditionals,
      characterConditionalMetadata.content(),
      characterConditionalMetadata.defaults(),
      actionCount,
    ),
    lightConeConditionals: generateComboConditionals(
      requestLightConeConditionals,
      lightConeConditionalMetadata.content(),
      lightConeConditionalMetadata.defaults(),
      actionCount,
    ),
    setConditionals: generateSetComboConditionals(
      requestSetConditionals,
      actionCount,
    ),
    displayedRelicSets: [],
    displayedOrnamentSets: [],
  }

  comboState.comboTeammate0 = generateComboTeammate(request.teammate0, actionCount)
  comboState.comboTeammate1 = generateComboTeammate(request.teammate1, actionCount)
  comboState.comboTeammate2 = generateComboTeammate(request.teammate2, actionCount)

  if (request.comboStateJson && merge) {
    const savedComboState = JSON.parse(request.comboStateJson) as ComboState
    comboState.comboCharacter.displayedOrnamentSets = savedComboState?.comboCharacter?.displayedOrnamentSets ?? []
    comboState.comboCharacter.displayedRelicSets = savedComboState?.comboCharacter?.displayedRelicSets ?? []

    mergeComboStates(comboState, savedComboState)
  }

  return comboState
}

function mergeComboStates(base: ComboState, update: ComboState) {
  console.log('mergeComboStates')
  if (base.comboCharacter.metadata.characterId != update?.comboCharacter?.metadata?.characterId) return

  mergeConditionals(base.comboCharacter.characterConditionals, update?.comboCharacter?.characterConditionals)
  mergeConditionals(base.comboCharacter.lightConeConditionals, update?.comboCharacter?.lightConeConditionals)
  mergeConditionals(base.comboCharacter.setConditionals, update?.comboCharacter?.setConditionals)

  mergeTeammate(base.comboTeammate0, update?.comboTeammate0)
  mergeTeammate(base.comboTeammate1, update?.comboTeammate1)
  mergeTeammate(base.comboTeammate2, update?.comboTeammate2)
}

function mergeTeammate(baseTeammate: ComboTeammate | null, updateTeammate: ComboTeammate | null) {
  if (!baseTeammate || !updateTeammate) return
  mergeConditionals(baseTeammate.characterConditionals, updateTeammate.characterConditionals)
  mergeConditionals(baseTeammate.lightConeConditionals, updateTeammate.lightConeConditionals)
  mergeConditionals(baseTeammate.relicSetConditionals, updateTeammate.relicSetConditionals)
  mergeConditionals(baseTeammate.ornamentSetConditionals, updateTeammate.ornamentSetConditionals)
}

function mergeConditionals(baseConditionals: ComboConditionals, updateConditionals: ComboConditionals) {
  if (!updateConditionals) return

  for (const [key, conditional] of Object.entries(baseConditionals)) {
    const updateConditional = updateConditionals[key]
    if (updateConditional && conditional.type == updateConditional.type) {
      // The initial value must always match the form
      if (conditional.type == 'boolean') {
        const booleanBaseConditional = conditional
        const booleanUpdateConditional = updateConditional as ComboBooleanConditional
        booleanUpdateConditional.activations[0] = booleanBaseConditional.activations[0]
        baseConditionals[key] = updateConditional
      } else {
        const numberBaseConditional = conditional as ComboNumberConditional
        const numberUpdateConditional = updateConditional as ComboNumberConditional
        numberUpdateConditional.partitions[0].value = numberBaseConditional.partitions[0].value
        numberUpdateConditional.partitions[0].activations[0] = numberBaseConditional.partitions[0].activations[0]
        baseConditionals[key] = updateConditional
      }
    }
  }
}

function generateComboConditionals(
  conditionals: CharacterConditionalMap,
  contents: ContentItem[],
  defaults: ConditionalMap,
  actionCount: number,
) {
  const output: ComboConditionals = {}

  for (const content of contents) {
    if (content.disabled) continue

    if (content.formItem == 'switch') {
      const value: boolean = conditionals[content.id] != null ? conditionals[content.id] : defaults[content.id]
      const activations: boolean[] = Array(actionCount).fill(value)
      output[content.id] = {
        type: ConditionalType.BOOLEAN,
        activations: activations,
      }
    } else if (content.formItem == 'slider') {
      const value: number = conditionals[content.id] != null ? conditionals[content.id] : defaults[content.id]
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubNumberConditional = {
        value: value,
        activations: activations,
      }
      output[content.id] = {
        type: ConditionalType.NUMBER,
        partitions: [valuePartitions],
      }
    } else if (content.formItem == 'select') {
      const value: number = conditionals[content.id] != null ? conditionals[content.id] : defaults[content.id]
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubSelectConditional = {
        value: value,
        activations: activations,
      }
      output[content.id] = {
        type: ConditionalType.SELECT,
        partitions: [valuePartitions],
      }
    } else {
      // No other types for now
    }
  }

  return output
}

function generateSetComboConditionals(
  setConditionals: SetConditionals,
  actionCount: number,
) {
  const output: ComboConditionals = {}

  for (const [setName, setConditionalValue] of Object.entries(setConditionals)) {
    const p4Value = setConditionalValue[1]
    if (SelectionSets[setName]) {
      const value: number = p4Value as number
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubSelectConditional = {
        value: value,
        activations: activations,
      }
      output[setName] = {
        type: ConditionalType.SELECT,
        partitions: [valuePartitions],
      }
    } else {
      const activations: boolean[] = Array(actionCount).fill(p4Value)
      output[setName] = {
        type: ConditionalType.BOOLEAN,
        activations: activations,
      }
    }
  }

  return output
}

function emptyTeammate() {
  const comboTeammate: ComboTeammate = {
    metadata: {} as ComboCharacterMetadata,
    characterConditionals: {},
    lightConeConditionals: {},
    relicSetConditionals: {},
    ornamentSetConditionals: {},
  }

  return comboTeammate
}

function generateComboTeammate(teammate: Teammate, actionCount: number) {
  if (!teammate?.characterId) return null

  const characterConditionals = teammate.characterConditionals || {} as CharacterConditionalMap
  const lightConeConditionals = teammate.lightConeConditionals || {} as LightConeConditionalMap

  const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(teammate)
  const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(teammate)

  const relicSetConditionals: ComboConditionals = {}
  const ornamentSetConditionals: ComboConditionals = {}
  if (teammate.teamRelicSet) {
    relicSetConditionals[teammate.teamRelicSet] = {
      type: ConditionalType.BOOLEAN,
      activations: Array(actionCount).fill(true),
    }
  }
  if (teammate.teamOrnamentSet) {
    ornamentSetConditionals[teammate.teamOrnamentSet] = {
      type: ConditionalType.BOOLEAN,
      activations: Array(actionCount).fill(true),
    }
  }

  const comboTeammate: ComboTeammate = {
    metadata: {
      characterId: teammate.characterId,
      characterEidolon: teammate.characterEidolon,
      lightCone: teammate.lightCone,
      lightConeSuperimposition: teammate.lightConeSuperimposition,
    },
    characterConditionals: generateComboConditionals(
      characterConditionals,
      characterConditionalMetadata.teammateContent?.() ?? [],
      characterConditionalMetadata.teammateDefaults?.() ?? {},
      actionCount,
    ),
    lightConeConditionals: generateComboConditionals(
      lightConeConditionals,
      lightConeConditionalMetadata.teammateContent?.() ?? [],
      lightConeConditionalMetadata.teammateDefaults?.() ?? {},
      actionCount,
    ),
    relicSetConditionals: relicSetConditionals,
    ornamentSetConditionals: ornamentSetConditionals,
  }

  return comboTeammate
}

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
    const teammate: ComboTeammate = comboState[sourceKey.substring(0, 14)]
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

  if (comboCategory.type == ConditionalType.BOOLEAN) {
    const comboBooleanConditional = comboCategory
    const activations = comboBooleanConditional.activations
    return {
      comboConditional: comboBooleanConditional,
      activations: activations,
      index: dataKey.index,
      value: activations[dataKey.index],
    }
  } else if (comboCategory.type == ConditionalType.NUMBER) {
    const comboNumberConditional = comboCategory
    const activations = comboNumberConditional.partitions[dataKey.partitionIndex].activations
    return {
      comboConditional: comboNumberConditional,
      activations: activations,
      index: dataKey.index,
      value: activations[dataKey.index],
    }
  } else if (comboCategory.type == ConditionalType.SELECT) {
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

export function updateActivation(keyString: string, activate: boolean, comboState: ComboState) {
  const dataKey: ComboDataKey = JSON.parse(keyString)
  if (!dataKey.id) return
  if (dataKey.index == 0) return

  const locatedActivations = locateActivations(keyString, comboState)
  if (!locatedActivations) return

  if (locatedActivations.comboConditional.type == ConditionalType.NUMBER || locatedActivations.comboConditional.type == ConditionalType.SELECT) {
    // Numbers are activated onDrag
  } else {
    locatedActivations.activations[locatedActivations.index] = activate
  }
}

export function updatePartitionActivation(keyString: string, comboState: ComboState) {
  console.log('updatePartitionActivation')
  const dataKey: ComboDataKey = JSON.parse(keyString)
  if (!dataKey.id) return
  if (dataKey.index == 0) return

  const locatedActivations = locateActivations(keyString, comboState)
  if (!locatedActivations) return

  if (locatedActivations.comboConditional.type == ConditionalType.NUMBER || locatedActivations.comboConditional.type == ConditionalType.SELECT) {
    const numberConditional = locatedActivations.comboConditional as ComboNumberConditional
    const partitionIndex = dataKey.partitionIndex
    const activationIndex = dataKey.index
    for (let i = 0; i < numberConditional.partitions.length; i++) {
      const partition = numberConditional.partitions[i]

      partition.activations[activationIndex] = i == partitionIndex
    }

    window.store.getState().setComboState({ ...comboState })
  }
}

export type ComboDataKey = {
  id: string
  source: string
  partitionIndex: number
  index: number
}

export function updateAddPartition(sourceKey: string, contentItemId: string, partitionIndex: number) {
  console.log('updateAddPartition')
  const comboState = window.store.getState().comboState

  const comboCategory = locateComboCategory(sourceKey, contentItemId, comboState) as ComboNumberConditional
  if (!comboCategory) return null

  const selectedPartition = comboCategory.partitions[partitionIndex]

  comboCategory.partitions.push({
    value: selectedPartition.value,
    activations: Array(selectedPartition.activations.length).fill(false),
  })

  window.store.getState().setComboState({ ...comboState })
}

export function updateDeletePartition(sourceKey: string, contentItemId: string, partitionIndex: number) {
  console.log('updateDeletePartition')
  if (partitionIndex == 0) return

  const comboState = window.store.getState().comboState
  const comboCategory = locateComboCategory(sourceKey, contentItemId, comboState) as ComboNumberConditional
  if (!comboCategory) return null

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

  window.store.getState().setComboState({ ...comboState })
}

export function updateSelectedSets(sets: string[], isOrnaments: boolean) {
  console.log('updateSelectedSets')
  const comboState = window.store.getState().comboState
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
  window.store.getState().setComboState({ ...comboState })
}

export function updateBooleanDefaultSelection(sourceKey: string, contentItemId: string, value: boolean) {
  console.log('updateBooleanDefaultSelection')
  const comboState = window.store.getState().comboState
  const dataKey: ComboDataKey = {
    id: contentItemId,
    source: sourceKey,
    index: 0,
    partitionIndex: 0,
  }

  const locatedActivations = locateActivationsDataKey(dataKey, comboState)
  if (!locatedActivations) return

  if (locatedActivations.comboConditional.type == ConditionalType.NUMBER || locatedActivations.comboConditional.type == ConditionalType.SELECT) {
    // Default number is always active
  } else {
    for (let i = 0; i < locatedActivations.activations.length; i++) {
      locatedActivations.activations[i] = value
    }

    window.store.getState().setComboState({ ...comboState })
  }
}

export function updateNumberDefaultSelection(sourceKey: string, contentItemId: string, partitionIndex: number, value: number) {
  console.log('updateNumberDefaultSelection')
  const comboState = window.store.getState().comboState
  const dataKey: ComboDataKey = {
    id: contentItemId,
    source: sourceKey,
    index: 0,
    partitionIndex: partitionIndex,
  }

  const locatedActivations = locateActivationsDataKey(dataKey, comboState)
  if (!locatedActivations) return

  if (locatedActivations.comboConditional.type == ConditionalType.NUMBER || locatedActivations.comboConditional.type == ConditionalType.SELECT) {
    // Default number is always active
    const comboNumberConditional = locatedActivations.comboConditional as ComboNumberConditional
    comboNumberConditional.partitions[partitionIndex].value = value

    window.store.getState().setComboState({ ...comboState })
  } else {
    //
  }
}

function shiftLeft(arr: boolean[], index: number) {
  arr.splice(index, 1)
  arr.push(arr[0])
}

function shiftAllActivations(obj: any, index: number): void {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue

    if (key === 'activations' && Array.isArray(obj[key])) {
      shiftLeft(obj[key], index)
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      shiftAllActivations(obj[key], index)
    }
  }
}

function setActivationIndexToDefault(obj: any, index: number): void {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue

    if (key === 'activations' && Array.isArray(obj[key])) {
      obj[key][index] = obj[key][0]
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      setActivationIndexToDefault(obj[key], index)
    }
  }
}

// Index is 0 indexed, and only includes the interactable elements, not including the [0] default
export function updateAbilityRotation(index: number, value: string) {
  console.log('updateAbilityRotation')
  const comboState = window.store.getState().comboState
  const comboAbilities = comboState.comboAbilities

  if (index > comboAbilities.length) return
  if (value == null) {
    if (comboAbilities.length <= 2) return
    comboAbilities.splice(index, 1)
    shiftAllActivations(comboState, index)
  } else {
    comboAbilities[index] = value
    setActivationIndexToDefault(comboState, index)
  }

  window.store.getState().setComboState({ ...comboState })
}

export function updateFormState(comboState: ComboState) {
  console.log('updateFormState')
  window.optimizerForm.setFieldValue('comboStateJson', JSON.stringify(comboState))
  window.optimizerForm.setFieldValue('comboAbilities', comboState.comboAbilities)

  const form = OptimizerTabController.getForm()
  DB.replaceCharacterForm(form)

  SaveState.delayedSave(1000)
}

type ChangeEvent = {
  characterConditionals: { [key: string]: any }
  lightConeConditionals: { [key: string]: any }
  setConditionals: { [key: string]: any }
  teammate0: { [key: string]: any }
  teammate1: { [key: string]: any }
  teammate2: { [key: string]: any }
}

function change(changeConditional: { [key: string]: any }, originalConditional: ComboConditionals, set: boolean = false) {
  for (const [key, value] of Object.entries(changeConditional)) {
    const comboCategory = originalConditional[key]
    if (comboCategory.type == 'boolean') {
      for (let i = 0; i <= 8; i++) {
        if (set) {
          // Set conditionals use legacy [undefined, value] format
          comboCategory.activations[i] = value[1]
        } else {
          comboCategory.activations[i] = value
        }
      }
    }
  }
}

export function updateConditionalChange(changeEvent: ChangeEvent) {
  console.log('updateConditionalChange', changeEvent)

  const comboState = window.store.getState().comboState

  if (changeEvent.characterConditionals) change(changeEvent.characterConditionals, comboState.comboCharacter.characterConditionals)
  if (changeEvent.lightConeConditionals) change(changeEvent.lightConeConditionals, comboState.comboCharacter.lightConeConditionals)
  if (changeEvent.setConditionals) change(changeEvent.setConditionals, comboState.comboCharacter.setConditionals, true)

  if (changeEvent.teammate0?.characterConditionals) change(changeEvent.teammate0.characterConditionals, comboState.comboTeammate0?.characterConditionals || {})
  if (changeEvent.teammate0?.lightConeConditionals) change(changeEvent.teammate0.lightConeConditionals, comboState.comboTeammate0?.lightConeConditionals || {})

  if (changeEvent.teammate1?.characterConditionals) change(changeEvent.teammate1.characterConditionals, comboState.comboTeammate1?.characterConditionals || {})
  if (changeEvent.teammate1?.lightConeConditionals) change(changeEvent.teammate1.lightConeConditionals, comboState.comboTeammate1?.lightConeConditionals || {})

  if (changeEvent.teammate2?.characterConditionals) change(changeEvent.teammate2.characterConditionals, comboState.comboTeammate2?.characterConditionals || {})
  if (changeEvent.teammate2?.lightConeConditionals) change(changeEvent.teammate2.lightConeConditionals, comboState.comboTeammate2?.lightConeConditionals || {})

  window.store.getState().setComboState({ ...comboState })
  updateFormState(comboState)
}
