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
    return renderElementTagPill(value, t, true)
  }, [t])

  const renderOptions = useCallback(({ option: { value }, checked }: { option: { value: ElementTag }, checked?: boolean }) => {
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

const ELEMENT_TAG_COLORS: Record<ElementTag, string> = {
  [ElementTag.None]: '#8c8c8c',
  [ElementTag.Physical]: '#bebebe',
  [ElementTag.Fire]: '#ea7866',
  [ElementTag.Ice]: '#5ec7db',
  [ElementTag.Lightning]: '#eb77ea',
  [ElementTag.Wind]: '#62d3a2',
  [ElementTag.Quantum]: '#9c96f4',
  [ElementTag.Imaginary]: '#e8d85d',
}

export function renderElementTagPill(tag: ElementTag, t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>, active?: boolean) {
  const label = ElementTag[tag].toUpperCase()
  const colour = ELEMENT_TAG_COLORS[tag]
  return renderPill(ElementTag[tag], colour, label, { active })
}
