import { SegmentedControl } from '@mantine/core'
import {
  DEFAULT_TEAM_SHOWCASE_LAYOUT,
  TEAM_SHOWCASE_LAYOUTS,
  type TeamShowcaseLayoutKey,
} from 'lib/tabs/tabTeamShowcase/layouts/layoutRegistry'
import styles from 'lib/tabs/tabTeamShowcase/TeamShowcaseTab.module.css'
import { useTeamShowcase } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'
import {
  useCallback,
  useState,
} from 'react'

const LAYOUT_STORAGE_KEY = 'teamShowcaseTrialLayout'

function isLayoutKey(value: string | null): value is TeamShowcaseLayoutKey {
  return TEAM_SHOWCASE_LAYOUTS.some((entry) => entry.key === value)
}

function readStoredLayout(): TeamShowcaseLayoutKey {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY)
    return isLayoutKey(stored) ? stored : DEFAULT_TEAM_SHOWCASE_LAYOUT
  } catch {
    return DEFAULT_TEAM_SHOWCASE_LAYOUT
  }
}

/**
 * Trial harness: shared state lives in useTeamShowcase, each candidate layout is a pure view.
 * The switcher is a development aid and will be removed once a layout is chosen.
 */
export function TeamShowcaseTab() {
  const state = useTeamShowcase()
  const [layoutKey, setLayoutKey] = useState<TeamShowcaseLayoutKey>(readStoredLayout)

  const onLayoutChange = useCallback((value: string) => {
    if (!isLayoutKey(value)) return
    setLayoutKey(value)
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, value)
    } catch {
      // Storage is a convenience only
    }
  }, [])

  const entry = TEAM_SHOWCASE_LAYOUTS.find((candidate) => candidate.key === layoutKey) ?? TEAM_SHOWCASE_LAYOUTS[0]
  const Layout = entry.Component

  return (
    <div className={styles.root}>
      {TEAM_SHOWCASE_LAYOUTS.length > 1 && (
        <div className={styles.harnessBar}>
          <span className={styles.harnessLabel}>Layout trial</span>
          <SegmentedControl
            size='xs'
            value={layoutKey}
            onChange={onLayoutChange}
            data={TEAM_SHOWCASE_LAYOUTS.map((candidate) => ({ value: candidate.key, label: candidate.label }))}
          />
        </div>
      )}

      <Layout key={layoutKey} state={state} />
    </div>
  )
}
