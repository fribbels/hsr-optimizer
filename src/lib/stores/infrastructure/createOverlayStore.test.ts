// @vitest-environment jsdom
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import { createOverlayStore } from './createOverlayStore'

// ---- Types ----

type TestConfig = {
  itemId: string,
  label: string,
  onSave: (result: string) => void,
}

// ---- Helpers ----

function createTestStore() {
  return createOverlayStore<TestConfig>()
}

// ---- Tests ----

describe('createOverlayStore', () => {
  describe('factory behavior', () => {
    it('factory produces a store with open=false and config=null initially', () => {
      const store = createTestStore()
      const state = store.getState()
      expect(state.open).toBe(false)
      expect(state.config).toBeNull()
    })

    it('each call to createOverlayStore creates an independent store', () => {
      const storeA = createTestStore()
      const storeB = createTestStore()

      storeA.getState().openOverlay({ itemId: '1', label: 'A', onSave: () => {} })

      expect(storeA.getState().open).toBe(true)
      expect(storeB.getState().open).toBe(false)
    })
  })

  describe('open and close lifecycle', () => {
    let store: ReturnType<typeof createTestStore>
    const onSave = () => {}

    beforeEach(() => {
      store = createTestStore()
    })

    it('openOverlay sets open=true and config to the provided value', () => {
      store.getState().openOverlay({ itemId: 'r1', label: 'Test', onSave })

      expect(store.getState().open).toBe(true)
      expect(store.getState().config).toEqual({ itemId: 'r1', label: 'Test', onSave })
    })

    it('closeOverlay sets open=false but retains config for close animation', () => {
      store.getState().openOverlay({ itemId: 'r1', label: 'Test', onSave })
      store.getState().closeOverlay()

      expect(store.getState().open).toBe(false)
      expect(store.getState().config).toEqual({ itemId: 'r1', label: 'Test', onSave })
    })

    it('openOverlay overwrites previous config on reopen', () => {
      store.getState().openOverlay({ itemId: 'r1', label: 'First', onSave })
      store.getState().closeOverlay()
      store.getState().openOverlay({ itemId: 'r2', label: 'Second', onSave })

      expect(store.getState().config?.itemId).toBe('r2')
      expect(store.getState().config?.label).toBe('Second')
    })
  })

  describe('updateConfig', () => {
    let store: ReturnType<typeof createTestStore>
    const onSave = () => {}

    beforeEach(() => {
      store = createTestStore()
    })

    it('updateConfig merges partial fields into existing config', () => {
      store.getState().openOverlay({ itemId: 'r1', label: 'Original', onSave })
      store.getState().updateConfig({ label: 'Updated' })

      expect(store.getState().config?.itemId).toBe('r1')
      expect(store.getState().config?.label).toBe('Updated')
      expect(store.getState().config?.onSave).toBe(onSave)
    })

    it('updateConfig is a no-op when config is null', () => {
      store.getState().updateConfig({ label: 'Nope' })

      expect(store.getState().config).toBeNull()
    })

    it('rapid open/close/open does not lose config', () => {
      store.getState().openOverlay({ itemId: 'r1', label: 'First', onSave })
      store.getState().closeOverlay()
      store.getState().openOverlay({ itemId: 'r2', label: 'Second', onSave })

      expect(store.getState().open).toBe(true)
      expect(store.getState().config?.itemId).toBe('r2')
    })
  })
})
