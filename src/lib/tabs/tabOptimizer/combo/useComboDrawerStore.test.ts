// @vitest-environment jsdom
import { ConditionalDataType } from 'lib/constants/constants'
import {
  DEFAULT_BASIC,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { DanHeng } from 'lib/conditionals/character/1000/DanHeng'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import type {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import type {
  ComboBooleanConditional,
  ComboCharacter,
  ComboNumberConditional,
  ComboSelectConditional,
  ComboTeammate,
} from 'lib/optimization/combo/comboTypes'

import {
  locateConditional,
  useComboDrawerStore,
} from './useComboDrawerStore'
import type { ComboDrawerStore } from './useComboDrawerStore'

// ---------------------------------------------------------------------------
// Global setup
// ---------------------------------------------------------------------------

vi.mock('lib/state/saveState', () => ({
  SaveState: {
    delayedSave: vi.fn(),
  },
}))

vi.mock('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions', () => ({
  getForm: vi.fn(() => ({ characterId: Kafka.id })),
}))

Metadata.initialize()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStore(): ComboDrawerStore {
  return useComboDrawerStore.getState()
}

function makeCharacter(): ComboCharacter {
  return {
    metadata: {
      characterId: Kafka.id,
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
        activations: [false, false, false, false, false],
      },
      testBool2: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, true, true, true, true],
      },
      testNumber: {
        type: ConditionalDataType.NUMBER,
        partitions: [
          { value: 3, activations: [true, true, true, true, true] },
        ],
      },
      testSelect: {
        type: ConditionalDataType.SELECT,
        partitions: [
          { value: 1, activations: [true, true, true, true, true] },
        ],
      },
    },
    lightConeConditionals: {
      lcBool: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, true, true, true, true],
      },
    },
    setConditionals: {
      someSet: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, true, true, true, true],
        display: false,
      },
    },
    displayedRelicSets: [],
    displayedOrnamentSets: [],
  }
}

function makeTeammate(): ComboTeammate {
  return {
    metadata: {
      characterId: DanHeng.id,
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
        activations: [false, false, false, false, false],
      },
    },
    lightConeConditionals: {},
    relicSetConditionals: {
      tmRelicSet: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, true, true, true, true],
      },
    },
    ornamentSetConditionals: {
      tmOrnamentSet: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, true, true, true, true],
      },
    },
  }
}

function seedStore() {
  useComboDrawerStore.setState({
    comboCharacter: makeCharacter(),
    comboTeammate0: makeTeammate(),
    comboTeammate1: null,
    comboTeammate2: null,
    comboTurnAbilities: [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC, DEFAULT_SKILL] as TurnAbilityName[],
    version: '1.1',
    initialized: true,
  })
}

