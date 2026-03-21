// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Metadata } from 'lib/state/metadataInitializer'
import { ConditionalDataType } from 'lib/constants/constants'
import {
  DEFAULT_BASIC,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'

import type {
  ComboBooleanConditional,
  ComboNumberConditional,
  ComboState,
  ComboTeammate,
} from './comboDrawerTypes'
import type { CharacterId } from 'types/character'
import type { ElementName, PathName } from 'lib/constants/constants'

import {
  locateComboCategory,
  updateAbilityRotation,
  updateActivation,
  updateAddPartition,
  updateBooleanDefaultSelection,
  updateDeletePartition,
  updateFormState,
  updatePartitionActivation,
} from './comboDrawerUpdaters'

// ---------------------------------------------------------------------------
// Global setup
// ---------------------------------------------------------------------------

vi.mock('lib/state/saveState', () => ({
  SaveState: {
    delayedSave: vi.fn(),
  },
}))

vi.mock('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions', () => ({
  getForm: vi.fn(() => ({ characterId: '1001' })),
}))

Metadata.initialize()

// ---------------------------------------------------------------------------
// Store reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  useOptimizerRequestStore.setState(useOptimizerRequestStore.getInitialState())
})

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeTestComboState(): ComboState {
  return {
    comboCharacter: {
      metadata: {
        characterId: '1001' as CharacterId,
        characterEidolon: 0,
        path: 'Destruction' as PathName,
        lightCone: '21001',
        lightConeSuperimposition: 1,
        lightConePath: 'Destruction' as PathName,
        element: 'Physical' as ElementName,
      },
      characterConditionals: {
        testBool: {
          type: ConditionalDataType.BOOLEAN,
          activations: Array(13).fill(false),
        },
        testNumber: {
          type: ConditionalDataType.NUMBER,
          partitions: [
            { value: 3, activations: Array(13).fill(true) },
          ],
        },
      },
      lightConeConditionals: {},
      setConditionals: {},
      displayedRelicSets: [],
      displayedOrnamentSets: [],
    },
    comboTeammate0: null,
    comboTeammate1: null,
    comboTeammate2: null,
    comboTurnAbilities: [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC, DEFAULT_SKILL],
    version: '1.1',
  }
}

function makeTestTeammate(): ComboTeammate {
  return {
    metadata: {
      characterId: '1002' as CharacterId,
      characterEidolon: 0,
      path: 'Hunt' as PathName,
      lightCone: '21002',
      lightConeSuperimposition: 1,
      lightConePath: 'Hunt' as PathName,
      element: 'Wind' as ElementName,
    },
    characterConditionals: {
      tmBool: {
        type: ConditionalDataType.BOOLEAN,
        activations: Array(13).fill(false),
      },
    },
    lightConeConditionals: {},
    relicSetConditionals: {},
    ornamentSetConditionals: {},
  }
}

/** Typed accessor for the testBool conditional */
function getTestBool(state: ComboState): ComboBooleanConditional {
  return state.comboCharacter.characterConditionals.testBool as ComboBooleanConditional
}

/** Typed accessor for the testNumber conditional */
function getTestNumber(state: ComboState): ComboNumberConditional {
  return state.comboCharacter.characterConditionals.testNumber as ComboNumberConditional
}

// ---------------------------------------------------------------------------
// C1: locateComboCategory
// ---------------------------------------------------------------------------

