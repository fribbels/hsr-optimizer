import { PillMultiSelect } from 'lib/ui/pillSelects/PillMultiSelect'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ElementSelect, renderElementTagPill } from '../common/elementTag'

export function ElementTagSelect({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean,
  value: Array<ElementTagSelect.TagType>,
  onChange: (val: Array<ElementTagSelect.TagType>) => void,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const renderPills: PillMultiSelect.Props<ElementTagSelect.TagType>['renderPills'] = useCallback((value) => {
    if (!value) return null
    return renderElementTagPill(value, t, true)
  }, [t])

  const renderOptions: PillMultiSelect.Props<ElementTagSelect.TagType>['renderOptions'] = useCallback((value, checked) => {
    if (!value) return null
    return renderElementTagPill(value, t, checked)
  }, [t])
  return (
    <PillMultiSelect
      options={ElementTagSelect.tagValues}
      value={value}
      onChange={onChange}
      label='Element tags'
      popoverText='selected stat can not be hit filtered, try using its flat equivalent instead'
      renderOptions={renderOptions}
      renderPills={renderPills}
      disabled={disabled}
    />
  )
}

export namespace ElementTagSelect {
  export const tagValues = ElementSelect.tagValues
  export type TagType = ElementSelect.TagType
  export const isValidTag = ElementSelect.isValidTag
}
