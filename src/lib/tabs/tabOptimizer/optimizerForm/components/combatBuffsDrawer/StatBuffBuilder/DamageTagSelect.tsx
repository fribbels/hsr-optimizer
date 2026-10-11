import { DAMAGE_TAG_ENTRY_BY_TAG } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type TFunction } from 'i18next'
import { PillMultiSelect } from 'lib/ui/pillSelects/PillMultiSelect'
import { arrayIncludes } from 'lib/utils/arrayUtils'

export function DamageTagSelect({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean,
  value: Array<DamageTagSelect.TagType>,
  onChange: (val: Array<DamageTagSelect.TagType>) => void,
}) {
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
      options={DamageTagSelect.tagValues}
      value={value}
      onChange={onChange}
      label='Damage tags'
      popoverText='selected stat can not be hit filtered, try using its flat equivalent instead'
      renderOptions={renderOptions}
      renderPills={renderPills}
      disabled={disabled}
    />
  )
}

export namespace DamageTagSelect {
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