describe('C1: locateComboCategory', () => {
  it('C1a — returns correct category for comboCharacter + characterConditionals', () => {
    const state = makeTestComboState()
    const result = locateComboCategory('comboCharacter', 'testBool', state)
    expect(result).toBe(state.comboCharacter.characterConditionals.testBool)
    expect(result!.type).toBe(ConditionalDataType.BOOLEAN)
  })

  it('C1b — returns correct category for populated teammate', () => {
    const state = makeTestComboState()
    state.comboTeammate0 = makeTestTeammate()
    const result = locateComboCategory('comboTeammate0', 'tmBool', state)
    expect(result).toBe(state.comboTeammate0.characterConditionals.tmBool)
    expect(result!.type).toBe(ConditionalDataType.BOOLEAN)
  })

  it('C1c — BUG-10 fixed: null teammate returns null instead of throwing', () => {
    const state = makeTestComboState()
    // comboTeammate1 is null — after BUG-10 fix, returns null gracefully
    const result = locateComboCategory('comboTeammate1', 'someCond', state)
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// C2: updateActivation
// ---------------------------------------------------------------------------

describe('C2: updateActivation', () => {
  it('C2a — toggles boolean at index 3 to true', () => {
    const state = makeTestComboState()
    const keyString = JSON.stringify({
      id: 'testBool',
      source: 'comboCharacter',
      index: 3,
      partitionIndex: 0,
    })
    updateActivation(keyString, true, state)
    expect(getTestBool(state).activations[3]).toBe(true)
    // Other indices remain false
    expect(getTestBool(state).activations[1]).toBe(false)
  })

  it('C2b — index 0 is skipped (no mutation)', () => {
    const state = makeTestComboState()
    const keyString = JSON.stringify({
      id: 'testBool',
      source: 'comboCharacter',
      index: 0,
      partitionIndex: 0,
    })
    updateActivation(keyString, true, state)
    expect(getTestBool(state).activations[0]).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// C3: updatePartitionActivation
// ---------------------------------------------------------------------------

describe('C3: updatePartitionActivation', () => {
  it('C3a — sets partition 1 active at index 5, all others false at 5', () => {
    const state = makeTestComboState()
    // Add a second partition to testNumber
    const numberCond = getTestNumber(state)
    numberCond.partitions.push({ value: 7, activations: Array(13).fill(false) })

    const keyString = JSON.stringify({
      id: 'testNumber',
      source: 'comboCharacter',
      index: 5,
      partitionIndex: 1,
    })

    updatePartitionActivation(keyString, state)

    expect(numberCond.partitions[1].activations[5]).toBe(true)
    expect(numberCond.partitions[0].activations[5]).toBe(false)
  })

  it('C3b — index 0 is skipped', () => {
    const state = makeTestComboState()
    const originalActivation0 = getTestNumber(state).partitions[0].activations[0]

    const keyString = JSON.stringify({
      id: 'testNumber',
      source: 'comboCharacter',
      index: 0,
      partitionIndex: 0,
    })
    updatePartitionActivation(keyString, state)

    expect(getTestNumber(state).partitions[0].activations[0]).toBe(originalActivation0)
  })
})

// ---------------------------------------------------------------------------
// C4: updateAddPartition (BUG-11)
// ---------------------------------------------------------------------------

describe('C4: updateAddPartition', () => {
  it('C4a — BUG-11: new partition value EQUALS source partition value (should differ)', () => {
    const state = makeTestComboState()
    const originalValue = getTestNumber(state).partitions[0].value
    updateAddPartition(state, 'comboCharacter', 'testNumber', 0)

    const partitions = getTestNumber(state).partitions
    expect(partitions).toHaveLength(2)

    // BUG-11: the new partition copies the source value verbatim
    expect(partitions[1].value).toBe(originalValue)
    // New partition's activations are all false
    expect(partitions[1].activations.every((v: boolean) => v === false)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// C5: updateDeletePartition
// ---------------------------------------------------------------------------

describe('C5: updateDeletePartition', () => {
  it('C5a — deletes partition 1 and orphan activations fall back to partition 0', () => {
    const state = makeTestComboState()
    const numberCond = getTestNumber(state)

    // Add a second partition where index 5 is active only in partition 1
    numberCond.partitions.push({ value: 7, activations: Array(13).fill(false) })
    numberCond.partitions[0].activations[5] = false
    numberCond.partitions[1].activations[5] = true

    updateDeletePartition(state, 'comboCharacter', 'testNumber', 1)

    expect(numberCond.partitions).toHaveLength(1)
    // Index 5 was orphaned (only partition 1 had it), so it falls back to partition 0
    expect(numberCond.partitions[0].activations[5]).toBe(true)
  })

  it('C5b — cannot delete partition 0', () => {
    const state = makeTestComboState()
    const result = updateDeletePartition(state, 'comboCharacter', 'testNumber', 0)
    expect(result).toBeUndefined()

    expect(getTestNumber(state).partitions).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// C6: updateAbilityRotation (BUG-24)
// ---------------------------------------------------------------------------

describe('C6: updateAbilityRotation', () => {
  it('C6a — BUG-24: overwriting an existing turn resets custom activations via setActivationIndexToDefault', () => {
    const state = makeTestComboState()
    // comboTurnAbilities: [NULL, BASIC, SKILL] — length 3
    // Extend to 5: [NULL, BASIC, SKILL, ULT, BASIC]
    state.comboTurnAbilities.push(DEFAULT_ULT, DEFAULT_BASIC)

    // Set a custom activation at index 3 (true instead of default false)
    getTestBool(state).activations[3] = true

    // Overwrite index 3 (which is < length 5) with a different ability
    updateAbilityRotation(state, 3, DEFAULT_SKILL)

    // BUG-24: setActivationIndexToDefault resets activations[3] to the default (activations[0] value = false)
    // The user's custom activation at index 3 is lost
    expect(getTestBool(state).activations[3]).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// C7: updateAbilityRotation — Regression
// ---------------------------------------------------------------------------

describe('C7: updateAbilityRotation regression', () => {
  it('C7a — append new turn (index === length) sets activations at new index to defaults', () => {
    const state = makeTestComboState()
    // comboTurnAbilities: [NULL, BASIC, SKILL] — length 3
    // Set custom activation at index 0 (the default) to true
    getTestBool(state).activations[0] = true

    // Append at index 3 (=== length)
    updateAbilityRotation(state, 3, DEFAULT_ULT)

    expect(state.comboTurnAbilities).toHaveLength(4)
    expect(state.comboTurnAbilities[3]).toBe(DEFAULT_ULT)

    // The new index 3 gets the default value (activations[0] = true)
    expect(getTestBool(state).activations[3]).toBe(true)
  })

  it('C7b — delete turn shifts activations left', () => {
    const state = makeTestComboState()
    // comboTurnAbilities: [NULL, BASIC, SKILL] — length 3
    // Set distinct activations so we can verify the shift
    getTestBool(state).activations[1] = true  // BASIC
    getTestBool(state).activations[2] = false // SKILL

    // Delete index 1 (BASIC) — the NULL_TURN_ABILITY_NAME triggers deletion
    updateAbilityRotation(state, 1, NULL_TURN_ABILITY_NAME)

    expect(state.comboTurnAbilities).toHaveLength(2)
    expect(state.comboTurnAbilities[1]).toBe(DEFAULT_SKILL)

    // After shift-left at index 1: activations[1] should now hold what was at [2] (false)
    expect(getTestBool(state).activations[1]).toBe(false)
  })

  it('C7c — cannot delete below 2 turns', () => {
    const state = makeTestComboState()
    // comboTurnAbilities: [NULL, BASIC, SKILL] — length 3
    // Delete once to get to length 2
    updateAbilityRotation(state, 1, NULL_TURN_ABILITY_NAME)
    expect(state.comboTurnAbilities).toHaveLength(2)

    // Try deleting again — should be blocked (length <= 2)
    const result = updateAbilityRotation(state, 1, NULL_TURN_ABILITY_NAME)
    expect(result).toBeUndefined()
    expect(state.comboTurnAbilities).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// C8: updateBooleanDefaultSelection
// ---------------------------------------------------------------------------

describe('C8: updateBooleanDefaultSelection', () => {
  it('C8a — setting default to true sets ALL activations to true', () => {
    const state = makeTestComboState()
    // Initially all false
    expect(getTestBool(state).activations.every((v: boolean) => v === false)).toBe(true)

    updateBooleanDefaultSelection(state, 'comboCharacter', 'testBool', true)

    const activations = getTestBool(state).activations
    expect(activations.every((v: boolean) => v === true)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// C9: updateFormState
// ---------------------------------------------------------------------------

describe('C9: updateFormState', () => {
  it('C9a — serializes comboState into useOptimizerRequestStore.comboStateJson', () => {
    const state = makeTestComboState()
    updateFormState(state)

    const stored = useOptimizerRequestStore.getState().comboStateJson
    expect(stored).toBe(JSON.stringify(state))
  })
})
