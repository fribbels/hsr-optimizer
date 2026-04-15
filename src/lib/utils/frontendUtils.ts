import type {
  DependencyList,
  SyntheticEvent,
} from 'react'
import { useEffect } from 'react'

// --- Debounce (from debounceUtils.ts) ---

const timeoutCache: Record<string, ReturnType<typeof setTimeout> | null> = {}

export function debounceEffect(id: string, ms: number, effect: (arg?: (...args: unknown[]) => unknown) => void) {
  const timeout = timeoutCache[id]
  if (timeout) {
    clearTimeout(timeout)
  }
  timeoutCache[id] = setTimeout(() => {
    effect()
  }, ms)
}

// --- Scrolling ---

/** Smooth-scroll the page so `element` is visible (nearest edge). */
export function smoothScrollNearest(element: HTMLElement, duration: number = 300): void {
  const elementRect = element.getBoundingClientRect()
  const parent = document.documentElement || document.body

  const currentScroll = parent.scrollTop
  const elementTop = elementRect.top + currentScroll
  const elementBottom = elementRect.bottom + currentScroll
  const parentHeight = parent.clientHeight

  let targetPosition: number

  if (elementRect.top < 0) {
    targetPosition = elementTop
  } else if (elementRect.bottom > parentHeight) {
    targetPosition = elementBottom - parentHeight + 5
  } else {
    return
  }

  const startTime = performance.now()
  const startPosition = currentScroll
  const distance = targetPosition - startPosition

  function animation(currentTime: number) {
    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)
    const easeInOut = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    parent.scrollTo(0, startPosition + distance * easeInOut)
    if (elapsedTime < duration) {
      requestAnimationFrame(animation)
    }
  }

  requestAnimationFrame(animation)
}

// --- Timing ---

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// --- Paint scheduling ---

/**
 * Schedules a callback to run after the browser's next paint.
 * Uses double requestAnimationFrame: the first fires before paint,
 * the second fires in the next frame — after the paint completes.
 */
export function afterPaint(callback: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(callback))
}

// --- Images ---

export function showImageOnLoad(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.opacity = '1'
}

// --- Events ---

let idCounter = 0
export class EventEmitter<T> {
  private subscribers: Map<string, (value: T) => void> = new Map()

  public subscribe(listener: (value: T) => void) {
    const key = `sub-${idCounter++}`
    this.subscribers.set(key, listener)
    return () => void this.subscribers.delete(key)
  }

  public send(value: T) {
    this.subscribers.forEach((listener) => listener(value))
  }

  public use(listener: (value: T) => void, deps: DependencyList) {
    return useEffect(() => {
      return this.subscribe(listener)
    }, deps)
  }
}
