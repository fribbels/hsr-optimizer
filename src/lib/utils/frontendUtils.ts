// --- Debounce (from debounceUtils.ts) ---

const timeoutCache: Record<string, NodeJS.Timeout | null> = {}

export function debounceEffect(id: string, ms: number, effect: (arg?: (...args: unknown[]) => unknown) => void) {
  const timeout = timeoutCache[id]
  if (timeout) {
    clearTimeout(timeout)
  }
  timeoutCache[id] = setTimeout(() => {
    effect()
  }, ms)
}

// --- Browser detection ---

export function isFirefox(): boolean {
  return /firefox/i.test(navigator.userAgent)
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
