import { ElementSelect, renderElementTagPill } from "../common/elementTag"
import { PillSingleSelect } from "lib/ui/pillSelects/PillSingleSelect"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"

export function DamageElementSelect({ value, onChange }: DamageElementSelect.Props) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const renderPills = useCallback((value: DamageElementSelect.TagType) => {
    return renderElementTagPill(value, t, true)
  }, [t])

  const renderOption = useCallback((value: DamageElementSelect.TagType, checked?: boolean) => {
    return renderElementTagPill(value, t, checked)
  }, [t])
  return (
    <PillSingleSelect
      options={DamageElementSelect.tagValues}
      value={value}
      onChange={onChange}
      renderOption={renderOption}
      renderValue={renderPills}
      label="Damage Element"
      flex={1}
    />
  )
}

export namespace DamageElementSelect {
  export type Props = {
    value: TagType | null
    onChange: (value: TagType | null) => void
  }
  export const tagValues = ElementSelect.tagValues
  export type TagType = ElementSelect.TagType
  export const isValidTag = ElementSelect.isValidTag
}
