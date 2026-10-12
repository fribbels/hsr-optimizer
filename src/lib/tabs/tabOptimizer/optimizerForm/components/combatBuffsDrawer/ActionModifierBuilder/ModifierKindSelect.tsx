import { Select } from "@mantine/core"
import { DamageFunctionType } from "lib/optimization/engine/damage/damageCalculator"
import { arrayIncludes } from "lib/utils/arrayUtils"

export function ModifierKindSelect({ value, onChange }: ModifierKindSelect.Props) {
  return (
    <Select
      flex={1}
      data={ModifierKindSelect.tagValues.map((x) => ({ value: x, label: DamageFunctionType[x] }))}
      value={value}
      onChange={onChange}
      label='Modifier kind'
    />
  )
}

export namespace ModifierKindSelect {
  export type Props = {
    value: TagType | null,
    onChange: (value: TagType | null) => void
  }
  export const tagValues = [
    DamageFunctionType.Crit,
    DamageFunctionType.Break,
    DamageFunctionType.Elation,
  ] as const
  export type TagType = typeof tagValues[number]
  export function isValidTag(tag: unknown): tag is TagType {
    return arrayIncludes(tagValues, tag)
  }
}