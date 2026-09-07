import type { TFunction } from 'i18next'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { PillMultiSelect } from 'lib/ui/pillSelects/PillMultiSelect'
import { arrayIncludes } from 'lib/utils/arrayUtils'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function ElementTagSelect({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean,
  value: Array<ElementTag>,
  onChange: (val: Array<ElementTag>) => void,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const renderPills = useCallback(({ value }: { value?: ElementTag }) => {
    if (!value) return null
    return renderDamageTagPill(value, t, true)
  }, [t])

  const renderOptions = useCallback(({ option: { value }, checked }: { option: { value: ElementTag }, checked?: boolean }) => {
    if (!value) return null
    return renderDamageTagPill(value, t, checked)
  }, [t])
  return (
    <PillMultiSelect
      options={ElementTagSelect.tagValues}
      value={value}
      onChange={onChange}
      label='Element tags'
      popoverText='selected stat can not be hit filtered, try using its flat equivalent instead'
      withPopover
      renderOptions={renderOptions}
      renderPills={renderPills}
      disabled={disabled}
    />
  )
}

export namespace ElementTagSelect {
  export const tagValues = [
    ElementTag.Physical,
    ElementTag.Fire,
    ElementTag.Ice,
    ElementTag.Lightning,
    ElementTag.Wind,
    ElementTag.Quantum,
    ElementTag.Imaginary,
  ] as const
  export type TagType = typeof tagValues[number]
  export function isValidTag(tag: unknown): tag is TagType {
    return arrayIncludes(tagValues, tag)
  }
}

export function renderDamageTagPill(tag: ElementTag, t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>, active?: boolean) {
  const label = ElementTag[tag]
  const colour = '#fafa'
  if (!colour) return null
  return renderPill(ElementTag[tag], colour, label, { active })
}
