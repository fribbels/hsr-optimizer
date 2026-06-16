// @vitest-environment jsdom
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import { useAVVisualTabStore } from './useAVVisualTabStore'

// ---- Helpers ----

function state() {
  return useAVVisualTabStore.getState()
}

// ---- Reset ----

beforeEach(() => {
  useAVVisualTabStore.setState(useAVVisualTabStore.getInitialState())
})

// ---- Tests ----

describe('useAVVisualTabStore', () => {
  describe('initial state', () => {
    it('starts with 4 empty slots', () => {
      expect(state().savedSession.slots).toHaveLength(4)
      state().savedSession.slots.forEach((slot) => {
        expect(slot.characterId).toBeNull()
        expect(slot.spdOverride).toBeNull()
      })
    })

    it('starts with 3 rows', () => {
      expect(state().rowCount).toBe(3)
    })
  })

  describe('setSlotCharacter', () => {
    it('sets a character in the target slot', () => {
      state().setSlotCharacter(0, '1001')
      expect(state().savedSession.slots[0].characterId).toBe('1001')
    })

    it('does not affect other slots', () => {
      state().setSlotCharacter(1, '1002')
      expect(state().savedSession.slots[0].characterId).toBeNull()
      expect(state().savedSession.slots[2].characterId).toBeNull()
      expect(state().savedSession.slots[3].characterId).toBeNull()
    })

    it('clears the slot when passed null', () => {
      state().setSlotCharacter(0, '1001')
      state().setSlotCharacter(0, null)
      expect(state().savedSession.slots[0].characterId).toBeNull()
    })

    it('resets spdOverride when a new character is set', () => {
      state().setSlotCharacter(0, '1001')
      state().setSlotSpdOverride(0, 160)
      state().setSlotCharacter(0, '1002')
      expect(state().savedSession.slots[0].spdOverride).toBeNull()
    })

    it('allows all 4 slots to be filled independently', () => {
      state().setSlotCharacter(0, '1001')
      state().setSlotCharacter(1, '1002')
      state().setSlotCharacter(2, '1003')
      state().setSlotCharacter(3, '1004')
      expect(state().savedSession.slots.map((s) => s.characterId)).toEqual(['1001', '1002', '1003', '1004'])
    })
  })

  describe('setSlotSpdOverride', () => {
    it('sets the speed override for the target slot', () => {
      state().setSlotCharacter(0, '1001')
      state().setSlotSpdOverride(0, 161.5)
      expect(state().savedSession.slots[0].spdOverride).toBe(161.5)
    })

    it('does not affect other slots', () => {
      state().setSlotSpdOverride(2, 134)
      expect(state().savedSession.slots[0].spdOverride).toBeNull()
      expect(state().savedSession.slots[1].spdOverride).toBeNull()
      expect(state().savedSession.slots[3].spdOverride).toBeNull()
    })
  })

  describe('resetSlotSpdOverride', () => {
    it('clears the speed override', () => {
      state().setSlotSpdOverride(0, 160)
      state().resetSlotSpdOverride(0)
      expect(state().savedSession.slots[0].spdOverride).toBeNull()
    })

    it('does not affect other slots', () => {
      state().setSlotSpdOverride(0, 160)
      state().setSlotSpdOverride(1, 134)
      state().resetSlotSpdOverride(0)
      expect(state().savedSession.slots[1].spdOverride).toBe(134)
    })
  })

  describe('setSavedSession', () => {
    it('replaces slots wholesale (used by persistenceService to restore a save)', () => {
      const restored: [
        { characterId: string | null, spdOverride: number | null },
        { characterId: string | null, spdOverride: number | null },
        { characterId: string | null, spdOverride: number | null },
        { characterId: string | null, spdOverride: number | null },
      ] = [
        { characterId: '1001', spdOverride: null },
        { characterId: null, spdOverride: null },
        { characterId: '1003', spdOverride: 150 },
        { characterId: null, spdOverride: null },
      ]
      state().setSavedSession({ slots: restored })
      expect(state().savedSession.slots).toEqual(restored)
    })
  })

  describe('addRow', () => {
    it('increments rowCount by 1', () => {
      state().addRow()
      expect(state().rowCount).toBe(4)
    })

    it('can be called multiple times', () => {
      state().addRow()
      state().addRow()
      state().addRow()
      expect(state().rowCount).toBe(6)
    })
  })

  describe('interventions', () => {
    it('starts with no interventions', () => {
      expect(state().interventions).toEqual([])
    })

    it('addIntervention appends an intervention with a generated id', () => {
      state().addIntervention({
        triggerAv: 100,
        type: 'spd_up',
        targets: ['1001'],
        value: 20,
        unit: 'flat',
        durationTurns: 2,
      })
      expect(state().interventions).toHaveLength(1)
      expect(state().interventions[0].id).toBeTruthy()
      expect(state().interventions[0].triggerAv).toBe(100)
      expect(state().interventions[0].type).toBe('spd_up')
    })

    it('addIntervention generates unique ids for each intervention', () => {
      state().addIntervention({ triggerAv: 50, type: 'av_advance', targets: ['1001'], value: 25, unit: 'percent', durationTurns: 0 })
      state().addIntervention({ triggerAv: 50, type: 'av_advance', targets: ['1001'], value: 25, unit: 'percent', durationTurns: 0 })
      const ids = state().interventions.map((iv) => iv.id)
      expect(new Set(ids).size).toBe(2)
    })

    it('removeIntervention deletes the matching intervention', () => {
      state().addIntervention({ triggerAv: 100, type: 'spd_up', targets: [], value: 10, unit: 'flat', durationTurns: 1 })
      const id = state().interventions[0].id
      state().removeIntervention(id)
      expect(state().interventions).toHaveLength(0)
    })

    it('removeIntervention does not affect other interventions', () => {
      state().addIntervention({ triggerAv: 50, type: 'spd_up', targets: [], value: 10, unit: 'flat', durationTurns: 1 })
      state().addIntervention({ triggerAv: 100, type: 'spd_down', targets: [], value: 5, unit: 'flat', durationTurns: 1 })
      const idToRemove = state().interventions[0].id
      state().removeIntervention(idToRemove)
      expect(state().interventions).toHaveLength(1)
      expect(state().interventions[0].triggerAv).toBe(100)
    })

    it('updateIntervention patches only the specified fields', () => {
      state().addIntervention({ triggerAv: 100, type: 'spd_up', targets: ['1001'], value: 10, unit: 'flat', durationTurns: 2 })
      const id = state().interventions[0].id
      state().updateIntervention(id, { value: 20, durationTurns: 3 })
      expect(state().interventions[0].value).toBe(20)
      expect(state().interventions[0].durationTurns).toBe(3)
      expect(state().interventions[0].type).toBe('spd_up')
    })

    it('clearInterventions removes all interventions', () => {
      state().addIntervention({ triggerAv: 50, type: 'spd_up', targets: [], value: 10, unit: 'flat', durationTurns: 1 })
      state().addIntervention({ triggerAv: 100, type: 'spd_up', targets: [], value: 10, unit: 'flat', durationTurns: 1 })
      state().clearInterventions()
      expect(state().interventions).toEqual([])
    })
  })
})
