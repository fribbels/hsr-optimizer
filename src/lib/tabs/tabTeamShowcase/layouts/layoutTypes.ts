import type { TeamShowcaseState } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'

/** Every trial layout is a pure view over the shared team showcase state */
export interface TeamShowcaseLayoutProps {
  state: TeamShowcaseState
}
