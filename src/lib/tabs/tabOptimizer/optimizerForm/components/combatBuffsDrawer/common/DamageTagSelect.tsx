import { DAMAGE_TAG_ENTRY_BY_TAG } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type TFunction } from 'i18next'
import { PillMultiSelect } from 'lib/ui/pillSelects/PillMultiSelect'
import { arrayIncludes } from 'lib/utils/arrayUtils'

export function DamageTagSelect<T extends DamageTagSelect.TagType>({
  disabled,
  value,
  onChange,
  options,
  label,
  popoverText
}: DamageTagSelect.Props<T>) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const renderPills: PillMultiSelect.Props<DamageTagSelect.TagType>['renderPills'] = useCallback((value) => {
    if (!value) return null
    return renderDamageTagPill(value, t, true)
  }, [t])

  const renderOptions: PillMultiSelect.Props<DamageTagSelect.TagType>['renderOptions'] = useCallback((value, checked) => {
    if (!value) return null
    return renderDamageTagPill(value, t, checked)
  }, [t])
  return (
    <PillMultiSelect
      options={options}
      value={value}
      onChange={onChange}
      label={label}
      popoverText={popoverText}
      renderOptions={renderOptions}
      renderPills={renderPills}
      disabled={disabled}
    />
  )
}

export namespace DamageTagSelect {
  export type Props<T extends TagType> = {
    disabled?: boolean,
    value: Array<NoInfer<T>>,
    onChange: (val: Array<NoInfer<T>>) => void,
    options: ReadonlyArray<T>
    label: string
    popoverText?: string
  }
  export const tagValues = [
    DamageTag.BASIC,
    DamageTag.SKILL,
    DamageTag.ULT,
    DamageTag.FUA,
    DamageTag.DOT,
    DamageTag.BREAK,
    DamageTag.SUPER_BREAK,
    DamageTag.MEMO,
    DamageTag.ADDITIONAL,
    DamageTag.ELATION,
    DamageTag.ASSIST,
  ] as const
  export type TagType = typeof tagValues[number]
  export function isValidTag(tag: unknown): tag is TagType {
    return arrayIncludes(tagValues, tag)
  }
}

export function renderDamageTagPill(tag: DamageTag, t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>, active?: boolean) {
  const label = t(DamageTag[tag])
  const colour = DAMAGE_TAG_ENTRY_BY_TAG.get(tag)?.color
  if (!colour) return null
  return renderPill(DamageTag[tag], colour, label, { active })
}
