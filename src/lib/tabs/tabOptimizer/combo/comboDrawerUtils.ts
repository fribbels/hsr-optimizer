import { getCharacterById, useCharacterStore } from 'lib/stores/character/characterStore'
import { SaveState } from 'lib/state/saveState'
import { getForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'

import { ConditionalDataType } from 'lib/constants/constants'
import type { ComboCharacter, ComboConditionals, ComboNumberConditional, ComboTeammate } from 'lib/optimization/combo/comboTypes'
import { locateConditional, useComboDrawerStore } from './useComboDrawerStore'

// ─── Teammate Helpers ────────────────────────────────────────

export function getTeammateIndex(sourceKey: string) {
  if (sourceKey.includes('Teammate0')) return 0
  if (sourceKey.includes('Teammate1')) return 1
  if (sourceKey.includes('Teammate2')) return 2
  return undefined
}

export function elementToDataKey(element: HTMLElement | SVGElement) {
  return element.getAttribute('data-key') ?? '{}' // Get the data-key attribute
}

export type TeammateKey = 'comboTeammate0' | 'comboTeammate1' | 'comboTeammate2'
const TEAMMATE_KEY_LENGTH = 'comboTeammate0'.length

export function extractTeammateKey(sourceKey: string): TeammateKey {
  return sourceKey.substring(0, TEAMMATE_KEY_LENGTH) as TeammateKey
}

// ─── Activation Tree Walkers ─────────────────────────────────

export function shiftLeft(arr: boolean[], index: number) {
  arr.splice(index, 1)
  // No push — array should shrink by 1 to match comboTurnAbilities after deletion
}


// ─── Persistence Helpers ─────────────────────────────────────

/** Sync current optimizer form to the character store (no localStorage write). */
export function syncFormToCharacterStore(): void {
  const form = getForm()
  const found = getCharacterById(form.characterId)
  if (found) {
    useCharacterStore.getState().setCharacter({ ...found, form: { ...found.form, ...form } })
  }
}

/** Sync form to character store and schedule a delayed localStorage save. */
export function persistFormToCharacterStore(delayMs = 1000): void {
  syncFormToCharacterStore()
  SaveState.delayedSave(delayMs)
}

// ─── Partition Click Handler ─────────────────────────────────

export function handlePartitionButtonClick(
  sourceKey: string,
  contentItemId: string,
  partitionIndex: number,
  getCandidateValues: () => number[],
): void {
  if (partitionIndex === 0) {
    const state = useComboDrawerStore.getState()
    const cond = locateConditional(state, sourceKey, contentItemId)
    const partitions = (cond as ComboNumberConditional)?.partitions ?? []
    const usedValues = new Set(partitions.map((p) => p.value))
    const candidates = getCandidateValues()
    const newValue = candidates.find((v) => !usedValues.has(v)) ?? candidates[0] ?? 0
    state.addPartition(sourceKey, contentItemId, partitionIndex, newValue)
  } else {
    useComboDrawerStore.getState().deletePartition(sourceKey, contentItemId, partitionIndex)
  }
}

// ─── A) Source Key Routing Table ──────────────────────────────

export type EntityKey = 'comboCharacter' | 'comboTeammate0' | 'comboTeammate1' | 'comboTeammate2'

export type SourceKeyRoute = {
  entityKey: EntityKey
  conditionalsKey: string
  isTeammate: boolean
}

const SOURCE_KEY_ROUTES: Record<string, SourceKeyRoute> = {}

function addCharacterRoutes() {
  SOURCE_KEY_ROUTES['comboCharacter'] = { entityKey: 'comboCharacter', conditionalsKey: 'characterConditionals', isTeammate: false }
  SOURCE_KEY_ROUTES['comboCharacterLightCone'] = { entityKey: 'comboCharacter', conditionalsKey: 'lightConeConditionals', isTeammate: false }
  SOURCE_KEY_ROUTES['comboCharacterRelicSets'] = { entityKey: 'comboCharacter', conditionalsKey: 'setConditionals', isTeammate: false }
}

function addTeammateRoutes(entityKey: EntityKey, prefix: string) {
  SOURCE_KEY_ROUTES[prefix] = { entityKey, conditionalsKey: 'characterConditionals', isTeammate: true }
  SOURCE_KEY_ROUTES[prefix + 'LightCone'] = { entityKey, conditionalsKey: 'lightConeConditionals', isTeammate: true }
  SOURCE_KEY_ROUTES[prefix + 'RelicSet'] = { entityKey, conditionalsKey: 'relicSetConditionals', isTeammate: true }
  SOURCE_KEY_ROUTES[prefix + 'OrnamentSet'] = { entityKey, conditionalsKey: 'ornamentSetConditionals', isTeammate: true }
}

addCharacterRoutes()
addTeammateRoutes('comboTeammate0', 'comboTeammate0')
addTeammateRoutes('comboTeammate1', 'comboTeammate1')
addTeammateRoutes('comboTeammate2', 'comboTeammate2')

export function resolveSourceKeyRoute(sourceKey: string): SourceKeyRoute | null {
  return SOURCE_KEY_ROUTES[sourceKey] ?? null
}

// ─── B) Type Guard ────────────────────────────────────────────

export function isComboCharacter(entity: ComboCharacter | ComboTeammate): entity is ComboCharacter {
  return 'setConditionals' in entity
}

// ─── C) Typed Entity Conditional Accessors ────────────────────

export function getEntityConditionals(
  entity: ComboCharacter | ComboTeammate,
  conditionalsKey: string,
): ComboConditionals | undefined {
  switch (conditionalsKey) {
    case 'characterConditionals': return entity.characterConditionals
    case 'lightConeConditionals': return entity.lightConeConditionals
    case 'setConditionals': return isComboCharacter(entity) ? entity.setConditionals : undefined
    case 'relicSetConditionals': return !isComboCharacter(entity) ? entity.relicSetConditionals : undefined
    case 'ornamentSetConditionals': return !isComboCharacter(entity) ? entity.ornamentSetConditionals : undefined
    default: return undefined
  }
}

export function withEntityConditionals(
  entity: ComboCharacter | ComboTeammate,
  conditionalsKey: string,
  conditionals: ComboConditionals,
): ComboCharacter | ComboTeammate {
  return { ...entity, [conditionalsKey]: conditionals }
}

// ─── D) Typed Activation Traversal ────────────────────────────

function visitConditionals(
  conditionals: ComboConditionals,
  fn: (activations: boolean[]) => void,
): void {
  for (const cond of Object.values(conditionals)) {
    if (cond.type === ConditionalDataType.BOOLEAN) {
      fn(cond.activations)
    } else {
      for (const partition of cond.partitions) {
        fn(partition.activations)
      }
    }
  }
}

export function forEachActivation(
  entity: ComboCharacter | ComboTeammate,
  fn: (activations: boolean[]) => void,
): void {
  visitConditionals(entity.characterConditionals, fn)
  visitConditionals(entity.lightConeConditionals, fn)
  if (isComboCharacter(entity)) {
    visitConditionals(entity.setConditionals, fn)
  } else {
    visitConditionals(entity.relicSetConditionals, fn)
    visitConditionals(entity.ornamentSetConditionals, fn)
  }
}
