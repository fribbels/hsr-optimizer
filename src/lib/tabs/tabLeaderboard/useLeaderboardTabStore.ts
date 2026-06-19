import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import type { InjectedScoreData } from 'lib/characterPreview/characterPreviewTypes'
import type { CharacterId } from 'types/character'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import type { LeaderboardConfigType } from '../../../../scripts/leaderboard/shared/configTypeMapping'
import { LEADERBOARD_FILTER_ALL, type LeaderboardEidolonFilter } from '../../../../scripts/leaderboard/shared/eidolonConfig'
import type { PublicCharacterData, PublicTeamMeta } from '../../../../scripts/leaderboard/shared/types'
import { type LeaderboardEntry } from './leaderboardTabTypes'

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

  selectedEntry: null,
  expandedCharacter: null,
  expandedPreviewRelics: null,
  leaderboardScoreData: null,
}))
