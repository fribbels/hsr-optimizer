import { applyPreset } from 'lib/conditionals/evaluation/applyPresets'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ABILITY_LIMIT,
  ConditionalDataType,
  ElementName,
  PathName,
  SetsOrnaments,
  SetsOrnamentsNames,
  SetsRelics,
  SetsRelicsNames,
} from 'lib/constants/constants'
import {
  defaultSetConditionals,
  getDefaultForm,
} from 'lib/optimization/defaultForm'
import { getComboTypeAbilities } from 'lib/optimization/rotation/comboStateTransform'
import { precomputeConditionalActivations } from 'lib/optimization/rotation/preprocessor/rotationPreprocessor'
import { ConditionalSetMetadata } from 'lib/optimization/rotation/setConditionalContent'
import {
  NULL_TURN_ABILITY_NAME,
  TurnAbilityName,
} from 'lib/optimization/rotation/turnAbilityConfig'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { arrayIncludes } from 'lib/utils/arrayUtils'
import {
  CharacterConditionalsController,
  ConditionalValueMap,
  ContentItem,
  LightConeConditionalsController,
} from 'types/conditionals'
import {
  Form,
  Teammate,
} from 'types/form'
import { DBMetadata } from 'types/metadata'
import { BasicForm } from 'types/optimizer'

export type ComboConditionals = {
  [key: string]: ComboConditionalCategory,
}

export type ComboConditionalCategory = ComboBooleanConditional | ComboNumberConditional | ComboSelectConditional

export type ComboBooleanConditional = {
  type: ConditionalDataType.BOOLEAN,
  activations: boolean[],
  display?: boolean,
}

export type ComboNumberConditional = {
  type: ConditionalDataType.NUMBER,
  partitions: ComboSubNumberConditional[],
  display?: boolean,
}

export type ComboSubNumberConditional = {
  value: number,
  activations: boolean[],
}

export type ComboSelectConditional = {
  type: ConditionalDataType.SELECT,
  partitions: ComboSubSelectConditional[],
  display?: boolean,
}

export type ComboSubSelectConditional = {
  value: number,
  activations: boolean[],
}

export type ComboCharacterMetadata = {
  characterId: string,
  characterEidolon: number,
  path: PathName,
  lightCone: string,
  lightConeSuperimposition: number,
  lightConePath: PathName,
  element: ElementName,
}

export type ComboCharacter = {
  metadata: ComboCharacterMetadata,
  characterConditionals: ComboConditionals,
  lightConeConditionals: ComboConditionals,
  setConditionals: ComboConditionals,
  displayedRelicSets: string[],
  displayedOrnamentSets: string[],
}

export type ComboTeammate = {
  metadata: ComboCharacterMetadata,
  characterConditionals: ComboConditionals,
  lightConeConditionals: ComboConditionals,
  relicSetConditionals: ComboConditionals,
  ornamentSetConditionals: ComboConditionals,
}

export type ComboState = {
  comboCharacter: ComboCharacter,
  comboTeammate0: ComboTeammate | null,
  comboTeammate1: ComboTeammate | null,
  comboTeammate2: ComboTeammate | null,
  comboTurnAbilities: TurnAbilityName[],
  version?: string,
}

export const COMBO_STATE_JSON_VERSION = '1.1'

export type SetConditionals = typeof defaultSetConditionals

