import { applyPreset } from 'lib/conditionals/evaluation/applyPresets'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ABILITY_LIMIT,
  ConditionalDataType,
} from 'lib/constants/constants'
import {
  SetsOrnamentsNames,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { getComboTypeAbilities } from 'lib/optimization/rotation/comboStateTransform'
import { precomputeConditionalActivations } from 'lib/optimization/rotation/preprocessor/rotationPreprocessor'
import { ConditionalSetMetadata } from 'lib/optimization/rotation/setConditionalContent'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { arrayIncludes } from 'lib/utils/arrayUtils'
import type {
  CharacterConditionalsController,
  ConditionalValueMap,
  ContentItem,
  LightConeConditionalsController,
} from 'types/conditionals'
import type { Form, Teammate } from 'types/form'
import type { DBMetadata } from 'types/metadata'
import type { BasicForm } from 'types/optimizer'

import type {
  ComboBooleanConditional,
  ComboCharacterMetadata,
  ComboConditionals,
  ComboNumberConditional,
  ComboState,
  ComboSubNumberConditional,
  ComboSubSelectConditional,
  ComboTeammate,
  SetConditionals,
} from 'lib/optimization/combo/comboTypes'
import { COMBO_STATE_JSON_VERSION } from 'lib/optimization/combo/comboTypes'

export function initializeComboState(request: Form, merge: boolean) {
  const dbMetadata = getGameMetadata()
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
    try {
      const savedComboState = JSON.parse(request.comboStateJson) as ComboState
      comboState.comboCharacter.displayedOrnamentSets = savedComboState?.comboCharacter?.displayedOrnamentSets ?? []
      comboState.comboCharacter.displayedRelicSets = savedComboState?.comboCharacter?.displayedRelicSets ?? []

      if (savedComboState.version === COMBO_STATE_JSON_VERSION) {
        mergeComboStates(comboState, savedComboState)
      }
    } catch {
      console.warn('comboStateJson parse failed — proceeding with fresh state')
    }
  }

  if (request.comboPreprocessor) {
    precomputeConditionalActivations(comboState, request)
  }

  shiftDefaultConditionalToFirst(comboState.comboCharacter.characterConditionals)
  shiftDefaultConditionalToFirst(comboState.comboCharacter.lightConeConditionals)
  shiftDefaultConditionalToFirst(comboState.comboCharacter.setConditionals)
  displayModifiedSets(request, comboState)

  return comboState
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

// After precompute runs, there may be out of order conditionals and the default state should come first
function shiftDefaultConditionalToFirst(comboConditionals?: ComboConditionals) {
  if (!comboConditionals) return

  for (const [, conditionals] of Object.entries(comboConditionals)) {
    if (conditionals.type === ConditionalDataType.NUMBER || conditionals.type === ConditionalDataType.SELECT) {
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

function displayModifiedSets(request: Form, comboState: ComboState) {
  const defaultForm = getDefaultForm({ id: request.characterId })
  const presets = getGameMetadata().characters[request.characterId].scoringMetadata.presets || []
  for (const preset of presets) {
    applyPreset(defaultForm, preset)
  }

  const modified: string[] = []

  for (const [key, value] of Object.entries(defaultForm.setConditionals)) {
    const defaultValue = value[1]
    const comboSet = comboState.comboCharacter.setConditionals[key]
    if (!comboSet) {
      modified.push(key)
    } else if (comboSet.type === ConditionalDataType.BOOLEAN) {
      for (let i = 0; i < comboState.comboTurnAbilities.length; i++) {
        const activation = comboSet.activations[i]
        if (activation == null) break
        if (activation !== defaultValue) {
          modified.push(key)
          break
        }
      }
    } else if (comboSet.type === ConditionalDataType.SELECT) {
      if (comboSet.partitions[0]?.value !== defaultValue) {
        modified.push(key)
      }
    }
  }

  const modifiedRelics = modified.filter((set) => arrayIncludes(SetsRelicsNames, set))
  const modifiedOrnaments = modified.filter((set) => arrayIncludes(SetsOrnamentsNames, set))

  comboState.comboCharacter.displayedRelicSets = Array.from(new Set([...modifiedRelics, ...comboState.comboCharacter.displayedRelicSets]))
  comboState.comboCharacter.displayedOrnamentSets = Array.from(new Set([...modifiedOrnaments, ...comboState.comboCharacter.displayedOrnamentSets]))
}

function mergeComboStates(base: ComboState, update: ComboState) {
  if (base.comboCharacter.metadata.characterId !== update?.comboCharacter?.metadata?.characterId) return

  mergeConditionals(base.comboCharacter.characterConditionals, update?.comboCharacter?.characterConditionals)
  mergeConditionals(base.comboCharacter.lightConeConditionals, update?.comboCharacter?.lightConeConditionals)
  mergeConditionals(base.comboCharacter.setConditionals, update?.comboCharacter?.setConditionals)

  mergeTeammate(base.comboTeammate0, update?.comboTeammate0)
  mergeTeammate(base.comboTeammate1, update?.comboTeammate1)
  mergeTeammate(base.comboTeammate2, update?.comboTeammate2)
}

function mergeTeammate(baseTeammate: ComboTeammate | null, updateTeammate: ComboTeammate | null) {
  if (!baseTeammate || !updateTeammate) return
  if (baseTeammate.metadata.characterId !== updateTeammate.metadata.characterId) return
  mergeConditionals(baseTeammate.characterConditionals, updateTeammate.characterConditionals)
  mergeConditionals(baseTeammate.lightConeConditionals, updateTeammate.lightConeConditionals)
  mergeConditionals(baseTeammate.relicSetConditionals, updateTeammate.relicSetConditionals)
  mergeConditionals(baseTeammate.ornamentSetConditionals, updateTeammate.ornamentSetConditionals)
}

function mergeConditionals(baseConditionals: ComboConditionals, updateConditionals: ComboConditionals) {
  if (!updateConditionals) return

  for (const [key, conditional] of Object.entries(baseConditionals)) {
    const updateConditional = updateConditionals[key]
    if (updateConditional && conditional.type === updateConditional.type) {
      // The initial value must always match the form
      if (conditional.type === ConditionalDataType.BOOLEAN) {
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
            for (let j = 0; j <= ABILITY_LIMIT; j++) {
              seen[partition.value].activations[j] = seen[partition.value].activations[j] || numberUpdateConditional.partitions[i].activations[j]
            }
          } else {
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
          for (let j = 1; j <= ABILITY_LIMIT; j++) {
            partition.activations[j] = false
          }
        }

        const newUpdateIndex = newPartitions.findIndex((p) => p.value === activeUpdateValue)
        const newBaseIndex = newPartitions.findIndex((p) => p.value === activeBaseValue)

        // Inherit the previous active conditional's activations
        if (newUpdateIndex !== newBaseIndex && newUpdateIndex >= 0 && newBaseIndex >= 0) {
          for (let i = 0; i <= ABILITY_LIMIT; i++) {
            newPartitions[newBaseIndex].activations[i] = newPartitions[newUpdateIndex].activations[i] || newPartitions[newBaseIndex].activations[i]
          }
          for (let i = 0; i <= ABILITY_LIMIT; i++) {
            newPartitions[newUpdateIndex].activations[i] = false
          }
        }

        // The only 0 index activation should be the base conditional
        for (let i = 0; i < newPartitions.length; i++) {
          if (newPartitions[i].value === numberBaseConditional.partitions[0].value) {
            newPartitions[i].activations[0] = true
          } else {
            newPartitions[i].activations[0] = false
          }
        }

        // Move the base conditional to the front
        for (let i = 0; i < newPartitions.length; i++) {
          if (newPartitions[i].value === numberBaseConditional.partitions[0].value) {
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

    if (content.formItem === 'switch') {
      const value = conditionals[content.id] ?? defaults[content.id] ?? false
      const activations: boolean[] = Array(actionCount).fill(value)
      output[content.id] = {
        type: ConditionalDataType.BOOLEAN,
        activations: activations,
      }
    } else if (content.formItem === 'slider') {
      const rawValue = (conditionals[content.id] ?? defaults[content.id] ?? 0) as number
      const value = Math.min(Math.max(rawValue, content.min ?? rawValue), content.max ?? rawValue)
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubNumberConditional = {
        value: value,
        activations: activations,
      }
      output[content.id] = {
        type: ConditionalDataType.NUMBER,
        partitions: [valuePartitions],
      }
    } else if (content.formItem === 'select') {
      const value = (conditionals[content.id] ?? defaults[content.id] ?? 0) as number
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

  for (const setName of Object.keys(setConditionals) as Array<keyof SetConditionals>) {
    const setConditionalValue = setConditionals[setName]
    const p4Value = setConditionalValue[1]
    if (ConditionalSetMetadata[setName].type === ConditionalDataType.SELECT) {
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

function generateComboTeammate(teammate: Teammate, actionCount: number, dbMetadata: DBMetadata): ComboTeammate | null {
  if (!teammate?.characterId) return null

  const characterConditionals = teammate.characterConditionals || {}
  const lightConeConditionals = teammate.lightConeConditionals || {}

  const metadata: ComboCharacterMetadata = generateConditionalResolverMetadata(teammate, dbMetadata)

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
