import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { SaveState } from 'lib/state/saveState'
import { getForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'

import type { ComboNumberConditional, NestedObject } from './comboDrawerTypes'
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
  arr.push(arr[0])
}

export function shiftAllActivationsInObj(obj: NestedObject, index: number): void {
  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) continue
    if (key === 'activations' && Array.isArray(obj[key])) {
      shiftLeft(obj[key] as boolean[], index)
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      shiftAllActivationsInObj(obj[key] as NestedObject, index)
    }
  }
}

export function setActivationIndexToDefault(obj: NestedObject, index: number): void {
  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) continue
    if (key === 'activations' && Array.isArray(obj[key])) {
      (obj[key] as boolean[])[index] = (obj[key] as boolean[])[0]
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      setActivationIndexToDefault(obj[key] as NestedObject, index)
    }
  }
}

// ─── Persistence Helper ──────────────────────────────────────

export function persistFormToCharacterStore(delayMs = 1000): void {
  const form = getForm()
  const found = getCharacterById(form.characterId)
  if (found) {
    useCharacterStore.getState().setCharacter({ ...found, form: { ...found.form, ...form } })
  }
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