export function initializeComboState(request: Form, merge: boolean) {
  const dbMetadata = DB.getMetadata()
  const comboState = {} as ComboState

  if (!request.characterId) return comboState

  const actionCount = ABILITY_LIMIT + 1
  const { comboTurnAbilities } = getComboTypeAbilities(request)

  comboState.comboTurnAbilities = comboTurnAbilities

  const metadata = generateConditionalResolverMetadata(request, dbMetadata)

  const characterConditionalMetadata: CharacterConditionalsController = CharacterConditionalsResolver.get(metadata)
  const lightConeConditionalMetadata: LightConeConditionalsController = LightConeConditionalsResolver.get(metadata)

  const requestCharacterConditionals = request.characterConditionals
  const requestLightConeConditionals = request.lightConeConditionals

  const requestSetConditionals = request.setConditionals

  comboState.comboCharacter = {
    metadata,
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

  comboState.comboTeammate0 = generateComboTeammate(request.teammate0, actionCount, dbMetadata)
  comboState.comboTeammate1 = generateComboTeammate(request.teammate1, actionCount, dbMetadata)
  comboState.comboTeammate2 = generateComboTeammate(request.teammate2, actionCount, dbMetadata)

  if (request.comboStateJson && merge) {
    const savedComboState = JSON.parse(request.comboStateJson) as ComboState
    comboState.comboCharacter.displayedOrnamentSets = savedComboState?.comboCharacter?.displayedOrnamentSets ?? []
    comboState.comboCharacter.displayedRelicSets = savedComboState?.comboCharacter?.displayedRelicSets ?? []

    if (savedComboState.version == COMBO_STATE_JSON_VERSION) {
      mergeComboStates(comboState, savedComboState)
    }
  }

  if (request.comboPreprocessor) {
    precomputeConditionalActivations(comboState, request)
  }

  shiftDefaultConditionalToFirst(comboState.comboCharacter.characterConditionals)
  shiftDefaultConditionalToFirst(comboState.comboCharacter.lightConeConditionals)
  shiftDefaultConditionalToFirst(comboState.comboCharacter.setConditionals)
  // Commenting teammates out since there are no teammate precomputes so far
  // shiftDefaultConditionalToFirst(comboState.comboTeammate0?.characterConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate0?.lightConeConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate0?.ornamentSetConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate0?.relicSetConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate1?.characterConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate1?.lightConeConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate1?.ornamentSetConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate1?.relicSetConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate2?.characterConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate2?.lightConeConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate2?.ornamentSetConditionals)
  // shiftDefaultConditionalToFirst(comboState.comboTeammate2?.relicSetConditionals)

  displayModifiedSets(request, comboState)

  return comboState
}

// After precompute runs, there may be out of order conditionals and the default state should come first
function shiftDefaultConditionalToFirst(comboConditionals?: ComboConditionals) {
  if (!comboConditionals) return

  for (const [, conditionals] of Object.entries(comboConditionals)) {
    if (conditionals.type == ConditionalDataType.NUMBER) {
      const numberCategory = conditionals
      for (let i = 0; i < numberCategory.partitions.length; i++) {
        const partition = numberCategory.partitions[i]
        if (partition.activations[0]) {
          numberCategory.partitions.splice(i, 1)
          numberCategory.partitions.unshift(partition)
          break
        }
      }
    }
  }
}

export function generateConditionalResolverMetadata(request: BasicForm, dbMetadata: DBMetadata) {
  return {
    characterId: request.characterId,
    characterEidolon: request.characterEidolon,
    path: dbMetadata.characters[request.characterId]?.path,
    lightCone: request.lightCone,
    lightConeSuperimposition: request.lightConeSuperimposition,
    lightConePath: dbMetadata.lightCones[request.lightCone]?.path,
    element: dbMetadata.characters[request.characterId]?.element,
  }
}

function displayModifiedSets(request: Form, comboState: ComboState) {
  const defaultForm = getDefaultForm({ id: request.characterId })
  const presets = DB.getMetadata().characters[request.characterId].scoringMetadata.presets || []
  for (const preset of presets) {
    applyPreset(defaultForm, preset)
  }

  // comboState.comboCharacter.setConditionals

  const modified: string[] = []

  for (const [key, value] of Object.entries(defaultForm.setConditionals)) {
    // @ts-ignore
    const defaultValue = value[1]
    const comboSet = comboState.comboCharacter.setConditionals[key]
    if (!comboSet) {
      modified.push(key)
    } else if (comboSet.type == ConditionalDataType.BOOLEAN) {
      for (let i = 0; i < comboState.comboTurnAbilities.length; i++) {
        const activation = comboSet.activations[i]
        if (activation == null) break
        if (activation != defaultValue) {
          modified.push(key)
          break
        }
      }
    } else if (comboSet.type == ConditionalDataType.SELECT) {
      for (const partition of comboSet.partitions) {
        if (partition.value != defaultValue) {
          modified.push(key)
          break
        }
      }
    }
  }

  const modifiedRelics = modified.filter((set) => arrayIncludes(SetsRelicsNames, set))
  const modifiedOrnaments = modified.filter((set) => arrayIncludes(SetsOrnamentsNames, set))

  comboState.comboCharacter.displayedRelicSets = Array.from(new Set([...modifiedRelics, ...comboState.comboCharacter.displayedRelicSets]))
  comboState.comboCharacter.displayedOrnamentSets = Array.from(new Set([...modifiedOrnaments, ...comboState.comboCharacter.displayedOrnamentSets]))
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
      if (conditional.type == ConditionalDataType.BOOLEAN) {
        const booleanBaseConditional = conditional
        const booleanUpdateConditional = updateConditional as ComboBooleanConditional
        booleanUpdateConditional.activations[0] = booleanBaseConditional.activations[0]

        for (let i = 0; i <= ABILITY_LIMIT; i++) {
          booleanUpdateConditional.activations[i] = booleanUpdateConditional.activations[i] ?? false
        }
        baseConditionals[key] = booleanUpdateConditional
      } else {
        const numberBaseConditional = conditional as ComboNumberConditional
        const numberUpdateConditional = updateConditional as ComboNumberConditional
        const newPartitions = []

        const seen: Record<number, ComboSubNumberConditional> = {}
        const activeUpdateValue = numberUpdateConditional.partitions.find((p) => p.activations[0])?.value ?? null
        const activeBaseValue = numberBaseConditional.partitions.find((p) => p.activations[0])?.value ?? null

        // Insert new conditionals
        for (let i = 0; i < numberUpdateConditional.partitions.length; i++) {
          const partition = numberUpdateConditional.partitions[i]
          for (let j = partition.activations.length; j <= ABILITY_LIMIT; j++) {
            partition.activations[j] = false
          }
          if (seen[partition.value]) {
            for (let j = 0; j < ABILITY_LIMIT; j++) {
              seen[partition.value].activations[j] = seen[partition.value].activations[j] || numberUpdateConditional.partitions[i].activations[j]
            }
          } else {
            // Skip merging empty partitions
            if (!partition.activations.some((activation) => activation)) continue

            seen[partition.value] = partition
            newPartitions.push(partition)
          }
        }

        // Insert base conditionals
        for (let i = 0; i < numberBaseConditional.partitions.length; i++) {
          const partition = numberBaseConditional.partitions[i]
          for (let j = partition.activations.length; j <= ABILITY_LIMIT; j++) {
            partition.activations[j] = false
          }
          if (seen[partition.value]) {
            seen[partition.value].activations[0] = numberBaseConditional.partitions[i].activations[0]
          } else {
            seen[partition.value] = partition
            newPartitions.push(partition)
          }
          for (let j = 1; j < ABILITY_LIMIT; j++) {
            partition.activations[j] = false
          }
        }

        const newUpdateIndex = newPartitions.findIndex((p) => p.value == activeUpdateValue)
        const newBaseIndex = newPartitions.findIndex((p) => p.value == activeBaseValue)

        // Inherit the previous active conditional's activations
        if (newUpdateIndex != newBaseIndex && newUpdateIndex >= 0 && newBaseIndex >= 0) {
          for (let i = 0; i < ABILITY_LIMIT; i++) {
            newPartitions[newBaseIndex].activations[i] = newPartitions[newUpdateIndex].activations[i] || newPartitions[newBaseIndex].activations[i]
          }
          for (let i = 0; i < ABILITY_LIMIT; i++) {
            newPartitions[newUpdateIndex].activations[i] = false
          }
        }

        // The only 0 index activation should be the base conditional
        for (let i = 0; i < newPartitions.length; i++) {
          if (newPartitions[i].value == numberBaseConditional.partitions[0].value) {
            newPartitions[i].activations[0] = true
          } else {
            newPartitions[i].activations[0] = false
          }
        }

        // Move the base conditional to the front
        for (let i = 0; i < newPartitions.length; i++) {
          if (newPartitions[i].value == numberBaseConditional.partitions[0].value) {
            const partition = newPartitions.splice(i, 1)[0]
            newPartitions.unshift(partition)
            break
          }
        }

        numberUpdateConditional.partitions = newPartitions
        baseConditionals[key] = updateConditional
      }
    }
  }
}

