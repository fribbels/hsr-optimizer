import {
  Select,
  type SelectProps,
} from '@mantine/core'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import type { SlotScoring } from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import { useMemo } from 'react'

/** Compact dropdown over the scoring algorithms a slot's card can display */
const DEFAULT_COMBOBOX_PROPS = { withinPortal: true, keepMounted: false }

export function SlotScoringSelect({
  scoring,
  onChange,
  comboboxProps,
  ...selectProps
}: {
  scoring: SlotScoring,
  onChange: (scoringType: ScoringType) => void,
} & Omit<SelectProps, 'data' | 'value' | 'onChange'>) {
  const data = useMemo(
    () => scoring.options.map((option) => ({ value: String(option.value), label: option.label })),
    [scoring.options],
  )

  return (
    <Select
      size='xs'
      allowDeselect={false}
      checkIconPosition='right'
      {...selectProps}
      // Merged after the spread so a caller overriding one field cannot silently drop keepMounted
      comboboxProps={{ ...DEFAULT_COMBOBOX_PROPS, ...comboboxProps }}
      data={data}
      value={String(scoring.value)}
      onChange={(value) => {
        if (value != null) onChange(Number(value) as ScoringType)
      }}
    />
  )
}
