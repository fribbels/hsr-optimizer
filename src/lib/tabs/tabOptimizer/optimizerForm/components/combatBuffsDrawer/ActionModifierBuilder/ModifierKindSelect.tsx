import { Select } from "@mantine/core"
import { DamageFunctionType } from "lib/optimization/engine/damage/damageCalculator"
import { arrayIncludes } from "lib/utils/arrayUtils"

export function ModifierKindSelect({ value, onChange }: ModifierKindSelect.Props) {
  return (
    <Select
      flex={1}
      data={ModifierKindSelect.tagValues}
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
    { value: DamageFunctionType.Crit, label: DamageFunctionType[DamageFunctionType.Crit] },
    { value: DamageFunctionType.Dot, label: DamageFunctionType[DamageFunctionType.Dot] },
    { value: DamageFunctionType.Break, label: DamageFunctionType[DamageFunctionType.Break] },
    { value: DamageFunctionType.Additional, label: DamageFunctionType[DamageFunctionType.Additional] },
    { value: DamageFunctionType.Elation, label: DamageFunctionType[DamageFunctionType.Elation] },
  ] as const
  export type TagType = typeof tagValues[number]['value']
  export function isValidTag(tag: unknown): tag is TagType {
    return arrayIncludes(tagValues, tag)
  }
}