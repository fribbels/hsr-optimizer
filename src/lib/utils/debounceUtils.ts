const timeoutCache: Record<string, NodeJS.Timeout | null> = {}

// Queues up an effect after a timeout, but deduplicate and refresh the timer if called again before triggered
export function debounceEffect(id: string, ms: number, effect: (arg?: (...args: unknown[]) => unknown) => void) {
  const timeout = timeoutCache[id]

  if (timeout) {
    clearTimeout(timeout)
  }

  timeoutCache[id] = setTimeout(() => {
    effect()
  }, ms)
}

