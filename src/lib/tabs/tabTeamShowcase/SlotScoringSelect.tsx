import {
  Select,
  type SelectProps,
} from '@mantine/core'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import type { SlotScoring } from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'

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
  return (
    <Select
      allowDeselect={false}
      checkIconPosition='right'
      {...selectProps}
      comboboxProps={{ ...DEFAULT_COMBOBOX_PROPS, ...comboboxProps, keepMounted: false }}
      data={scoring.options}
      value={String(scoring.value)}
      onChange={(value) => {
        // Safe cast: every option value is a stringified ScoringType.
        if (value != null) onChange(Number(value) as ScoringType)
      }}
    />
  )
}
