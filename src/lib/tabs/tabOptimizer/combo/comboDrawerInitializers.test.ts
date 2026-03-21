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
} from './comboDrawerTypes'
import { initializeComboState } from './comboDrawerInitializers'
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
 * Build a merge form with teammates populated.
 */
function buildMergeFormWithTeammates(
  mutateSaved?: (saved: ComboState, form: Form) => void,
  formOverrides?: Partial<Form>,
): Form {
  const form = buildAnaxaFormWithTeammates(formOverrides)
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
// A1: Regression Tests (SHOULD PASS NOW)
// ---------------------------------------------------------------------------

describe('A1: Regression — basic initializeComboState behaviour', () => {
  test('A1a: Valid form produces ComboState with non-null comboCharacter', () => {
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

  test('A1b: Form with teammates populates all teammate slots', () => {
    const form = buildAnaxaFormWithTeammates()
    const state = initializeComboState(form, false)

    expect(state.comboTeammate0).not.toBeNull()
    expect(state.comboTeammate1).not.toBeNull()
    expect(state.comboTeammate2).not.toBeNull()
    expect(state.comboTeammate0!.metadata.characterId).toBe(Cyrene.id)
    expect(state.comboTeammate1!.metadata.characterId).toBe(Cerydra.id)
    expect(state.comboTeammate2!.metadata.characterId).toBe(PermansorTerrae.id)
  })

  test('A1c: merge=true with empty comboStateJson does not crash', () => {
    const form = buildAnaxaForm({ comboStateJson: '{}' })
    expect(() => initializeComboState(form, true)).not.toThrow()
  })

  test('A1d: merge=true with valid saved JSON preserves BOOLEAN activations for indices 0..12', () => {
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

  test('A1e: merge=true with mismatched characterId produces fresh state (not merged)', () => {
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
// A2: BUG-03 — off-by-one in mergeConditionals NUMBER loops (< ABILITY_LIMIT vs <= ABILITY_LIMIT)
// ---------------------------------------------------------------------------

describe('A2: BUG-03 — index 12 handling in NUMBER conditional merge', () => {
  test('A2a: BUG-03: After merge with changed default value, activations[12] on old partition should be zeroed', () => {
    // Strategy: Build saved state where skillHits=4 (Anaxa default).
    // Then change form's skillHits to 3 so the merge sees a different base value.
    // The OLD partition for value=4 should have ALL non-0 indices zeroed,
    // but the zeroing loop uses `j < ABILITY_LIMIT` (1..11) so index 12 leaks.

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

    // The zeroing loop in mergeConditionals for the old active uses `i < ABILITY_LIMIT` (0..11),
    // so index 12 is NOT zeroed and leaks as true.
    // BUG-03: index 12 should be false but currently is true.
    expect(oldPartition!.activations[12]).toBe(false)
  })

  test('A2b: BUG-03: OR-merge of two saved partitions with same value should include index 12', () => {
    // Build saved state, then duplicate a partition with the same value so OR-merge fires.
    // Make the first partition have false at index 12, and the second have true at index 12.
    // The OR-merge should set index 12 to true, but the loop only goes to index 11.
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

    // BUG-03: OR-merge loop uses `j < ABILITY_LIMIT` (0..11), missing index 12.
    // First partition has false at 12, second has true at 12.
    // OR should yield true, but the loop never reaches index 12.
    expect(partition4!.activations[12]).toBe(true)
  })

  test('A2c: BUG-03: Activation inheritance — index 12 should be copied when default changes', () => {
    // Build saved state with skillHits=4, set a distinctive pattern where
    // index 12 is true and other indices are set up to be detectable after inheritance.
    // Then change form to value=3 so inheritance fires.
    // The OLD active partition (value=4) should be fully zeroed including index 12.
    const form = buildMergeForm((saved) => {
      const numCond = saved.comboCharacter.characterConditionals['skillHits'] as ComboNumberConditional
      // Set index 12 to true (all other indices are already true from Array.fill)
      numCond.partitions[0].activations[12] = true
    })

    // Change form to value=3 so inheritance fires (activeUpdateValue=4 -> activeBaseValue=3)
    form.characterConditionals['skillHits'] = 3

    const merged = initializeComboState(form, true)
    const numCond = getNumberConditional(merged, 'skillHits')

    // After inheritance, the old active partition (value=4) should be fully zeroed.
    // The zeroing loop uses `i < ABILITY_LIMIT` (0..11), skipping index 12.
    const oldPartition = numCond.partitions.find((p) => p.value === 4)
    expect(oldPartition).toBeDefined()

    // BUG-03: index 12 should be zeroed but isn't
    expect(oldPartition!.activations[12]).toBe(false)
  })

  test('A2d: Simple round-trip (no value change) — preserved including index 12', () => {
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

  test('A2e: BOOLEAN conditional 13-activation round-trip preserves all slots', () => {
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
// A3: BUG-09 — saved partition with all-false activations should survive merge
// ---------------------------------------------------------------------------

describe('A3: BUG-09 — all-false partition preservation', () => {
  test('A3a: BUG-09: Saved partition with all-false activations should survive merge', () => {
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

    // BUG-09: The merge code skips partitions where
    // `!partition.activations.some(a => a)` (all false). So partition for value=2 is dropped.
    const partition2 = numCond.partitions.find((p) => p.value === 2)
    expect(partition2).toBeDefined()
    expect(numCond.partitions.length).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// A4: BUG-22 — teammate merge with different characterId
// ---------------------------------------------------------------------------

describe('A4: BUG-22 — teammate characterId mismatch should not corrupt conditionals', () => {
  test('A4a: BUG-22: Saved JSON has teammate0 with different characterId — base teammate conditionals should be unchanged', () => {
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

    // BUG-22: mergeTeammate does NOT check characterId — it blindly merges conditionals
    // from the saved state even if the teammate has been swapped to a different character.
    // The sentinel boolean at index 1 should still be the BASE value, not the flipped saved value.
    const mergedCond = merged.comboTeammate0!.characterConditionals[sentinelKey] as ComboBooleanConditional
    expect(mergedCond.activations[1]).toBe(baseSentinelValue)
  })
})

// ---------------------------------------------------------------------------
// A7: BUG-13 — SELECT set conditional displayedRelicSets
// ---------------------------------------------------------------------------

describe('A7: BUG-13 — SELECT set conditional display filtering', () => {
  test('A7a: BUG-13: SELECT set conditional with non-default partition should NOT appear in displayedRelicSets when default partition matches', () => {
    // PioneerDiverOfDeadWaters is a SELECT-type relic set.
    // For Anaxa, the preset sets its value to 4.
    // We'll create saved state with two partitions: value=4 (default match) and value=1 (non-default).
    // The non-default partition needs at least one true activation to survive BUG-09.

    const form = buildMergeForm((saved) => {
      const pioneer = Sets.PioneerDiverOfDeadWaters
      const setCond = saved.comboCharacter.setConditionals[pioneer] as ComboSelectConditional

      // The initial state has one partition with the form's value (4 after preset).
      // Add a second partition with a non-default value and some true activations
      // so it survives the merge (avoids BUG-09 filtering).
      setCond.partitions.push({
        value: 1,
        activations: (() => {
          const a = Array(ACTION_COUNT).fill(false)
          a[3] = true // give it at least one true so it's not dropped
          return a
        })(),
      })
      // Ensure the first partition (default) has index 0 true
      setCond.partitions[0].activations[0] = true
      setCond.partitions[1].activations[0] = false
    })

    const merged = initializeComboState(form, true)

    // BUG-13: displayModifiedSets iterates ALL partitions and marks the set as
    // modified if ANY partition.value != defaultValue. Since partition[1].value=1
    // differs from the default value (4), the set incorrectly appears in displayedRelicSets.
    // It should NOT appear because only the default partition is "active" at index 0.
    expect(merged.comboCharacter.displayedRelicSets).not.toContain(Sets.PioneerDiverOfDeadWaters)
  })
})

// ---------------------------------------------------------------------------
// A8: BUG-06 — SELECT conditional reordering (shiftDefaultConditionalToFirst)
// ---------------------------------------------------------------------------

describe('A8: BUG-06 — SELECT conditional default partition reordering', () => {
  test('A8a: BUG-06: SELECT conditional with non-default first — after init, default should be at index 0', () => {
    // Build saved state, then reorder the Pioneer SELECT conditional so non-default is first.
    // Both partitions need true activations to survive BUG-09.
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
            a[3] = true // survive BUG-09
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

    // BUG-06: shiftDefaultConditionalToFirst only handles NUMBER type, not SELECT.
    // So the SELECT conditional won't be reordered, and the non-default partition stays first.
    // The partition at index 0 should be the one with activations[0]=true (the default).
    expect(setCond.partitions[0].activations[0]).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// A9: Additional Regression Tests (SHOULD PASS NOW)
// ---------------------------------------------------------------------------

describe('A9: Additional regression tests', () => {
  test('A9a: NUMBER conditional partitions reordered — default shifts to front', () => {
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
            a[3] = true // survive BUG-09
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

  test('A9b: BOOLEAN round-trip via merge preserves activations', () => {
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

  test('A9c: NUMBER round-trip via merge preserves partition values', () => {
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
