import type { TeamShowcaseState } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'

/** Every layout is a pure view over the shared team showcase state; the trial selection comes from useTrialStore */
export interface TeamShowcaseLayoutProps {
  state: TeamShowcaseState
}
