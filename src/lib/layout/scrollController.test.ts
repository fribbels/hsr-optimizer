// @vitest-environment jsdom
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  _getLockCount,
  _resetForTesting,
  scrollLock,
  scrollUnlock,
} from './scrollController'

// ---- Helpers ----

function bodyStyle() {
  return {
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
  }
}

// ---- Reset ----

beforeEach(() => {
  // Reset body styles
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''

  // Atomically reset both lockCount and Zustand store
  _resetForTesting()

  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true })
})

// ---- Tests ----

describe('scrollController', () => {
  describe('single lock/unlock cycle', () => {
    it('lock applies fixed positioning and unlock restores it', () => {
      scrollLock()

      expect(bodyStyle().position).toBe('fixed')
      expect(bodyStyle().top).toBe('-100px')
      expect(bodyStyle().width).toBe('100%')
      expect(_getLockCount()).toBe(1)

      scrollUnlock()

      expect(bodyStyle().position).toBe('')
      expect(bodyStyle().top).toBe('')
      expect(bodyStyle().width).toBe('')
      expect(_getLockCount()).toBe(0)
      expect(window.scrollTo).toHaveBeenCalledWith(0, 100)
    })
  })

  describe('reference-counted concurrent locks', () => {
    it('closing one of two overlays preserves scroll lock for the remaining one', () => {
      // Overlay A locks
      scrollLock()
      expect(bodyStyle().position).toBe('fixed')
      expect(_getLockCount()).toBe(1)

      // Overlay B locks (already locked, just increments count)
      scrollLock()
      expect(bodyStyle().position).toBe('fixed')
      expect(_getLockCount()).toBe(2)

      // Overlay B closes — lock count decrements but scroll stays locked
      scrollUnlock()
      expect(bodyStyle().position).toBe('fixed')
      expect(_getLockCount()).toBe(1)

      // Overlay A closes — lock count reaches 0, scroll unlocks
      scrollUnlock()
      expect(bodyStyle().position).toBe('')
      expect(_getLockCount()).toBe(0)
    })

    it('double lock requires double unlock to fully release', () => {
      scrollLock()
      scrollLock()
      expect(_getLockCount()).toBe(2)

      scrollUnlock()
      expect(_getLockCount()).toBe(1)
      expect(bodyStyle().position).toBe('fixed') // still locked

      scrollUnlock()
      expect(_getLockCount()).toBe(0)
      expect(bodyStyle().position).toBe('') // now unlocked
    })
  })

  describe('edge cases', () => {
    it('unlock without prior lock is a no-op', () => {
      scrollUnlock()
      expect(_getLockCount()).toBe(0)
      expect(bodyStyle().position).toBe('')
    })

    it('lock count never goes negative', () => {
      scrollUnlock()
      scrollUnlock()
      scrollUnlock()
      expect(_getLockCount()).toBe(0)
    })
  })
})
