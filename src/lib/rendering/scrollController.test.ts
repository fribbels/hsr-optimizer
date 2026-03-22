// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

// scrollController's Zustand store is not exported. Tests for the reference-
// counted scroll lock (UTILITY-1) require imperative access to lock/unlock.
// As part of the UTILITY-1 fix, we'll export imperative helpers and write
// the full test suite. For now, document the expected behavior.

describe('scrollController', () => {
  it.todo('single lock/unlock cycle locks then unlocks scroll')
  it.todo('closing one of two overlays preserves scroll lock for the remaining one (UTILITY-1)')
  it.todo('double lock requires double unlock to fully release')
})
