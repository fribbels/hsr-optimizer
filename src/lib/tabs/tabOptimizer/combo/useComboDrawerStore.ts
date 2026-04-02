import { ConditionalDataType } from 'lib/constants/constants'
import { type TurnAbilityName, NULL_TURN_ABILITY_NAME } from 'lib/optimization/rotation/turnAbilityConfig'
import { preprocessTurnAbilityNames } from 'lib/optimization/rotation/turnPreprocessor'
import { SetsOrnaments, SetsRelics } from 'lib/sets/setConfigRegistry'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { clone } from 'lib/utils/objectUtils'
import type { Form } from 'types/form'

import type {
  ComboCharacter,
  ComboCharacterMetadata,
  ComboConditionalCategory,
  ComboConditionals,
  ComboNumberConditional,
  ComboState,
  ComboTeammate,
} from 'lib/optimization/combo/comboTypes'
import { initializeComboState } from 'lib/optimization/combo/comboInitializers'
import { forEachActivation, getEntityConditionals, resolveSourceKeyRoute, shiftLeft, withEntityConditionals } from './comboDrawerUtils'

// ─── State Shape ───────────────────────────────────────────────

export type ComboDrawerState = {
  comboCharacter: ComboCharacter | null
  comboTeammate0: ComboTeammate | null
  comboTeammate1: ComboTeammate | null
  comboTeammate2: ComboTeammate | null
  comboTurnAbilities: TurnAbilityName[]
  version: string | undefined
  initialized: boolean
}

type ComboDrawerActions = {
  initialize: (form: Form) => void
  reset: () => void

  setActivation: (sourceKey: string, id: string, index: number, value: boolean) => void
  setPartitionActivation: (sourceKey: string, id: string, partitionIndex: number, index: number) => void
  batchSetActivations: (
    updates: Array<{ sourceKey: string; id: string; index: number; value: boolean }>,
    partitionUpdate?: { sourceKey: string; id: string; partitionIndex: number; index: number } | null,
  ) => void
  setNumberDefault: (sourceKey: string, id: string, partitionIndex: number, value: number) => void
  addPartition: (sourceKey: string, id: string, partitionIndex: number, newValue: number) => void
  deletePartition: (sourceKey: string, id: string, partitionIndex: number) => void
  setBooleanDefault: (sourceKey: string, id: string, value: boolean) => void
  setAbilityRotation: (index: number, name: TurnAbilityName) => void
  updateSelectedSets: (sets: string[], isOrnaments: boolean) => void

  getComboState: () => ComboState | null
}

export type ComboDrawerStore = ComboDrawerState & ComboDrawerActions

// ─── Exported Helpers ──────────────────────────────────────────

/**
 * Navigate the ComboState tree to find a specific conditional category.
 * Used by Selecto handlers to determine conditional type for a given cell.
 */
export function locateConditional(
  state: ComboDrawerState,
  sourceKey: string,
  contentItemId: string,
): ComboConditionalCategory | null {
  const route = resolveSourceKeyRoute(sourceKey)
  if (!route) return null
  const entity = state[route.entityKey]
  if (!entity) return null
  const conditionals = getEntityConditionals(entity, route.conditionalsKey)
  if (!conditionals) return null
  return conditionals[contentItemId] ?? null
}

/**
 * Resolve the metadata for a given originKey. Returns a STABLE reference
 * that only changes when the character/teammate is swapped — never during drag.
 */
export function resolveMetadata(
  state: ComboDrawerState,
  originKey: string,
): ComboCharacterMetadata | null {
  const route = resolveSourceKeyRoute(originKey)
  if (!route) return null
  return state[route.entityKey]?.metadata ?? null
}

/**
 * Resolve the specific conditional bucket for a given originKey.
 * Returns a reference that only changes when a conditional WITHIN THIS BUCKET changes.
 * E.g., changing characterConditionals does NOT affect lightConeConditionals.
 */
