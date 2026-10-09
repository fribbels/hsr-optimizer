import { type TFunction } from 'i18next'
import { ABILITY_COLORS } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { PillSingleSelect } from 'lib/ui/pillSelects/PillSingleSelect'
import { arrayIncludes } from 'lib/utils/arrayUtils'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { type CombatStatBuff } from 'types/form'

export function TargetTagSelect({
  value,
  onChange,
}: {
  value: CombatStatBuff['targetTag'] | null,
  onChange: (tag: CombatStatBuff['targetTag'] | null) => void,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const renderDamageTagPill = useCallback((tag: TargetTag) => {
    return renderTargetTagPill(tag, t, true)
  }, [t])

  const renderDamageTagOption = useCallback((tag: TargetTag, checked: boolean) => {
    return renderTargetTagPill(tag, t, checked)
  }, [t])
  return (
    <PillSingleSelect
      renderOption={renderDamageTagOption}
      renderValue={renderDamageTagPill}
      options={TargetTagSelect.tagValues}
      onChange={onChange}
      value={value}
      label='Target tag'
    />
  )
}

export namespace TargetTagSelect {
  export const tagValues = [
    // Self not meaningful?
    // TargetTag.Self,
    TargetTag.Pet,
    TargetTag.Memosprite,
    TargetTag.Summon,
    TargetTag.FullTeam,
    TargetTag.SingleTarget,
    TargetTag.SelfAndPet,
    TargetTag.SelfAndMemosprite,
    TargetTag.SelfAndSummon,
  ] as const
  export type TagType = typeof tagValues[number]
  export function isValidTag(tag: unknown): tag is TagType {
    return arrayIncludes(tagValues, tag)
  }
}

const TARGET_TAG_COLORS: Record<TargetTag, string> = {
  [TargetTag.None]: ABILITY_COLORS.ALL,
  [TargetTag.Self]: ABILITY_COLORS.UNIQUE,
  [TargetTag.Pet]: ABILITY_COLORS.FUA,
  [TargetTag.Memosprite]: ABILITY_COLORS.MEMO,
  [TargetTag.Summon]: ABILITY_COLORS.ELATION,
  [TargetTag.FullTeam]: ABILITY_COLORS.ULT,
  [TargetTag.SingleTarget]: ABILITY_COLORS.BASIC,
  [TargetTag.SelfAndPet]: ABILITY_COLORS.SKILL,
  [TargetTag.SelfAndMemosprite]: ABILITY_COLORS.ADDITIONAL,
  [TargetTag.SelfAndSummon]: ABILITY_COLORS.BREAK,
}

export function renderTargetTagPill(tag: TargetTag, t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>, active?: boolean) {
  return renderPill(TargetTag[tag], TARGET_TAG_COLORS[tag], TargetTag[tag].toUpperCase(), { active })
}
