import { DamageFunctionType } from "lib/optimization/engine/damage/damageCalculator"
import { arrayIncludes } from "lib/utils/arrayUtils"

export function ModifierTypeSelect() { }

export namespace ModifierTypeSelect {
  export const tagValues = [
    DamageFunctionType.Crit,
    DamageFunctionType.Dot,
    DamageFunctionType.Break,
    DamageFunctionType.SuperBreak,
    DamageFunctionType.Additional,
    DamageFunctionType.Heal,
    DamageFunctionType.Shield,
    DamageFunctionType.HealTally,
    DamageFunctionType.Elation,
  ] as const
  export type TagType = typeof tagValues[number]
  export function isValidTag(tag: unknown): tag is TagType {
    return arrayIncludes(tagValues, tag)
  }
}