export function resolveConditionals(
  state: ComboDrawerState,
  originKey: string,
): ComboConditionals | null {
  const route = resolveSourceKeyRoute(originKey)
  if (!route) return null
  const entity = state[route.entityKey]
  if (!entity) return null
  return getEntityConditionals(entity, route.conditionalsKey) ?? null
}

// ─── Private Helpers ───────────────────────────────────────────

/**
 * Deep-clone a conditional's path so Zustand's shallow equality detects
 * changes. Only clones the minimum path: parent -> conditionals map ->
 * the specific conditional -> activations arrays.
 */
function cloneConditionalPath(
  state: ComboDrawerState,
  sourceKey: string,
  contentItemId: string,
): { newState: Partial<ComboDrawerState>; conditional: ComboConditionalCategory | null } {
  const route = resolveSourceKeyRoute(sourceKey)
  if (!route) return { newState: {}, conditional: null }

  const entity = state[route.entityKey]
  if (!entity) return { newState: {}, conditional: null }

  const conditionals = getEntityConditionals(entity, route.conditionalsKey)
  if (!conditionals) return { newState: {}, conditional: null }

  const conditional = conditionals[contentItemId]
  if (!conditional) return { newState: {}, conditional: null }

  let clonedConditional: ComboConditionalCategory
  if (conditional.type === ConditionalDataType.BOOLEAN) {
    clonedConditional = { ...conditional, activations: [...conditional.activations] }
  } else {
    clonedConditional = {
      ...conditional,
      partitions: conditional.partitions.map((p) => ({ ...p, activations: [...p.activations] })),
    }
  }

  const clonedConditionals = { ...conditionals, [contentItemId]: clonedConditional }
  const clonedEntity = withEntityConditionals(entity, route.conditionalsKey, clonedConditionals)

  return {
    newState: { [route.entityKey]: clonedEntity } as Partial<ComboDrawerState>,
    conditional: clonedConditional,
  }
}

// ─── Store ─────────────────────────────────────────────────────

const initialState: ComboDrawerState = {
  comboCharacter: null,
  comboTeammate0: null,
  comboTeammate1: null,
  comboTeammate2: null,
  comboTurnAbilities: [],
  version: undefined,
  initialized: false,
}