// ---------------------------------------------------------------------------
// Store reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  useComboDrawerStore.setState(useComboDrawerStore.getInitialState())
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useComboDrawerStore', () => {
  // ─── initialize ──────────────────────────────────────────────

  describe('initialize', () => {
    it('produces correct state with all fields from a form', () => {
      const store = getStore()

      // Should not crash with invalid form
      store.initialize({} as never)
      expect(getStore().initialized).toBe(false)

      // Valid form with real character
      const form = {
        characterId: Kafka.id,
        characterEidolon: 0,
        lightCone: '21001',
        lightConeSuperimposition: 1,
        characterConditionals: {},
        lightConeConditionals: {},
        setConditionals: {},
        teammate0: { characterId: '', characterEidolon: 0, lightCone: '', lightConeSuperimposition: 1, characterConditionals: {}, lightConeConditionals: {} },
        teammate1: { characterId: '', characterEidolon: 0, lightCone: '', lightConeSuperimposition: 1, characterConditionals: {}, lightConeConditionals: {} },
        teammate2: { characterId: '', characterEidolon: 0, lightCone: '', lightConeSuperimposition: 1, characterConditionals: {}, lightConeConditionals: {} },
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store.initialize(form as any)
      const state = getStore()

      expect(state.initialized).toBe(true)
      expect(state.comboCharacter).not.toBeNull()
      expect(state.comboCharacter!.metadata.characterId).toBe(Kafka.id)
      expect(Array.isArray(state.comboTurnAbilities)).toBe(true)
      expect(state.comboTurnAbilities.length).toBeGreaterThan(0)
    })
  })

  // ─── reset ───────────────────────────────────────────────────

  describe('reset', () => {
    it('returns to initial state', () => {
      seedStore()
      expect(getStore().initialized).toBe(true)

      getStore().reset()
      const state = getStore()

      expect(state.initialized).toBe(false)
      expect(state.comboCharacter).toBeNull()
      expect(state.comboTeammate0).toBeNull()
      expect(state.comboTurnAbilities).toEqual([])
      expect(state.version).toBeUndefined()
    })
  })

  // ─── setActivation ──────────────────────────────────────────

  describe('setActivation', () => {
    it('toggles a boolean activation at a given index', () => {
      seedStore()

      getStore().setActivation('comboCharacter', 'testBool', 2, true)
      const cond = getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      expect(cond.activations[2]).toBe(true)
      // Other indices unchanged
      expect(cond.activations[1]).toBe(false)
      expect(cond.activations[3]).toBe(false)
    })

    it('index 0 guard — does not modify default', () => {
      seedStore()

      getStore().setActivation('comboCharacter', 'testBool', 0, true)
      const cond = getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      expect(cond.activations[0]).toBe(false)
    })

    it('ignores non-BOOLEAN conditionals', () => {
      seedStore()

      // Capture the entire partition structure before calling setActivation
      const before = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional
      const beforePartitions = JSON.stringify(before.partitions)

      // Attempt to set activation on a NUMBER conditional — should be a no-op
      getStore().setActivation('comboCharacter', 'testNumber', 1, true)

      // Verify the partition structure is completely unchanged
      const after = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional
      expect(JSON.stringify(after.partitions)).toBe(beforePartitions)
    })
  })

  // ─── setPartitionActivation ─────────────────────────────────

  describe('setPartitionActivation', () => {
    it('sets radio-style partition activation', () => {
      seedStore()

      // Add a second partition first
      getStore().addPartition('comboCharacter', 'testNumber', 0, 5)

      getStore().setPartitionActivation('comboCharacter', 'testNumber', 1, 2)
      const cond = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional

      // At index 2: partition 1 should be true, partition 0 should be false (radio-style)
      expect(cond.partitions[0].activations[2]).toBe(false)
      expect(cond.partitions[1].activations[2]).toBe(true)
    })

    it('index 0 guard — does not modify default column', () => {
      seedStore()

      getStore().addPartition('comboCharacter', 'testNumber', 0, 5)
      getStore().setPartitionActivation('comboCharacter', 'testNumber', 1, 0)

      const cond = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional
      // Index 0 should be unchanged — partition 0 was true at index 0
      expect(cond.partitions[0].activations[0]).toBe(true)
    })
  })

  // ─── batchSetActivations ────────────────────────────────────

  describe('batchSetActivations', () => {
    it('applies multiple boolean updates in one set()', () => {
      seedStore()

      getStore().batchSetActivations([
        { sourceKey: 'comboCharacter', id: 'testBool', index: 1, value: true },
        { sourceKey: 'comboCharacter', id: 'testBool', index: 3, value: true },
      ])

      const cond = getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      expect(cond.activations[1]).toBe(true)
      expect(cond.activations[3]).toBe(true)
      expect(cond.activations[2]).toBe(false) // untouched
    })

    it('applies updates to two different BOOLEAN conditionals under same comboCharacter', () => {
      seedStore()

      getStore().batchSetActivations([
        { sourceKey: 'comboCharacter', id: 'testBool', index: 1, value: true },
        { sourceKey: 'comboCharacter', id: 'testBool2', index: 2, value: false },
      ])

      const boolCond = getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      const bool2Cond = getStore().comboCharacter!.characterConditionals.testBool2 as ComboBooleanConditional

      expect(boolCond.activations[1]).toBe(true)
      expect(bool2Cond.activations[2]).toBe(false)
    })

    it('handles partition update alongside boolean updates', () => {
      seedStore()

      getStore().addPartition('comboCharacter', 'testNumber', 0, 7)

      getStore().batchSetActivations(
        [
          { sourceKey: 'comboCharacter', id: 'testBool', index: 1, value: true },
        ],
        { sourceKey: 'comboCharacter', id: 'testNumber', partitionIndex: 1, index: 2 },
      )

      const boolCond = getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      expect(boolCond.activations[1]).toBe(true)

      const numCond = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional
      expect(numCond.partitions[0].activations[2]).toBe(false)
      expect(numCond.partitions[1].activations[2]).toBe(true)
    })

    it('respects index 0 guard for boolean updates', () => {
      seedStore()

      getStore().batchSetActivations([
        { sourceKey: 'comboCharacter', id: 'testBool', index: 0, value: true },
      ])

      const cond = getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      expect(cond.activations[0]).toBe(false) // unchanged
    })
  })

  // ─── setNumberDefault ───────────────────────────────────────

  describe('setNumberDefault', () => {
    it('changes a partition value', () => {
      seedStore()

      getStore().setNumberDefault('comboCharacter', 'testNumber', 0, 10)
      const cond = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional
      expect(cond.partitions[0].value).toBe(10)
    })
  })

  // ─── addPartition ──────────────────────────────────────────

  describe('addPartition', () => {
    it('adds a new partition with the provided newValue (not source value)', () => {
      seedStore()

      // Original partition has value 3
      getStore().addPartition('comboCharacter', 'testNumber', 0, 99)
      const cond = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional

      expect(cond.partitions.length).toBe(2)
      expect(cond.partitions[1].value).toBe(99) // uses newValue, NOT source partition's value (3)
      expect(cond.partitions[1].activations.every((v) => v === false)).toBe(true)
      // Activations array should match length of existing partition
      expect(cond.partitions[1].activations.length).toBe(cond.partitions[0].activations.length)
    })
  })

  // ─── deletePartition ───────────────────────────────────────

  describe('deletePartition', () => {
    it('removes partition and reassigns orphaned columns to partition 0', () => {
      seedStore()

      // Add partitions with value 5 and 7
      getStore().addPartition('comboCharacter', 'testNumber', 0, 5)
      getStore().addPartition('comboCharacter', 'testNumber', 0, 7)

      // Activate partition 1 at index 2, partition 2 at index 3
      getStore().setPartitionActivation('comboCharacter', 'testNumber', 1, 2)
      getStore().setPartitionActivation('comboCharacter', 'testNumber', 2, 3)

      // Delete partition 1 (value=5)
      getStore().deletePartition('comboCharacter', 'testNumber', 1)
      const cond = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional

      expect(cond.partitions.length).toBe(2) // original + one remaining added
      // Index 2 was exclusively assigned to deleted partition 1 => orphaned => reassigned to 0
      expect(cond.partitions[0].activations[2]).toBe(true)
    })

    it('cannot delete index 0', () => {
      seedStore()

      getStore().addPartition('comboCharacter', 'testNumber', 0, 5)
      getStore().deletePartition('comboCharacter', 'testNumber', 0)
      const cond = getStore().comboCharacter!.characterConditionals.testNumber as ComboNumberConditional

      expect(cond.partitions.length).toBe(2) // still 2, delete was no-op
    })
  })

  // ─── setBooleanDefault ─────────────────────────────────────

  describe('setBooleanDefault', () => {
    it('sets all activations to the given value', () => {
      seedStore()

      getStore().setBooleanDefault('comboCharacter', 'testBool', true)
      const cond = getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional

      expect(cond.activations.every((v) => v === true)).toBe(true)
    })

    it('sets all activations to false', () => {
      seedStore()

      // testBool2 starts all true
      getStore().setBooleanDefault('comboCharacter', 'testBool2', false)
      const cond = getStore().comboCharacter!.characterConditionals.testBool2 as ComboBooleanConditional

      expect(cond.activations.every((v) => v === false)).toBe(true)
    })
  })

  // ─── setAbilityRotation ────────────────────────────────────

  describe('setAbilityRotation', () => {
    it('new turn (append) resets activations to defaults', () => {
      seedStore()

      const prevLength = getStore().comboTurnAbilities.length
      getStore().setAbilityRotation(prevLength, DEFAULT_ULT)

      const state = getStore()
      expect(state.comboTurnAbilities.length).toBe(prevLength + 1)
      expect(state.comboTurnAbilities[prevLength]).toBe(DEFAULT_ULT)

      // New index should have default value (copied from index 0)
      const boolCond = state.comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      expect(boolCond.activations[prevLength]).toBe(boolCond.activations[0])
    })

    it('overwrite preserves per-turn activations', () => {
      seedStore()

      // Set a custom activation at index 1
      getStore().setActivation('comboCharacter', 'testBool', 1, true)
      expect((getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional).activations[1]).toBe(true)

      // Overwrite ability at index 1 (existing turn)
      getStore().setAbilityRotation(1, DEFAULT_ULT)

      // Activation at index 1 should still be true (preserved, not reset)
      const cond = getStore().comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      expect(cond.activations[1]).toBe(true)
      expect(getStore().comboTurnAbilities[1]).toBe(DEFAULT_ULT)
    })

    it('delete (NULL) shifts activations left', () => {
      seedStore()

      // Set up: testBool activations = [false, false, false, false, false]
      // Set index 2 to true
      getStore().setActivation('comboCharacter', 'testBool', 2, true)

      // Delete turn at index 1 (splice index 1, shift left from index 1)
      getStore().setAbilityRotation(1, NULL_TURN_ABILITY_NAME)

      const state = getStore()
      // Originally 3 turns, now 2
      expect(state.comboTurnAbilities.length).toBe(2)

      // Index 2's value (true) should have shifted to index 1
      const cond = state.comboCharacter!.characterConditionals.testBool as ComboBooleanConditional
      expect(cond.activations[1]).toBe(true)

      // Activation array should shrink by 1 after deletion (no trailing push)
      // Activations are pre-sized to ABILITY_LIMIT, so they're larger than comboTurnAbilities
      expect(cond.activations.length).toBe(4) // was 5, spliced 1, no push back to 5
    })

    it('delete respects minimum of 2 turns', () => {
      // Set up with exactly 2 turns
      useComboDrawerStore.setState({
        comboCharacter: makeCharacter(),
        comboTeammate0: null,
        comboTeammate1: null,
        comboTeammate2: null,
        comboTurnAbilities: [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC] as TurnAbilityName[],
        version: '1.1',
        initialized: true,
      })

      getStore().setAbilityRotation(1, NULL_TURN_ABILITY_NAME)
      // Should not delete — minimum 2 turns
      expect(getStore().comboTurnAbilities.length).toBe(2)
    })
  })

  // ─── updateSelectedSets ────────────────────────────────────

  describe('updateSelectedSets', () => {
    it('toggles display flag on set conditionals (ornaments)', () => {
      seedStore()

      getStore().updateSelectedSets(['someSet'], true)
      const character = getStore().comboCharacter!
      expect(character.displayedOrnamentSets).toEqual(['someSet'])
    })

    it('toggles display flag on set conditionals (relics)', () => {
      seedStore()

      getStore().updateSelectedSets(['someSet'], false)
      const character = getStore().comboCharacter!
      expect(character.displayedRelicSets).toEqual(['someSet'])
    })
  })

  // ─── getComboState ─────────────────────────────────────────

  describe('getComboState', () => {
    it('returns correct shape when initialized', () => {
      seedStore()

      const comboState = getStore().getComboState()
      expect(comboState).not.toBeNull()
      expect(comboState!.comboCharacter).toBeDefined()
      expect(comboState!.comboTeammate0).toBeDefined()
      expect(comboState!.comboTeammate1).toBeNull()
      expect(comboState!.comboTeammate2).toBeNull()
      expect(Array.isArray(comboState!.comboTurnAbilities)).toBe(true)
      expect(comboState!.version).toBe('1.1')
    })

    it('returns null when comboCharacter is null', () => {
      // Default state has null comboCharacter
      const comboState = getStore().getComboState()
      expect(comboState).toBeNull()
    })
  })

  // ─── locateConditional ─────────────────────────────────────

  describe('locateConditional', () => {
    it('finds character conditionals', () => {
      seedStore()
      const state = getStore()
      const result = locateConditional(state, 'comboCharacter', 'testBool')
      expect(result).not.toBeNull()
      expect(result!.type).toBe(ConditionalDataType.BOOLEAN)
    })

    it('finds character light cone conditionals', () => {
      seedStore()
      const state = getStore()
      const result = locateConditional(state, 'comboCharacterLightCone', 'lcBool')
      expect(result).not.toBeNull()
      expect(result!.type).toBe(ConditionalDataType.BOOLEAN)
    })

    it('finds character set conditionals via RelicSets', () => {
      seedStore()
      const state = getStore()
      const result = locateConditional(state, 'comboCharacterRelicSets', 'someSet')
      expect(result).not.toBeNull()
      expect(result!.type).toBe(ConditionalDataType.BOOLEAN)
    })

    it('finds teammate character conditionals', () => {
      seedStore()
      const state = getStore()
      const result = locateConditional(state, 'comboTeammate0', 'tmBool')
      expect(result).not.toBeNull()
      expect(result!.type).toBe(ConditionalDataType.BOOLEAN)
    })

    it('finds teammate relic set conditionals', () => {
      seedStore()
      const state = getStore()
      const result = locateConditional(state, 'comboTeammate0RelicSet', 'tmRelicSet')
      expect(result).not.toBeNull()
    })

    it('finds teammate ornament set conditionals', () => {
      seedStore()
      const state = getStore()
      const result = locateConditional(state, 'comboTeammate0OrnamentSet', 'tmOrnamentSet')
      expect(result).not.toBeNull()
    })

    it('returns null for missing conditional', () => {
      seedStore()
      const state = getStore()
      const result = locateConditional(state, 'comboCharacter', 'nonExistent')
      expect(result).toBeNull()
    })

    it('returns null when teammate is null', () => {
      seedStore()
      const state = getStore()
      const result = locateConditional(state, 'comboTeammate1', 'tmBool')
      expect(result).toBeNull()
    })
  })
})
