import { CharacterConditional, CharacterConditionalMap } from 'types/CharacterConditional'
import { ConditionalMap, ContentItem } from 'types/Conditionals'
import { Form, Teammate } from 'types/Form'
import { CharacterConditionals } from 'lib/characterConditionals'
import { ConditionalLightConeMap, LightConeConditional } from 'types/LightConeConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { defaultSetConditionals } from 'lib/defaultForm'
import { SetsOrnaments, SetsRelics } from 'lib/constants'
import { SaveState } from 'lib/saveState'

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
  comboTeammate0: ComboTeammate
  comboTeammate1: ComboTeammate
  comboTeammate2: ComboTeammate
  comboDefinition: string[]
}

export type SetConditionals = typeof defaultSetConditionals

export function initializeComboState(request: Form) {
  const comboState = {} as ComboState

  if (!request.characterId) return comboState

  const actionCount = 11
  comboState.comboDefinition = request['comboDefinition']?.filter(x => !!x) ?? ['DEFAULT', 'SKILL', 'SKILL', 'ULT', 'SKILL', 'SKILL']

  const requestCharacterConditionals = request.characterConditionals
  const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(request)

  const requestLightConeConditionals = request.lightConeConditionals
  const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(request)

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
    displayedOrnamentSets: []
  }

  comboState.comboTeammate0 = generateComboTeammate(request.teammate0, actionCount)
  comboState.comboTeammate1 = generateComboTeammate(request.teammate1, actionCount)
  comboState.comboTeammate2 = generateComboTeammate(request.teammate2, actionCount)

  if (request.json)

    console.debug('aa', comboState)

  return comboState
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
      const value: boolean = conditionals[content.id] ? conditionals[content.id] : defaults[content.id]
      const activations: boolean[] = Array(actionCount).fill(value)
      output[content.id] = {
        type: ConditionalType.BOOLEAN,
        activations: activations,
      }
    } else if (content.formItem == 'slider') {
      const value: number = conditionals[content.id] ? conditionals[content.id] : defaults[content.id]
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
      const value: number = conditionals[content.id] ? conditionals[content.id] : defaults[content.id]
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
    if (typeof p4Value === 'boolean') {
      const activations: boolean[] = Array(actionCount).fill(p4Value)
      output[setName] = {
        type: ConditionalType.BOOLEAN,
        activations: activations,
      }
    } else if (typeof p4Value === 'number') {
      const value: number = p4Value
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
      // No other types for now
    }
  }

  return output
}

function generateComboTeammate(teammate: Teammate, actionCount: number) {
  const characterConditionals = teammate.characterConditionals || {} as CharacterConditionalMap
  const lightConeConditionals = teammate.lightConeConditionals || {} as ConditionalLightConeMap

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

  let comboCategory = locateComboCategory(dataKey.source, dataKey.id, comboState)
  if (!comboCategory) return null

  if (comboCategory.type == ConditionalType.BOOLEAN) {
    const comboBooleanConditional = comboCategory as ComboBooleanConditional
    const activations = comboBooleanConditional.activations
    return {
      comboConditional: comboBooleanConditional,
      activations: activations,
      index: dataKey.index,
      value: activations[dataKey.index]
    }
  } else if (comboCategory.type == ConditionalType.NUMBER) {
    const comboNumberConditional = comboCategory as ComboNumberConditional
    const activations = comboNumberConditional.partitions[dataKey.partitionIndex].activations
    return {
      comboConditional: comboNumberConditional,
      activations: activations,
      index: dataKey.index,
      value: activations[dataKey.index]
    }
  } else if (comboCategory.type == ConditionalType.SELECT) {
    const comboSelectConditional = comboCategory as ComboSelectConditional
    const activations = comboSelectConditional.partitions[dataKey.partitionIndex].activations
    return {
      comboConditional: comboSelectConditional,
      activations: activations,
      index: dataKey.index,
      value: activations[dataKey.index]
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

      partition.activations[activationIndex] = i == partitionIndex;
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
  const comboState = window.store.getState().comboState

  const comboCategory = locateComboCategory(sourceKey, contentItemId, comboState) as ComboNumberConditional
  if (!comboCategory) return null

  const selectedPartition = comboCategory.partitions[partitionIndex]

  comboCategory.partitions.push({
    value: selectedPartition.value,
    activations: Array(selectedPartition.activations.length).fill(false)
  })

  window.store.getState().setComboState({ ...comboState })
}

export function updateDeletePartition(sourceKey: string, contentItemId: string, partitionIndex: number) {
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

  window.store.getState().setComboState({ ...comboState })
}

export function updateBooleanDefaultSelection(sourceKey: string, contentItemId: string, value: boolean) {
  const comboState = window.store.getState().comboState
  const dataKey: ComboDataKey = {
    id: contentItemId,
    source: sourceKey,
    index: 0,
    partitionIndex: 0
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

function shiftLeft(arr: boolean[], index: number) {
  arr.splice(index, 1)
  arr.push(arr[0])
}

function shiftAllActivations(obj: any, index: number): void {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    if (key === 'activations' && Array.isArray(obj[key])) {
      shiftLeft(obj[key], index);
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      shiftAllActivations(obj[key], index);
    }
  }
}

// Index is 0 indexed, and only includes the interactable elements, not including the [0] default
export function updateAbilityRotation(index: number, value: string) {
  const comboState = window.store.getState().comboState
  const comboDefinition = comboState.comboDefinition

  if (index > comboDefinition.length) return
  if (value == 'NONE') {
    if (comboDefinition.length <= 2) return
    comboDefinition.splice(index, 1)
    shiftAllActivations(comboState, index)
    console.log('aaa', comboState)
  } else {
    comboDefinition[index] = value
  }

  window.store.getState().setComboState({ ...comboState })
}

export function updateFormState(comboState: ComboState) {
  window.optimizerForm.setFieldValue('comboStateJson', JSON.stringify(comboState));

  console.debug('updated', window.optimizerForm.getFieldsValue())

  SaveState.delayedSave(1000)
}