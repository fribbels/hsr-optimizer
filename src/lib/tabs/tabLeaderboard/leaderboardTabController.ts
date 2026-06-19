import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import type { InjectedScoreData } from 'lib/characterPreview/characterPreviewTypes'
import {
  AppPages,
  PageToRoute,
} from 'lib/constants/appPages'
import { CharacterConverter } from 'lib/importer/characterConverter'
import { deriveVisibleEntries } from 'lib/tabs/tabLeaderboard/deriveVisibleEntries'
import { getLeaderboardCharacters } from 'lib/tabs/tabLeaderboard/leaderboardCharacterHelpers'
import {
  getBuildIndex,
  getLeaderboardCharacterIds,
  getLeaderboardTopScores,
  loadCharacterData,
  loadLeaderboardData,
} from 'lib/tabs/tabLeaderboard/leaderboardDataLoader'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import {
  isLeaderboardConfigType,
  LEADERBOARD_CONFIG_TYPES,
  type LeaderboardConfigType,
} from 'scripts/leaderboard/shared/configTypeMapping'
import {
  EIDOLON_GROUPS,
  LEADERBOARD_FILTER_ALL,
  type LeaderboardEidolonFilter,
} from 'scripts/leaderboard/shared/eidolonConfig'
import { expandCharacter } from 'scripts/leaderboard/shared/profileCompression'
import type {
  PublicCharacterData,
  PublicTeamMeta,
} from 'scripts/leaderboard/shared/types'
import type { CharacterId } from 'types/character'

const CONFIG_DISPLAY_ORDER = LEADERBOARD_CONFIG_TYPES

const CLEARED_DETAIL_STATE = {
  characterData: null,
  visibleEntries: [],
  availableTeams: [],
  activeConfigType: null,
  activeTeamId: LEADERBOARD_FILTER_ALL,
  filterCharacterEidolon: LEADERBOARD_FILTER_ALL as LeaderboardEidolonFilter,
  selectedBuildId: null,
  selectedEntry: null,
  expandedCharacter: null,
  expandedPreviewRelics: null,
  leaderboardScoreData: null,
}

function extractPickerState(data: PublicCharacterData, configType: LeaderboardConfigType) {
  const configData = data.configs[configType]
  if (!configData) return { availableTeams: [] as PublicTeamMeta[] }

  const availableTeams = configData.teams
  return { availableTeams }
}

function recomputeDerivedState() {
  const state = useLeaderboardTabStore.getState()
  const { visibleEntries, selectedBuildId } = state

  const selectedEntry = selectedBuildId
    ? visibleEntries.find((e) => e.buildId === selectedBuildId) ?? null
    : null

  let expandedCharacter: ShowcaseTabCharacter | null = null
  let expandedPreviewRelics: PreviewRelics | null = null
  let leaderboardScoreData: InjectedScoreData | null = null

  if (selectedEntry) {
    const unconverted = expandCharacter(selectedEntry.minifiedCharacter)
    const converted = CharacterConverter.convert(unconverted)
    expandedCharacter = converted
    expandedPreviewRelics = converted.equipped as PreviewRelics

    leaderboardScoreData = {
      percent: selectedEntry.score,
      baselineSimScore: selectedEntry.baselineSimScore,
      benchmarkSimScore: selectedEntry.benchmarkSimScore,
      maximumSimScore: selectedEntry.maximumSimScore,
    }
  }

  useLeaderboardTabStore.setState({
    selectedEntry,
    expandedCharacter,
    expandedPreviewRelics,
    leaderboardScoreData,
  })
}

function deriveAndUpdateEntries() {
  const state = useLeaderboardTabStore.getState()
  const visible = deriveVisibleEntries({
    characterData: state.characterData,
    activeConfigType: state.activeConfigType,
    activeTeamId: state.activeTeamId,
    filterCharacterEidolon: state.filterCharacterEidolon,
  })

  const currentBuildId = state.selectedBuildId
  const stillVisible = currentBuildId && visible.some((e) => e.buildId === currentBuildId)

  useLeaderboardTabStore.setState({
    visibleEntries: visible,
    selectedBuildId: stillVisible ? currentBuildId : (visible[0]?.buildId ?? null),
  })

  recomputeDerivedState()
}

const LEADERBOARD_ROUTE = PageToRoute[AppPages.LEADERBOARD]
const LEADERBOARD_HASH = LEADERBOARD_ROUTE.slice(LEADERBOARD_ROUTE.indexOf('#'))

function updateLeaderboardUrl() {
  if (!window.location.hash.startsWith(LEADERBOARD_HASH)) return

  const state = useLeaderboardTabStore.getState()
  const entry = state.selectedEntry

  if (entry) {
    history.replaceState(null, '', `${LEADERBOARD_ROUTE}?b=${entry.buildId}`)
  } else {
    history.replaceState(null, '', LEADERBOARD_ROUTE)
  }
}

