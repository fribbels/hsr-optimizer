import { type TFunction } from "i18next"
import { renderPill as pillRenderer } from "lib/characterPreview/buffsAnalysis/buffUtils"
import { AbilityKind } from "lib/optimization/rotation/turnAbilityConfig"
import { PillMultiSelect } from "lib/ui/pillSelects/PillMultiSelect"
import { arrayIncludes } from "lib/utils/arrayUtils"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"

export function AbilitySelect({ value, onChange }: AbilitySelect.Props) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })
  const renderOptions: PillMultiSelect.Props<AbilitySelect.TagType>['renderOptions'] = useCallback((value, checked) => {
    return AbilitySelect.renderPill(value, t, checked)
  }, [])
  const renderPills: PillMultiSelect.Props<AbilitySelect.TagType>['renderPills'] = useCallback((value) => {
    if (!value) return null
    return AbilitySelect.renderPill(value, t, true)
  }, [])
  return (
    <PillMultiSelect
      flex={1}
      options={AbilitySelect.tagValues}
      value={value}
      onChange={onChange}
      label="Targetted abilities"
      renderOptions={renderOptions}
      renderPills={renderPills}
      clearable
    />
  )
}

export namespace AbilitySelect {
  export type Props = {
    value: Array<TagType>
    onChange: (values: Array<TagType>) => void
  }
  export const tagValues = [
    AbilityKind.BASIC,
    AbilityKind.SKILL,
    AbilityKind.ULT,
    AbilityKind.FUA,
    AbilityKind.DOT,
    AbilityKind.BREAK,
    AbilityKind.MEMO_SKILL,
    AbilityKind.MEMO_TALENT,
    AbilityKind.ELATION_SKILL,
    AbilityKind.UNIQUE,
  ] as const
  export type TagType = typeof tagValues[number]
  export function isValidTag(tag: unknown): tag is TagType {
    return arrayIncludes(tagValues, tag)
  }
  export function renderPill(tag: TagType, t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>, active?: boolean) {
    const label = AbilityKind[tag].toUpperCase()
    const colour = '#fafa'
    return pillRenderer(AbilityKind[tag], colour, label, { active })
  }
}