function generateComboConditionals(
  conditionals: ConditionalValueMap,
  contents: ContentItem[],
  defaults: ConditionalValueMap,
  actionCount: number,
) {
  const output: ComboConditionals = {}

  for (const content of contents) {
    // Some preprocessors still need the variable to be passed through even if its disabled
    // if (content.disabled) continue

    if (content.formItem == 'switch') {
      const value = conditionals[content.id] ?? defaults[content.id]
      const activations: boolean[] = Array(actionCount).fill(value)
      output[content.id] = {
        type: ConditionalDataType.BOOLEAN,
        activations: activations,
      }
    } else if (content.formItem == 'slider') {
      const value = (conditionals[content.id] ?? defaults[content.id]) as number
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubNumberConditional = {
        value: value,
        activations: activations,
      }
      output[content.id] = {
        type: ConditionalDataType.NUMBER,
        partitions: [valuePartitions],
      }
    } else if (content.formItem == 'select') {
      const value = (conditionals[content.id] ?? defaults[content.id]) as number
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubSelectConditional = {
        value: value,
        activations: activations,
      }
      output[content.id] = {
        type: ConditionalDataType.SELECT,
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
    if (ConditionalSetMetadata[setName].type == ConditionalDataType.SELECT) {
      const value: number = p4Value as number
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubSelectConditional = {
        value: value,
        activations: activations,
      }
      output[setName] = {
        type: ConditionalDataType.SELECT,
        partitions: [valuePartitions],
      }
    } else {
      const activations: boolean[] = Array(actionCount).fill(p4Value)
      output[setName] = {
        type: ConditionalDataType.BOOLEAN,
        activations: activations,
      }
    }
  }

  return output
}

function generateComboTeammate(teammate: Teammate, actionCount: number, dbMetadata: DBMetadata) {
  if (!teammate?.characterId) return null

  const characterConditionals = teammate.characterConditionals || {}
  const lightConeConditionals = teammate.lightConeConditionals || {}

  const metadata = generateConditionalResolverMetadata(teammate, dbMetadata)

  const characterConditionalMetadata: CharacterConditionalsController = CharacterConditionalsResolver.get(metadata)
  const lightConeConditionalMetadata: LightConeConditionalsController = LightConeConditionalsResolver.get(metadata)

  const relicSetConditionals: ComboConditionals = {}
  const ornamentSetConditionals: ComboConditionals = {}
  if (teammate.teamRelicSet) {
    relicSetConditionals[teammate.teamRelicSet] = {
      type: ConditionalDataType.BOOLEAN,
      activations: Array(actionCount).fill(true),
    }
  }
  if (teammate.teamOrnamentSet) {
    ornamentSetConditionals[teammate.teamOrnamentSet] = {
      type: ConditionalDataType.BOOLEAN,
      activations: Array(actionCount).fill(true),
    }
  }

  const comboTeammate: ComboTeammate = {
    metadata,
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
    const teammateIndexString = sourceKey.substring(0, 14) as 'comboTeammate0' | 'comboTeammate1' | 'comboTeammate2'
    const teammate: ComboTeammate = comboState[teammateIndexString]!
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
  console.log('updatePartitionActivation')
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

    window.store.getState().setComboState({ ...comboState })
  }
}

export type ComboDataKey = {
  id: string,
  source: string,
  partitionIndex: number,
  index: number,
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

  if (locatedActivations.comboConditional.type == ConditionalDataType.NUMBER || locatedActivations.comboConditional.type == ConditionalDataType.SELECT) {
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

  if (locatedActivations.comboConditional.type == ConditionalDataType.NUMBER || locatedActivations.comboConditional.type == ConditionalDataType.SELECT) {
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

type NestedObject = {
  [key: string]: unknown,
}

function shiftAllActivations(obj: NestedObject, index: number): void {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

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
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    if (key === 'activations' && Array.isArray(obj[key])) {
      obj[key][index] = (obj[key] as boolean[])[0]
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      setActivationIndexToDefault(obj[key] as NestedObject, index)
    }
  }
}

// Index is 0 indexed, and only includes the interactable elements, not including the [0] default
export function updateAbilityRotation(index: number, turnAbilityName: TurnAbilityName) {
  console.log('updateAbilityRotation')
  const comboState = window.store.getState().comboState
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

  window.store.getState().setComboState({ ...comboState })
}

export function updateFormState(comboState: ComboState) {
  console.log('updateFormState')
  comboState.version = COMBO_STATE_JSON_VERSION
  window.optimizerForm.setFieldValue('comboStateJson', JSON.stringify(comboState))
  window.optimizerForm.setFieldValue('comboTurnAbilities', comboState.comboTurnAbilities)

  const form = OptimizerTabController.getForm()
  DB.replaceCharacterForm(form)

  SaveState.delayedSave(1000)
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

export function updateConditionalChange(changeEvent: Form) {
  console.log('updateConditionalChange', changeEvent)

  const comboState = window.store.getState().comboState

  if (changeEvent.characterConditionals) change(changeEvent.characterConditionals, comboState.comboCharacter.characterConditionals)
  if (changeEvent.lightConeConditionals) change(changeEvent.lightConeConditionals, comboState.comboCharacter.lightConeConditionals)
  if (changeEvent.setConditionals) change(changeEvent.setConditionals, comboState.comboCharacter.setConditionals, true)

  if (changeEvent.teammate0?.characterConditionals) change(changeEvent.teammate0.characterConditionals, comboState.comboTeammate0?.characterConditionals ?? {})
  if (changeEvent.teammate0?.lightConeConditionals) change(changeEvent.teammate0.lightConeConditionals, comboState.comboTeammate0?.lightConeConditionals ?? {})

  if (changeEvent.teammate1?.characterConditionals) change(changeEvent.teammate1.characterConditionals, comboState.comboTeammate1?.characterConditionals ?? {})
  if (changeEvent.teammate1?.lightConeConditionals) change(changeEvent.teammate1.lightConeConditionals, comboState.comboTeammate1?.lightConeConditionals ?? {})

  if (changeEvent.teammate2?.characterConditionals) change(changeEvent.teammate2.characterConditionals, comboState.comboTeammate2?.characterConditionals ?? {})
  if (changeEvent.teammate2?.lightConeConditionals) change(changeEvent.teammate2.lightConeConditionals, comboState.comboTeammate2?.lightConeConditionals ?? {})

  window.store.getState().setComboState({ ...comboState })
  updateFormState(comboState)
}
