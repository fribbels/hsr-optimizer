import { Button } from '@mantine/core'
import { TintedWallLayout } from 'lib/tabs/tabTeamShowcase/layouts/TintedWallLayout'
import {
  type TrialSelection,
  useTrialStore,
} from 'lib/tabs/tabTeamShowcase/layouts/trialStore'
import {
  ACTIONS_OPTIONS,
  type TrialOption,
} from 'lib/tabs/tabTeamShowcase/layouts/trialStyles'
import styles from 'lib/tabs/tabTeamShowcase/TeamShowcaseTab.module.css'
import { COLUMN_WIDTH_OPTIONS } from 'lib/tabs/tabTeamShowcase/trials/savedTeams/columnAxis'
import { useTeamShowcase } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'
import { useShallow } from 'zustand/react/shallow'

/**
 * Trial harness: shared state lives in useTeamShowcase, the layout is a pure view over it, and each row
 * in the bar switches one axis of the trial selection with one click. The bar sits below the layout so it
 * stays out of the design being judged.
 *
 * A row with fewer than two options hides itself, which is how a collapsed axis disappears without any
 * of its code being deleted.
 */

const TRIAL_AXES: { axis: keyof TrialSelection, label: string }[] = [
  { axis: 'actions', label: 'Actions' },
  { axis: 'width', label: 'Column width' },
]

const AXIS_OPTIONS: { [Key in keyof TrialSelection]: TrialOption<TrialSelection[Key]>[] } = {
  actions: ACTIONS_OPTIONS,
  width: COLUMN_WIDTH_OPTIONS,
}

const HAS_ACTIVE_TRIALS = TRIAL_AXES.some(({ axis }) => AXIS_OPTIONS[axis].length > 1)

export function TeamShowcaseTab() {
  const state = useTeamShowcase()
  const selection = useTrialStore(useShallow((s) => ({
    actions: s.actions,
    width: s.width,
  })))

  return (
    <div className={styles.root}>
      <TintedWallLayout state={state} />

      {HAS_ACTIVE_TRIALS && (
        <div className={styles.harnessBar}>
          {TRIAL_AXES.map(({ axis, label }) => (
            <TrialGroup
              key={axis}
              axis={axis}
              label={label}
              options={AXIS_OPTIONS[axis]}
              value={selection[axis]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TrialGroup<Axis extends keyof TrialSelection>({ axis, label, options, value }: {
  axis: Axis,
  label: string,
  options: TrialOption<TrialSelection[Axis]>[],
  value: TrialSelection[Axis],
}) {
  const setTrial = useTrialStore((s) => s.setTrial)
  if (options.length < 2) return null

  return (
    <div className={styles.harnessGroup}>
      <span className={styles.harnessLabel}>{label}</span>
      <div className={styles.harnessOptions}>
        {options.map((option) => (
          <Button
            key={option.value}
            size='xs'
            variant={option.value === value ? 'filled' : 'default'}
            aria-pressed={option.value === value}
            onClick={() => setTrial(axis, option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