export function expandCharacterList() {
  useLeaderboardTabStore.setState({ characterListExpanded: true })
}

function resolveActiveConfigType(
  configTypes: LeaderboardConfigType[],
  requestedConfigType: string | undefined,
): LeaderboardConfigType | null {
  if (requestedConfigType && isLeaderboardConfigType(requestedConfigType) && configTypes.includes(requestedConfigType)) {
    return requestedConfigType
  }
  return CONFIG_DISPLAY_ORDER.find((c) => configTypes.includes(c)) ?? configTypes[0] ?? null
}

function resolveActiveTeamId(
  availableTeams: PublicTeamMeta[],
  requestedTeamId: string | undefined,
): string {
  if (!requestedTeamId) return LEADERBOARD_FILTER_ALL
  const teamIds = availableTeams.map((t) => t.teamId)
  if (requestedTeamId === LEADERBOARD_FILTER_ALL || teamIds.includes(requestedTeamId)) {
    return requestedTeamId
  }
  return LEADERBOARD_FILTER_ALL
}

export function selectLeaderboardCharacter(
  characterId: CharacterId,
  requested?: { configType?: string, teamId?: string, buildId?: string },
) {
  const data = loadCharacterData(characterId)

  if (!data) {
    useLeaderboardTabStore.setState({
      characterListExpanded: false,
      selectedCharacterId: characterId,
      ...CLEARED_DETAIL_STATE,
    })
    updateLeaderboardUrl()
    return
  }

  const configTypes = Object.keys(data.configs).filter(isLeaderboardConfigType)
  const activeConfigType = resolveActiveConfigType(configTypes, requested?.configType)

  if (!activeConfigType) {
    useLeaderboardTabStore.setState({
      characterListExpanded: false,
      selectedCharacterId: characterId,
      ...CLEARED_DETAIL_STATE,
      characterData: data,
    })
    updateLeaderboardUrl()
    return
  }

  const { availableTeams } = extractPickerState(data, activeConfigType)
  const activeTeamId = resolveActiveTeamId(availableTeams, requested?.teamId)

  useLeaderboardTabStore.setState({
    characterListExpanded: false,
    selectedCharacterId: characterId,
    characterData: data,
    availableTeams,
    activeConfigType,
    activeTeamId,
    filterCharacterEidolon: LEADERBOARD_FILTER_ALL,
  })

  setTimeout(() => {
    deriveAndUpdateEntries()

    if (requested?.buildId) {
      useLeaderboardTabStore.setState({ selectedBuildId: requested.buildId })
      recomputeDerivedState()
    }

    updateLeaderboardUrl()
  }, 0)
}

export function selectLeaderboardEntry(buildId: string) {
  if (buildId === useLeaderboardTabStore.getState().selectedBuildId) return

  useLeaderboardTabStore.setState({ selectedBuildId: buildId })
  recomputeDerivedState()
  updateLeaderboardUrl()
}

function isValidEidolonFilter(value: string): value is LeaderboardEidolonFilter {
  return value === LEADERBOARD_FILTER_ALL || (EIDOLON_GROUPS as string[]).includes(value)
}

export function setLeaderboardFilters(filters: { teamId?: string, characterEidolon?: string }) {
  const state = useLeaderboardTabStore.getState()

  if (filters.teamId !== undefined && filters.teamId !== state.activeTeamId) {
    useLeaderboardTabStore.setState({ activeTeamId: filters.teamId })
  }

  if (
    filters.characterEidolon !== undefined
    && filters.characterEidolon !== state.filterCharacterEidolon
    && isValidEidolonFilter(filters.characterEidolon)
  ) {
    useLeaderboardTabStore.setState({ filterCharacterEidolon: filters.characterEidolon })
  }

  deriveAndUpdateEntries()
  updateLeaderboardUrl()
}

export function getHashParam(param: string): string | null {
  const query = window.location.hash.split('?')[1]
  return query ? new URLSearchParams(query).get(param) : null
}

export async function initializeLeaderboardTab() {
  const output = await loadLeaderboardData()

  const liveIds = getLeaderboardCharacterIds(output)
  const fallbackIds = getLeaderboardCharacters()
  const merged = [...new Set([...liveIds, ...fallbackIds])]

  const result = await getLeaderboardTopScores()
  const topScores = result.bestScores
  const totalEntries = result.totalEntries

  const sorted = [...merged].sort((a, b) => (topScores[b] ?? 0) - (topScores[a] ?? 0))

  useLeaderboardTabStore.setState({
    availableCharacters: merged,
    sortedCharacters: sorted,
    topScores,
    totalEntries,
  })

  const buildIdParam = getHashParam('b')

  if (buildIdParam) {
    const index = getBuildIndex()
    const match = index?.get(buildIdParam)
    if (match) {
      await selectLeaderboardCharacter(match.characterId, {
        configType: match.configType,
        teamId: match.teamId,
        buildId: buildIdParam,
      })
    }
  }
}
