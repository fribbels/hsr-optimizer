import i18next, {
  DefaultNamespace,
  KeyPrefix,
  Namespace,
  TFunction,
} from 'i18next'
import { Constants } from 'lib/constants/constants'

/**
 * Recursively sorts object keys and returns a new object.
 * Arrays are preserved as-is (elements processed recursively).
 * Primitives pass through unchanged.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortKeys(val: any): any {
  if (val === null || typeof val !== 'object') return val
  if (Array.isArray(val)) return val.map(sortKeys)
  const keys = Object.keys(val)
  keys.sort()
  const sorted: Record<string, unknown> = Object.create(null)
  for (let i = 0; i < keys.length; i++) {
    sorted[keys[i]] = sortKeys(val[keys[i]])
  }
  return sorted
}

export const TsUtils = {
  // Returns the same object
  clone<T>(obj: T): T {
    if (!obj) return obj
    return JSON.parse(JSON.stringify(obj)) as T
  },

  objectHash<T>(obj: T): string {
    return JSON.stringify(sortKeys(obj))
  },

  /**
   * Compares two semver version strings (e.g. 'v4.0.4', 'v4.0.5').
   * Returns true if `current` is older than `latest`.
   */
  isVersionOutdated(current: string, latest: string): boolean {
    const pa = current.replace(/^v/, '').split('.').map(Number)
    const pb = latest.replace(/^v/, '').split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if ((pa[i] || 0) < (pb[i] || 0)) return true
      if ((pa[i] || 0) > (pb[i] || 0)) return false
    }
    return false
  },

  // [1, 2, 3] => 6
  sumArray: (arr: number[]): number => {
    return arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  },

  // Rounds the number to the specified precision
  precisionRound: (number: number, precision: number = 5): number => {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  },

  calculateRelicMainStatValue: (
    mainStatType: string,
    grade: number,
    enhance: number,
  ): number => {
    return TsUtils.precisionRound(
      Constants.MainStatsValues[mainStatType][grade].base + Constants.MainStatsValues[mainStatType][grade].increment * enhance,
    )
  },

  wrappedFixedT: (withContent: boolean) => {
    return {
      get: withContent
        ? i18next.getFixedT
        : getEmptyT,
    }
  },

  flipStringMapping: (obj: Record<string, string>): Record<string, string> => {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [value, key]),
    )
  },

  nullUndefinedToZero: (x: number | null) => {
    if (x == null) return 0
    return x
  },

  uuid: (): string => {
    return crypto.randomUUID()
  },

  stripTrailingSlashes: (str: string) => {
    return str.replace(/\/+$/, '')
  },

  // await sleep(ms) to block
  sleep: (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  consoleWarnWrapper: (err: unknown) => {
    if (err instanceof Error) {
      console.warn(err.name, err.message)
    } else {
      console.warn('An unknown error occurred', err)
    }
  },

  validateUuid: (uuid: string) => {
    const trimmedUuid = uuid.trim()
    return /^\d{9}$/.test(trimmedUuid) ? trimmedUuid : null
  },

  smoothScrollNearest: (element: HTMLElement, duration: number = 300) => {
    const elementRect = element.getBoundingClientRect()
    const parent = document.documentElement || document.body

    // Calculate target scroll position
    const currentScroll = parent.scrollTop
    const elementTop = elementRect.top + currentScroll
    const elementBottom = elementRect.bottom + currentScroll
    const parentHeight = parent.clientHeight

    let targetPosition: number

    // Implement 'nearest' logic
    if (elementRect.top < 0) {
      // Element is above the view
      targetPosition = elementTop
    } else if (elementRect.bottom > parentHeight) {
      // Element is below the view
      targetPosition = elementBottom - parentHeight + 5
    } else {
      // Element is already in view
      return
    }

    const startTime = performance.now()
    const startPosition = currentScroll
    const distance = targetPosition - startPosition

    // Smooth scroll animation
    function animation(currentTime: number) {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)

      // Ease-in-out function
      const easeInOut = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      parent.scrollTo(0, startPosition + distance * easeInOut)

      if (elapsedTime < duration) {
        requestAnimationFrame(animation)
      }
    }

    requestAnimationFrame(animation)
  },
}

export function isFirefox(): boolean {
  return /firefox/i.test(navigator.userAgent)
}

const getEmptyT = <
  Ns extends Namespace | null = DefaultNamespace,
  TKPrefix extends KeyPrefix<ActualNs> = undefined,
  ActualNs extends Namespace = Ns extends null ? DefaultNamespace : Ns,
>(): TFunction<ActualNs, TKPrefix> => {
  return (() => {
    return ''
  }) as TFunction<ActualNs, TKPrefix>
}
