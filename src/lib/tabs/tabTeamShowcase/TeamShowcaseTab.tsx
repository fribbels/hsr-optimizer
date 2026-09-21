import { TeamShowcaseLayout } from 'lib/tabs/tabTeamShowcase/TeamShowcaseLayout'
import styles from 'lib/tabs/tabTeamShowcase/TeamShowcaseTab.module.css'
import { useTeamShowcase } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'

export function TeamShowcaseTab() {
  const state = useTeamShowcase()

  return (
    <div className={styles.root}>
      <TeamShowcaseLayout state={state} />
    </div>
  )
}
