// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'
import { ABILITY_LIMIT, ConditionalDataType, Sets } from 'lib/constants/constants'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { normalizeForm } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { Cyrene } from 'lib/conditionals/character/1400/Cyrene'
import { Cerydra } from 'lib/conditionals/character/1400/Cerydra'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { ThisLoveForever } from 'lib/conditionals/lightcone/5star/ThisLoveForever'
import { EpochEtchedInGoldenBlood } from 'lib/conditionals/lightcone/5star/EpochEtchedInGoldenBlood'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  type ComboBooleanConditional,
  type ComboNumberConditional,
  type ComboSelectConditional,
  type ComboState,
  COMBO_STATE_JSON_VERSION,
} from 'lib/optimization/combo/comboTypes'
import { initializeComboState } from 'lib/optimization/combo/comboInitializers'
import type { Form, Teammate } from 'types/form'
import type { CharacterId } from 'types/character'

// ---------------------------------------------------------------------------
// Global setup — exactly once, matching the existing test pattern
// ---------------------------------------------------------------------------

Metadata.initialize()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTION_COUNT = ABILITY_LIMIT + 1 // 13 (indices 0..12)

/** Build a normalised Anaxa form ready for initializeComboState */
function buildAnaxaForm(overrides?: Partial<Form>): Form {
  const form = getDefaultForm({ id: Anaxa.id })
  Object.assign(form, overrides)
  return normalizeForm(form)
}

/** Build an Anaxa form with teammates populated from scoring metadata */
function buildAnaxaFormWithTeammates(overrides?: Partial<Form>): Form {
  const form = getDefaultForm({ id: Anaxa.id })
  // Manually populate teammates from Anaxa's scoring simulation metadata
  form.teammate0 = {
    characterId: Cyrene.id as CharacterId,
    characterEidolon: 0,
    lightCone: ThisLoveForever.id,
    lightConeSuperimposition: 1,
  } as Teammate
  form.teammate1 = {
    characterId: Cerydra.id as CharacterId,
    characterEidolon: 0,
    lightCone: EpochEtchedInGoldenBlood.id,
    lightConeSuperimposition: 1,
  } as Teammate
  form.teammate2 = {
    characterId: PermansorTerrae.id as CharacterId,
    characterEidolon: 0,
    lightCone: ThoughWorldsApart.id,
    lightConeSuperimposition: 1,
  } as Teammate
  Object.assign(form, overrides)
  return normalizeForm(form)
}

/**
 * Create a fresh ComboState, optionally mutate it, then embed it as the
 * saved JSON in a new form suitable for a merge call.
 */
function buildMergeForm(
  mutateSaved?: (saved: ComboState, form: Form) => void,
  formOverrides?: Partial<Form>,
): Form {
  const form = buildAnaxaForm(formOverrides)
  // Generate a fresh state to use as "saved"
  const saved = initializeComboState(form, false)
  saved.version = COMBO_STATE_JSON_VERSION
  if (mutateSaved) mutateSaved(saved, form)
  form.comboStateJson = JSON.stringify(saved)
  return form
}

/**
 * Shortcut: get a NUMBER conditional from comboCharacter.characterConditionals.
 */
function getNumberConditional(state: ComboState, key: string): ComboNumberConditional {
  return state.comboCharacter.characterConditionals[key] as ComboNumberConditional
}

/**
 * Shortcut: get a BOOLEAN conditional from comboCharacter.characterConditionals.
 */
function getBooleanConditional(state: ComboState, key: string): ComboBooleanConditional {
  return state.comboCharacter.characterConditionals[key] as ComboBooleanConditional
}

/**
 * Shortcut: get a SELECT conditional from comboCharacter.setConditionals.
 */
function getSelectSetConditional(state: ComboState, key: string): ComboSelectConditional {
  return state.comboCharacter.setConditionals[key] as ComboSelectConditional
}

// ---------------------------------------------------------------------------
// Basic initializeComboState behaviour
// ---------------------------------------------------------------------------