export const useComboDrawerStore = createTabAwareStore<ComboDrawerStore>((set, get) => ({
  ...initialState,

  initialize: (form: Form) => {
    if (!form?.characterId || !form.characterConditionals) return

    const comboState = initializeComboState(form, true)
    comboState.comboTurnAbilities = preprocessTurnAbilityNames(comboState.comboTurnAbilities)

    set({
      comboCharacter: comboState.comboCharacter,
      comboTeammate0: comboState.comboTeammate0,
      comboTeammate1: comboState.comboTeammate1,
      comboTeammate2: comboState.comboTeammate2,
      comboTurnAbilities: comboState.comboTurnAbilities,
      version: comboState.version,
      initialized: true,
    })
  },

  reset: () => set(initialState),

  getComboState: (): ComboState | null => {
    const state = get()
    if (!state.comboCharacter) return null
    return {
      comboCharacter: state.comboCharacter,
      comboTeammate0: state.comboTeammate0,
      comboTeammate1: state.comboTeammate1,
      comboTeammate2: state.comboTeammate2,
      comboTurnAbilities: state.comboTurnAbilities,
      version: state.version,
    }
  },

  setActivation: (sourceKey, id, index, value) => {
    if (index === 0) return
    const state = get()
    const { newState, conditional } = cloneConditionalPath(state, sourceKey, id)
    if (!conditional || conditional.type !== ConditionalDataType.BOOLEAN) return
    conditional.activations[index] = value
    set(newState)
  },

  setPartitionActivation: (sourceKey, id, partitionIndex, index) => {
    if (index === 0) return
    const state = get()
    const { newState, conditional } = cloneConditionalPath(state, sourceKey, id)
    if (!conditional) return
    if (conditional.type !== ConditionalDataType.NUMBER && conditional.type !== ConditionalDataType.SELECT) return
    const numberCond = conditional as ComboNumberConditional
    for (let i = 0; i < numberCond.partitions.length; i++) {
      numberCond.partitions[i].activations[index] = (i === partitionIndex)
    }
    set(newState)
  },

  batchSetActivations: (updates, partitionUpdate) => {
    const state = get()

    // Group boolean updates by sourceKey+id to minimize cloning
    const grouped = new Map<string, typeof updates>()
    for (const u of updates) {
      const key = `${u.sourceKey}::${u.id}`
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(u)
    }

    let mergedNewState: Partial<ComboDrawerState> = {}

    for (const [, group] of grouped) {
      const first = group[0]
      const { newState: pathState, conditional } = cloneConditionalPath(
        { ...state, ...mergedNewState } as ComboDrawerState,
        first.sourceKey,
        first.id,
      )
      if (!conditional || conditional.type !== ConditionalDataType.BOOLEAN) continue
      for (const u of group) {
        if (u.index === 0) continue
        conditional.activations[u.index] = u.value
      }
      mergedNewState = { ...mergedNewState, ...pathState }
    }

    if (partitionUpdate) {
      const pu = partitionUpdate
      if (pu.index !== 0) {
        const { newState: pathState, conditional } = cloneConditionalPath(
          { ...state, ...mergedNewState } as ComboDrawerState,
          pu.sourceKey,
          pu.id,
        )
        if (conditional && (conditional.type === ConditionalDataType.NUMBER || conditional.type === ConditionalDataType.SELECT)) {
          const numberCond = conditional as ComboNumberConditional
          for (let i = 0; i < numberCond.partitions.length; i++) {
            numberCond.partitions[i].activations[pu.index] = (i === pu.partitionIndex)
          }
          mergedNewState = { ...mergedNewState, ...pathState }
        }
      }
    }

    if (Object.keys(mergedNewState).length > 0) {
      set(mergedNewState)
    }
  },

  setNumberDefault: (sourceKey, id, partitionIndex, value) => {
    const state = get()
    const { newState, conditional } = cloneConditionalPath(state, sourceKey, id)
    if (!conditional) return
    if (conditional.type !== ConditionalDataType.NUMBER && conditional.type !== ConditionalDataType.SELECT) return
    const numberCond = conditional as ComboNumberConditional
    numberCond.partitions[partitionIndex].value = value
    set(newState)
  },

  addPartition: (sourceKey, id, _partitionIndex, newValue) => {
    const state = get()
    const { newState, conditional } = cloneConditionalPath(state, sourceKey, id)
    if (!conditional) return
    if (conditional.type !== ConditionalDataType.NUMBER && conditional.type !== ConditionalDataType.SELECT) return
    const numberCond = conditional as ComboNumberConditional
    const activationsLength = numberCond.partitions[0].activations.length
    numberCond.partitions.push({
      value: newValue,
      activations: Array(activationsLength).fill(false),
    })
    set(newState)
  },

  deletePartition: (sourceKey, id, partitionIndex) => {
    if (partitionIndex === 0) return
    const state = get()
    const { newState, conditional } = cloneConditionalPath(state, sourceKey, id)
    if (!conditional) return
    if (conditional.type !== ConditionalDataType.NUMBER && conditional.type !== ConditionalDataType.SELECT) return
    const numberCond = conditional as ComboNumberConditional
    numberCond.partitions.splice(partitionIndex, 1)
    for (let i = 0; i < numberCond.partitions[0].activations.length; i++) {
      let hasValue = false
      for (let j = 0; j < numberCond.partitions.length; j++) {
        if (numberCond.partitions[j].activations[i]) { hasValue = true; break }
      }
      if (!hasValue) numberCond.partitions[0].activations[i] = true
    }
    set(newState)
  },

  setBooleanDefault: (sourceKey, id, value) => {
    const state = get()
    const { newState, conditional } = cloneConditionalPath(state, sourceKey, id)
    if (!conditional || conditional.type !== ConditionalDataType.BOOLEAN) return
    for (let i = 0; i < conditional.activations.length; i++) {
      conditional.activations[i] = value
    }
    set(newState)
  },

  // Only reset activations for new turns (append), not overwrites — changing
  // an existing turn's ability type should preserve the user's conditional settings.
  setAbilityRotation: (index, turnAbilityName) => {
    const state = get()
    const comboTurnAbilities = [...state.comboTurnAbilities]

    if (index > comboTurnAbilities.length) return

    if (turnAbilityName === NULL_TURN_ABILITY_NAME) {
      if (comboTurnAbilities.length <= 2) return
      comboTurnAbilities.splice(index, 1)

      const clonedCharacter = state.comboCharacter ? clone(state.comboCharacter) : null
      const clonedTeammate0 = state.comboTeammate0 ? clone(state.comboTeammate0) : null
      const clonedTeammate1 = state.comboTeammate1 ? clone(state.comboTeammate1) : null
      const clonedTeammate2 = state.comboTeammate2 ? clone(state.comboTeammate2) : null

      if (clonedCharacter) forEachActivation(clonedCharacter, (arr) => shiftLeft(arr, index))
      if (clonedTeammate0) forEachActivation(clonedTeammate0, (arr) => shiftLeft(arr, index))
      if (clonedTeammate1) forEachActivation(clonedTeammate1, (arr) => shiftLeft(arr, index))
      if (clonedTeammate2) forEachActivation(clonedTeammate2, (arr) => shiftLeft(arr, index))

      set({
        comboCharacter: clonedCharacter,
        comboTeammate0: clonedTeammate0,
        comboTeammate1: clonedTeammate1,
        comboTeammate2: clonedTeammate2,
        comboTurnAbilities,
      })
    } else if (index >= comboTurnAbilities.length) {
      // New turn (append) — reset activations to defaults
      comboTurnAbilities[index] = turnAbilityName

      const clonedCharacter = state.comboCharacter ? clone(state.comboCharacter) : null
      const clonedTeammate0 = state.comboTeammate0 ? clone(state.comboTeammate0) : null
      const clonedTeammate1 = state.comboTeammate1 ? clone(state.comboTeammate1) : null
      const clonedTeammate2 = state.comboTeammate2 ? clone(state.comboTeammate2) : null

      if (clonedCharacter) forEachActivation(clonedCharacter, (arr) => { arr[index] = arr[0] })
      if (clonedTeammate0) forEachActivation(clonedTeammate0, (arr) => { arr[index] = arr[0] })
      if (clonedTeammate1) forEachActivation(clonedTeammate1, (arr) => { arr[index] = arr[0] })
      if (clonedTeammate2) forEachActivation(clonedTeammate2, (arr) => { arr[index] = arr[0] })

      set({
        comboCharacter: clonedCharacter,
        comboTeammate0: clonedTeammate0,
        comboTeammate1: clonedTeammate1,
        comboTeammate2: clonedTeammate2,
        comboTurnAbilities,
      })
    } else {
      // Overwrite existing turn — preserve per-turn activations
      comboTurnAbilities[index] = turnAbilityName
      set({ comboTurnAbilities })
    }
  },

  // Pure state change: toggle display flags on set conditionals.
  // Side effects (persisting to other stores) handled by comboDrawerService.
  updateSelectedSets: (sets, isOrnaments) => {
    const state = get()
    if (!state.comboCharacter) return

    const character = { ...state.comboCharacter }
    const setConditionals = { ...character.setConditionals }

    const setsToIterate = isOrnaments ? Object.values(SetsOrnaments) : Object.values(SetsRelics)
    for (const setName of setsToIterate as string[]) {
      const cond = setConditionals[setName]
      if (cond) {
        setConditionals[setName] = { ...cond, display: sets.includes(setName) }
      }
    }

    character.setConditionals = setConditionals
    if (isOrnaments) {
      character.displayedOrnamentSets = sets
    } else {
      character.displayedRelicSets = sets
    }

    set({ comboCharacter: character })
  },
}))
