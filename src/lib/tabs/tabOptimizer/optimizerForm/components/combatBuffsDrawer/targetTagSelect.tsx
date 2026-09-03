import {
  Combobox,
  Select,
} from '@mantine/core'
import { type TFunction } from 'i18next'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { PillMultiSelect } from 'lib/ui/pillSelects/PillMultiSelect'
import {
  useCallback,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { type CombatStatBuff } from 'types/form'
import { PillSingleSelect } from 'lib/ui/pillSelects/PillSingleSelect'

export const targetTagValues = [
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
]

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
      options={targetTagValues}
      onChange={onChange}
      value={value}
      label='Target tag'
    />
  )
}

// TODO: colours per target tag, target tag labels
export function renderTargetTagPill(tag: TargetTag, t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>, active?: boolean) {
  return renderPill(TargetTag[tag], '#fafa', TargetTag[tag], { active })
}