describe('Regression — basic initializeComboState behaviour', () => {
  test('valid form produces ComboState with non-null comboCharacter', () => {
    const form = buildAnaxaForm()
    const state = initializeComboState(form, false)

    expect(state.comboCharacter).toBeDefined()
    expect(state.comboCharacter.metadata.characterId).toBe(Anaxa.id)
    expect(state.comboCharacter.characterConditionals).toBeDefined()
    expect(state.comboCharacter.lightConeConditionals).toBeDefined()
    expect(state.comboCharacter.setConditionals).toBeDefined()
    expect(state.comboTurnAbilities).toBeDefined()
    expect(state.comboTurnAbilities.length).toBeGreaterThan(0)
  })

  test('form with teammates populates all teammate slots', () => {
    const form = buildAnaxaFormWithTeammates()
    const state = initializeComboState(form, false)

    expect(state.comboTeammate0).not.toBeNull()
    expect(state.comboTeammate1).not.toBeNull()
    expect(state.comboTeammate2).not.toBeNull()
    expect(state.comboTeammate0!.metadata.characterId).toBe(Cyrene.id)
    expect(state.comboTeammate1!.metadata.characterId).toBe(Cerydra.id)
    expect(state.comboTeammate2!.metadata.characterId).toBe(PermansorTerrae.id)
  })

  test('merge=true with empty comboStateJson does not crash', () => {
    const form = buildAnaxaForm({ comboStateJson: '{}' })
    expect(() => initializeComboState(form, true)).not.toThrow()
  })

  test('merge=true with valid saved JSON preserves BOOLEAN activations for indices 0..12', () => {
    // Build saved state, flip some boolean activations
    const form = buildMergeForm((saved) => {
      const boolCond = saved.comboCharacter.characterConditionals['exposedNature'] as ComboBooleanConditional
      // Set a distinctive pattern: alternate true/false
      for (let i = 0; i < ACTION_COUNT; i++) {
        boolCond.activations[i] = i % 2 === 0
      }
    })

    const merged = initializeComboState(form, true)
    const boolCond = getBooleanConditional(merged, 'exposedNature')

    // Index 0 is always overwritten to match the base (form value), so skip it.
    // Indices 1..12 should be preserved from saved state.
    for (let i = 1; i < ACTION_COUNT; i++) {
      expect(boolCond.activations[i]).toBe(i % 2 === 0)
    }
  })

  test('merge=true with mismatched characterId produces fresh state (not merged)', () => {
    const form = buildAnaxaForm()
    // Create saved state, then change its characterId so it won't match
    const saved = initializeComboState(form, false)
    saved.version = COMBO_STATE_JSON_VERSION
    // Flip a boolean to detect whether merge happened
    const boolCond = saved.comboCharacter.characterConditionals['exposedNature'] as ComboBooleanConditional
    for (let i = 0; i < ACTION_COUNT; i++) {
      boolCond.activations[i] = false
    }
    // Change the saved characterId so it mismatches
    saved.comboCharacter.metadata.characterId = '9999' as CharacterId
    form.comboStateJson = JSON.stringify(saved)

    const merged = initializeComboState(form, true)
    const result = getBooleanConditional(merged, 'exposedNature')

    // Since merge is skipped (characterId mismatch), the base value should be the form's default
    // (exposedNature defaults to true for Anaxa), NOT the all-false we set
    expect(result.activations[0]).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Index 12 (ABILITY_LIMIT boundary) handling in NUMBER conditional merge
// ---------------------------------------------------------------------------

describe('index 12 handling in NUMBER conditional merge', () => {
  test('after merge with changed default value, activations[12] on old partition should be zeroed', () => {
    // Build saved state where skillHits=4 (Anaxa default), then change form's
    // skillHits to 3 so the merge sees a different base value. The old partition
    // for value=4 should have all non-0 indices zeroed including index 12.

    const form = buildMergeForm(
      (saved) => {
        // saved has skillHits=4 as the only partition with all-true activations
        // We don't need to modify saved — just change the form's value below
      },
    )
    // Change the form's characterConditionals to a different slider value
    form.characterConditionals['skillHits'] = 3

    const merged = initializeComboState(form, true)
    const numCond = getNumberConditional(merged, 'skillHits')

    // Find the partition for value=4 (old active, should be zeroed except index 0)
    const oldPartition = numCond.partitions.find((p) => p.value === 4)
    expect(oldPartition).toBeDefined()

    expect(oldPartition!.activations[12]).toBe(false)
  })

  test('OR-merge of two saved partitions with same value should include index 12', () => {
    // Build saved state, then duplicate a partition with the same value so OR-merge fires.
    // Make the first partition have false at index 12, and the second have true at index 12.
    // The OR-merge should produce true at index 12.
    const form = buildMergeForm((saved) => {
      const numCond = saved.comboCharacter.characterConditionals['skillHits'] as ComboNumberConditional
      // Modify first partition: value=4, set index 12 to false
      numCond.partitions[0].activations[12] = false

      // Add a second partition with value=4, only index 12 is true
      const secondPartition = {
        value: 4,
        activations: Array(ACTION_COUNT).fill(false),
      }
      secondPartition.activations[12] = true
      numCond.partitions.push(secondPartition)
    })

    const merged = initializeComboState(form, true)
    const numCond = getNumberConditional(merged, 'skillHits')

    // There should be one partition for value=4 (merged)
    const partition4 = numCond.partitions.find((p) => p.value === 4)
    expect(partition4).toBeDefined()

    expect(partition4!.activations[12]).toBe(true)
  })

  test('activation inheritance — index 12 should be zeroed when default changes', () => {
    // Build saved state with skillHits=4, then change form to value=3 so
    // inheritance fires. The old active partition (value=4) should be fully
    // zeroed including index 12.
    const form = buildMergeForm((saved) => {
      const numCond = saved.comboCharacter.characterConditionals['skillHits'] as ComboNumberConditional
      // Set index 12 to true (all other indices are already true from Array.fill)
      numCond.partitions[0].activations[12] = true
    })

    // Change form to value=3 so inheritance fires (activeUpdateValue=4 -> activeBaseValue=3)
    form.characterConditionals['skillHits'] = 3

    const merged = initializeComboState(form, true)
    const numCond = getNumberConditional(merged, 'skillHits')

    const oldPartition = numCond.partitions.find((p) => p.value === 4)
    expect(oldPartition).toBeDefined()
    expect(oldPartition!.activations[12]).toBe(false)
  })

  test('simple round-trip (no value change) — preserved including index 12', () => {
    // Build saved state, set a distinctive pattern including index 12
    const form = buildMergeForm((saved) => {
      const numCond = saved.comboCharacter.characterConditionals['skillHits'] as ComboNumberConditional
      // Set a pattern: even indices true, odd false
      for (let i = 0; i < ACTION_COUNT; i++) {
        numCond.partitions[0].activations[i] = i % 2 === 0
      }
    })
    // Don't change skillHits — same default

    const merged = initializeComboState(form, true)
    const numCond = getNumberConditional(merged, 'skillHits')

    const partition = numCond.partitions.find((p) => p.value === 4)
    expect(partition).toBeDefined()

    // Index 0 is forced to true (base's default). Indices 1..12 should follow the pattern.
    // Since no value change, activations should survive the round-trip.
    expect(partition!.activations[0]).toBe(true) // forced by base
    for (let i = 1; i < ACTION_COUNT; i++) {
      expect(partition!.activations[i]).toBe(i % 2 === 0)
    }
  })

  test('BOOLEAN conditional 13-activation round-trip preserves all slots', () => {
    const form = buildMergeForm((saved) => {
      const boolCond = saved.comboCharacter.characterConditionals['exposedNature'] as ComboBooleanConditional
      // Set a distinctive pattern for all 13 slots
      for (let i = 0; i < ACTION_COUNT; i++) {
        boolCond.activations[i] = i % 3 === 0
      }
    })

    const merged = initializeComboState(form, true)
    const boolCond = getBooleanConditional(merged, 'exposedNature')

    // Index 0 is overwritten to base form value; skip it.
    // Indices 1..12 should be preserved.
    for (let i = 1; i < ACTION_COUNT; i++) {
      expect(boolCond.activations[i]).toBe(i % 3 === 0)
    }
  })
})

// ---------------------------------------------------------------------------
// All-false partition preservation
// ---------------------------------------------------------------------------

describe('all-false partition preservation', () => {
  test('saved partition with all-false activations should survive merge', () => {
    // Build saved state with NUMBER conditional having 2 partitions:
    //   partition[0]: value=4, activations all true (active)
    //   partition[1]: value=2, activations all false (inactive but intentional)
    const form = buildMergeForm((saved) => {
      const numCond = saved.comboCharacter.characterConditionals['skillHits'] as ComboNumberConditional
      numCond.partitions.push({
        value: 2,
        activations: Array(ACTION_COUNT).fill(false),
      })
    })

    const merged = initializeComboState(form, true)
    const numCond = getNumberConditional(merged, 'skillHits')

    const partition2 = numCond.partitions.find((p) => p.value === 2)
    expect(partition2).toBeDefined()
    expect(numCond.partitions.length).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// Teammate characterId mismatch handling
// ---------------------------------------------------------------------------

describe('teammate characterId mismatch should not corrupt conditionals', () => {
  test('saved JSON has teammate0 with different characterId — base teammate conditionals should be unchanged', () => {
    // Build a form with real teammates
    const form = buildAnaxaFormWithTeammates()
    const freshState = initializeComboState(form, false)
    freshState.version = COMBO_STATE_JSON_VERSION

    // Record what the base teammate0's boolean conditionals look like
    const baseState = initializeComboState(form, false)
    const baseTeammate0Conditionals = baseState.comboTeammate0!.characterConditionals

    // Find a boolean conditional in teammate0 to use as sentinel
    let sentinelKey: string | null = null
    for (const [key, cond] of Object.entries(baseTeammate0Conditionals)) {
      if (cond.type === ConditionalDataType.BOOLEAN) {
        sentinelKey = key
        break
      }
    }

    // Guard: Cyrene must have at least one BOOLEAN conditional
    expect(sentinelKey).toBeTruthy()
    if (!sentinelKey) throw new Error('unreachable') // TS narrowing

    const baseSentinelValue = (baseTeammate0Conditionals[sentinelKey] as ComboBooleanConditional).activations[1]

    // Modify the saved state's teammate0:
    // 1. Change its characterId to something different
    // 2. Flip all its boolean activations to the opposite of the base
    freshState.comboTeammate0!.metadata.characterId = '9999' as CharacterId
    for (const [, cond] of Object.entries(freshState.comboTeammate0!.characterConditionals)) {
      if (cond.type === ConditionalDataType.BOOLEAN) {
        const boolCond = cond as ComboBooleanConditional
        for (let i = 0; i < boolCond.activations.length; i++) {
          boolCond.activations[i] = !baseSentinelValue
        }
      }
    }

    form.comboStateJson = JSON.stringify(freshState)

    const merged = initializeComboState(form, true)

    // mergeTeammate checks characterId — mismatched teammates should not have their conditionals merged
    const mergedCond = merged.comboTeammate0!.characterConditionals[sentinelKey] as ComboBooleanConditional
    expect(mergedCond.activations[1]).toBe(baseSentinelValue)
  })
})

// ---------------------------------------------------------------------------
// SELECT set conditional display filtering
// ---------------------------------------------------------------------------

describe('SELECT set conditional display filtering', () => {
  test('SELECT set conditional with non-default partition should NOT appear in displayedRelicSets when default partition matches', () => {
    // PioneerDiverOfDeadWaters is a SELECT-type relic set.
    // For Anaxa, the preset sets its value to 4.
    // Create saved state with two partitions: value=4 (default match) and value=1 (non-default).

    const form = buildMergeForm((saved) => {
      const pioneer = Sets.PioneerDiverOfDeadWaters
      const setCond = saved.comboCharacter.setConditionals[pioneer] as ComboSelectConditional

      // The initial state has one partition with the form's value (4 after preset).
      // Add a second partition with a non-default value and some true activations.
      setCond.partitions.push({
        value: 1,
        activations: (() => {
          const a = Array(ACTION_COUNT).fill(false)
          a[3] = true
          return a
        })(),
      })
      // Ensure the first partition (default) has index 0 true
      setCond.partitions[0].activations[0] = true
      setCond.partitions[1].activations[0] = false
    })

    const merged = initializeComboState(form, true)

    // displayModifiedSets only checks partitions[0].value against the default,
    // so a non-default partition at a later index should not mark the set as modified.
    expect(merged.comboCharacter.displayedRelicSets).not.toContain(Sets.PioneerDiverOfDeadWaters)
  })
})

// ---------------------------------------------------------------------------
// SELECT conditional default partition reordering
// ---------------------------------------------------------------------------

describe('SELECT conditional default partition reordering', () => {
  test('SELECT conditional with non-default first — after init, default should be at index 0', () => {
    // Build saved state, then reorder the Pioneer SELECT conditional so non-default is first.
    const form = buildMergeForm((saved) => {
      const pioneer = Sets.PioneerDiverOfDeadWaters
      const setCond = saved.comboCharacter.setConditionals[pioneer] as ComboSelectConditional

      // Get the form's default value for Pioneer (4 for Anaxa after preset)
      const defaultValue = setCond.partitions[0].value

      // Create two partitions: first is non-default (value=1), second is default
      // Both need some true activations to survive merge filtering.
      setCond.partitions = [
        {
          value: 1,
          activations: (() => {
            const a = Array(ACTION_COUNT).fill(false)
            a[0] = false
            a[3] = true
            a[4] = true
            return a
          })(),
        },
        {
          value: defaultValue,
          activations: (() => {
            const a = Array(ACTION_COUNT).fill(false)
            a[0] = true // this is the default partition
            a[1] = true
            a[2] = true
            return a
          })(),
        },
      ]
    })

    const merged = initializeComboState(form, true)
    const pioneer = Sets.PioneerDiverOfDeadWaters
    const setCond = getSelectSetConditional(merged, pioneer)

    // shiftDefaultConditionalToFirst should reorder so the default partition is at index 0
    expect(setCond.partitions[0].activations[0]).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Additional regression tests
// ---------------------------------------------------------------------------

describe('additional regression tests', () => {
  test('NUMBER conditional partitions reordered — default shifts to front', () => {
    // Build saved state with NUMBER conditional where the default partition is NOT first
    const form = buildMergeForm((saved) => {
      const numCond = saved.comboCharacter.characterConditionals['skillHits'] as ComboNumberConditional
      const defaultValue = numCond.partitions[0].value

      // Add a second partition and swap order so default is second
      // Both need true activations to survive merge.
      numCond.partitions = [
        {
          value: defaultValue + 1,
          activations: (() => {
            const a = Array(ACTION_COUNT).fill(false)
            a[0] = false
            a[3] = true
            return a
          })(),
        },
        {
          value: defaultValue,
          activations: (() => {
            const a = Array(ACTION_COUNT).fill(false)
            a[0] = true
            a[1] = true
            return a
          })(),
        },
      ]
    })

    const merged = initializeComboState(form, true)
    const numCond = getNumberConditional(merged, 'skillHits')

    // shiftDefaultConditionalToFirst handles NUMBER: the partition with activations[0]=true
    // should be moved to position 0
    expect(numCond.partitions[0].activations[0]).toBe(true)
  })

  test('BOOLEAN round-trip via merge preserves activations', () => {
    const pattern = [true, false, true, true, false, false, true, false, true, false, true, true, false]
    expect(pattern.length).toBe(ACTION_COUNT) // sanity check

    const form = buildMergeForm((saved) => {
      const boolCond = saved.comboCharacter.characterConditionals['exposedNature'] as ComboBooleanConditional
      for (let i = 0; i < ACTION_COUNT; i++) {
        boolCond.activations[i] = pattern[i]
      }
    })

    const merged = initializeComboState(form, true)
    const boolCond = getBooleanConditional(merged, 'exposedNature')

    // Index 0 is overwritten by base, so skip it
    for (let i = 1; i < ACTION_COUNT; i++) {
      expect(boolCond.activations[i]).toBe(pattern[i])
    }
  })

  test('NUMBER round-trip via merge preserves partition values', () => {
    const form = buildMergeForm((saved) => {
      const numCond = saved.comboCharacter.characterConditionals['enemyWeaknessTypes'] as ComboNumberConditional
      // Default value is 7 for Anaxa.
      // Add a second partition with value=3 and some true activations
      numCond.partitions.push({
        value: 3,
        activations: (() => {
          const a = Array(ACTION_COUNT).fill(false)
          a[5] = true
          a[6] = true
          return a
        })(),
      })
    })

    const merged = initializeComboState(form, true)
    const numCond = getNumberConditional(merged, 'enemyWeaknessTypes')

    // Both partitions should survive the merge
    const partition7 = numCond.partitions.find((p) => p.value === 7)
    const partition3 = numCond.partitions.find((p) => p.value === 3)
    expect(partition7).toBeDefined()
    expect(partition3).toBeDefined()

    // Value=3 partition should preserve its activation pattern
    expect(partition3!.activations[5]).toBe(true)
    expect(partition3!.activations[6]).toBe(true)
  })
})
