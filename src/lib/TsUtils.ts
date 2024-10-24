import { Constants, MainStats } from './constants'
import stringify from 'json-stable-stringify'
import i18next, { DefaultNamespace, KeyPrefix, Namespace, TFunction } from 'i18next'
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
    mainStatType: MainStats,
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

  stripTrailingSlashes: (str: string) => {
    return str.replace(/\/+$/, '')
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
