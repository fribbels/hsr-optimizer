import { Button } from '@mantine/core'
import { TeamShowcaseLayout } from 'lib/tabs/tabTeamShowcase/TeamShowcaseLayout'
import styles from 'lib/tabs/tabTeamShowcase/TeamShowcaseTab.module.css'
import {
  COLUMN_WIDTH_OPTIONS,
  type ColumnWidth,
} from 'lib/tabs/tabTeamShowcase/trials/columnWidthTrial'
import { useColumnWidthTrialStore } from 'lib/tabs/tabTeamShowcase/trials/columnWidthTrialStore'
import { useTeamShowcase } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'

export function TeamShowcaseTab() {
  const state = useTeamShowcase()
  const width = useColumnWidthTrialStore((s) => s.width)

  return (
    <div className={styles.root}>
      <TeamShowcaseLayout state={state} />
      <ColumnWidthTrial value={width} />
    </div>
  )
}

function ColumnWidthTrial({ value }: { value: ColumnWidth }) {
  const setWidth = useColumnWidthTrialStore((s) => s.setWidth)

  return (
    <div className={styles.harnessBar}>
      <div className={styles.harnessGroup}>
        <span className={styles.harnessLabel}>Column width</span>
        <div className={styles.harnessOptions}>
          {COLUMN_WIDTH_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size='xs'
              variant={option.value === value ? 'filled' : 'default'}
              aria-pressed={option.value === value}
              onClick={() => setWidth(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
