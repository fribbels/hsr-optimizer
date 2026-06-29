import type { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import {
  LEADERBOARD_FILTER_ALL,
  type LeaderboardEidolonFilter,
} from 'leaderboard/shared/eidolonConfig'
import type {
  PublicCharacterData,
  PublicTeamMeta,
} from 'leaderboard/shared/types'
import type { TimelineEvent } from 'leaderboard/timeline/timelineTypes'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import type { InjectedScoreData } from 'lib/characterPreview/characterPreviewTypes'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { type LeaderboardEntry } from 'lib/tabs/tabLeaderboard/leaderboardTabTypes'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import type { CharacterId } from 'types/character'

export interface LeaderboardTabState {
  selectedCharacterId: CharacterId | null
  selectedBuildId: string | null
  characterListExpanded: boolean

  activeConfigType: LeaderboardConfigType | null
  activeTeamId: string
  filterCharacterEidolon: LeaderboardEidolonFilter

  characterData: PublicCharacterData | null

  visibleEntries: LeaderboardEntry[]
  availableTeams: PublicTeamMeta[]

  topScores: Partial<Record<CharacterId, number>>
  totalEntries: Partial<Record<CharacterId, number>>
  availableCharacters: CharacterId[]
  sortedCharacters: CharacterId[]

  timelineEvents: TimelineEvent[]

  selectedEntry: LeaderboardEntry | null
  expandedCharacter: ShowcaseTabCharacter | null
  expandedPreviewRelics: PreviewRelics | null
  leaderboardScoreData: InjectedScoreData | null
}

export const useLeaderboardTabStore = createTabAwareStore<LeaderboardTabState>((set) => ({
  selectedCharacterId: null,
  selectedBuildId: null,
  characterListExpanded: true,

  activeConfigType: null,
  activeTeamId: LEADERBOARD_FILTER_ALL,
  filterCharacterEidolon: LEADERBOARD_FILTER_ALL,

  characterData: null,

  visibleEntries: [],
  availableTeams: [],

  topScores: {},
  totalEntries: {},
  availableCharacters: [],
  sortedCharacters: [],

  timelineEvents: [],

  selectedEntry: null,
  expandedCharacter: null,
  expandedPreviewRelics: null,
  leaderboardScoreData: null,
}))
