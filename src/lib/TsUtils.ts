import { Constants, MainStats } from './constants'
import { RelicEnhance, RelicGrade } from 'types/Relic'
import stringify from 'json-stable-stringify'
import i18next, { DefaultNamespace, KeyPrefix, Namespace, TFunction } from 'i18next'

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
    grade: RelicGrade,
    enhance: RelicEnhance,
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
