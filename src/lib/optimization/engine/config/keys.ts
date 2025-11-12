import {newStatsConfig} from 'lib/optimization/engine/config/statsConfig'

export type StatKeyType = keyof typeof newStatsConfig

declare const StatKeyBrand: unique symbol

export type StatKeyValue = number & { readonly [StatKeyBrand]: true }

export const StatKey: Record<StatKeyType, StatKeyValue> = Object.keys(newStatsConfig).reduce(
  (acc, key, index) => {
    acc[key as StatKeyType] = index as StatKeyValue // Add type assertion here
    return acc
  },
  {} as Record<StatKeyType, StatKeyValue>,
)
