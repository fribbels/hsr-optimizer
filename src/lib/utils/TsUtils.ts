import i18next, { DefaultNamespace, KeyPrefix, Namespace, TFunction } from 'i18next'
import stringify from 'json-stable-stringify'
import { Constants } from 'lib/constants/constants'
import { v4 as uuidv4 } from 'uuid'

export const TsUtils = {
  // Returns the same object
  clone<T>(obj: T): T {
    if (!obj) return obj
    return JSON.parse(JSON.stringify(obj)) as T
  },

  objectHash<T>(obj: T): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return stringify(obj)
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
    return Constants.MainStatsValues[mainStatType][grade].base
      + Constants.MainStatsValues[mainStatType][grade].increment * enhance
  },

  wrappedFixedT: (withContent: boolean) => {
    return {
      get: withContent
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ? i18next.getFixedT
        : getEmptyT,
    }
  },

  flipStringMapping: (obj: Record<string, string>): Record<string, string> => {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [value, key]),
    )
  },

  uuid: (): string => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return uuidv4()
  },

  uuidAlphaOnly: (): string => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return uuidv4().replace(/[^a-zA-Z0-9]/g, '')
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

  alignVerticalViewportToElement: (
    element: HTMLElement,
    position: 'top' | 'bottom',
    duration: number = 300,
    offset: number = 0
  ) => {
    const elementRect = element.getBoundingClientRect();
    const parent = document.documentElement || document.body;
    const viewportHeight = parent.clientHeight;
    const currentScroll = parent.scrollTop;

    // Calculate target scroll position based on desired position ('top' or 'bottom')
    const targetPosition =
      position === 'top'
        ? elementRect.top + currentScroll - offset
        : elementRect.bottom + currentScroll - viewportHeight + offset;

    // Check if the viewport is already at the target position
    if (Math.abs(currentScroll - targetPosition) < 1) { // Using a small threshold for floating-point imprecision
      return; // Element is already in view, no need to scroll
    }

    const startTime = performance.now();
    const startPosition = currentScroll;
    const distance = targetPosition - startPosition;

    // Smooth scroll animation
    function animation(currentTime: number) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Ease-in-out function for smooth scrolling
      const easeInOut =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      parent.scrollTo(0, startPosition + distance * easeInOut);

      if (elapsedTime < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  },
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
