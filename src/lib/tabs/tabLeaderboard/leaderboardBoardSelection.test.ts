// @vitest-environment jsdom
import { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import { LEADERBOARD_FILTER_ALL } from 'leaderboard/shared/eidolonConfig'
import type {
  PublicCharacterData,
  PublicLeaderboardEntry,
} from 'leaderboard/shared/types'
import type * as LeaderboardCharacterHelpers from 'lib/tabs/tabLeaderboard/leaderboardCharacterHelpers'
import type * as LeaderboardDataLoader from 'lib/tabs/tabLeaderboard/leaderboardDataLoader'
import type { BuildIndexEntry } from 'lib/tabs/tabLeaderboard/leaderboardDataLoader'
import { LeaderboardExFilter } from 'lib/tabs/tabLeaderboard/leaderboardTabTypes'
import type { CharacterId } from 'types/character'
import { ScoringConfigType } from 'types/metadata'
import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

const CHARACTER_ID = '1405' as CharacterId
const TEAM_A = 'team-a'
const TEAM_B = 'team-b'
// Not 100, so a hardcoded cap fails
const TOP_N_PUBLIC = 104

// The build under test: #3 on its own team board, #6 across all teams.
const TARGET_BUILD_ID = 'target-build'

function makeEntry(candidateId: string, score: number, buildId: string, teamId: string): PublicLeaderboardEntry {
  return {
    rank: 1,
    characterId: CHARACTER_ID,
    candidateId,
    buildId,
    score,
    data: {
      character: { a: 1405, r: 0 },
      team: [],
      teamEidolon: 0,
      characterEidolon: 0,
      teamId,
      baselineSimScore: 0,
      benchmarkSimScore: 0,
      maximumSimScore: 0,
      fetchedAt: 1782259200,
    },
  }
}

// Builds stronger than every fixture build
function makeCrowd(count: number, teamId: string): PublicLeaderboardEntry[] {
  return Array.from(
    { length: count },
    (_, i) => makeEntry(`cand-${teamId}-${i}`, 1.9 - i * 0.001, `${teamId}-${i}`, teamId),
  )
}

// TEAM_A holds the target plus 2 stronger builds -> team rank #3.
// TEAM_B holds 3 more builds that outscore the target -> all-teams rank #6.
function makeCharacterData(): PublicCharacterData {
  return {
    configs: {
      dps: {
        // resolveActiveTeamId() validates a requested teamId against this list, so a board
        // missing from it would silently fall back to all-teams.
        teams: [
          { teamId: TEAM_A, teammates: [] },
          { teamId: TEAM_B, teammates: [] },
        ],
        teamsById: {
          [TEAM_A]: {
            entries: [
              makeEntry('cand-a1', 1.74, 'a1', TEAM_A),
              makeEntry('cand-a2', 1.70, 'a2', TEAM_A),
              makeEntry('cand-target', 1.667, TARGET_BUILD_ID, TEAM_A),
            ],
            totalEntries: 3,
          },
          [TEAM_B]: {
            entries: [
              makeEntry('cand-b1', 1.73, 'b1', TEAM_B),
              makeEntry('cand-b2', 1.72, 'b2', TEAM_B),
              makeEntry('cand-b3', 1.71, 'b3', TEAM_B),
            ],
            totalEntries: 3,
          },
        },
        totalEntries: 6,
      },
    },
  }
}

const buildIndex = new Map<string, BuildIndexEntry>([
  [TARGET_BUILD_ID, { characterId: CHARACTER_ID, configType: LeaderboardConfigType.DPS, teamId: TEAM_A }],
  ['a1', { characterId: CHARACTER_ID, configType: LeaderboardConfigType.DPS, teamId: TEAM_A }],
  ['b1', { characterId: CHARACTER_ID, configType: LeaderboardConfigType.DPS, teamId: TEAM_B }],
])

// Read lazily so individual tests can swap the fixture; the controller holds a live ESM
// binding to loadCharacterData, so vi.spyOn on the module namespace would not reach it.
let characterDataFixture: PublicCharacterData = makeCharacterData()

vi.mock('lib/tabs/tabLeaderboard/leaderboardDataLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof LeaderboardDataLoader>()
  return {
    ...actual,
    getBuildIndex: () => buildIndex,
    loadCharacterData: (characterId: CharacterId) => (characterId === CHARACTER_ID ? characterDataFixture : null),
  }
})

vi.mock('lib/tabs/tabLeaderboard/leaderboardCharacterHelpers', async (importOriginal) => {
  const actual = await importOriginal<typeof LeaderboardCharacterHelpers>()
  return {
    ...actual,
    IS_LOCALHOST: false,
    getCharacterLeaderboardConfigTypes: () => [ScoringConfigType.DPS],
  }
})

vi.mock('leaderboard/shared/profileCompression', () => ({
  expandCharacter: () => ({}),
}))

vi.mock('lib/importer/characterConverter', () => ({
  CharacterConverter: { convert: () => ({ equipped: {} }) },
}))

const { selectLeaderboardBuild } = await import('lib/tabs/tabLeaderboard/leaderboardTabController')
const { useLeaderboardTabStore } = await import('lib/tabs/tabLeaderboard/useLeaderboardTabStore')
const { deriveVisibleEntries } = await import('lib/tabs/tabLeaderboard/deriveVisibleEntries')

describe('leaderboard board selection', () => {
  test('EX filter retains mixed ranks and treats old entries as EX off', () => {
    const data = makeCharacterData()
    data.configs.dps!.teamsById[TEAM_B].entries[1].data.character.ex = 1
    const input = {
      characterData: data,
      activeConfigType: LeaderboardConfigType.DPS,
      activeTeamId: LEADERBOARD_FILTER_ALL,
      filterCharacterEidolon: LEADERBOARD_FILTER_ALL,
      topNPublic: TOP_N_PUBLIC,
    }
    const on = deriveVisibleEntries({ ...input, filterCharacterEx: LeaderboardExFilter.On })
    expect(on.map((entry) => [entry.buildId, entry.rank])).toEqual([['b2', 3]])
    const off = deriveVisibleEntries({ ...input, filterCharacterEx: LeaderboardExFilter.Off })
    expect(off.map((entry) => entry.rank)).toEqual([1, 2, 4, 5, 6])
    expect(off.every((entry) => entry.characterEx === 0)).toBe(true)
  })

  test('EX filtering cannot pull a build past the mixed top-N cutoff', () => {
    const data = makeCharacterData()
    const target = data.configs.dps!.teamsById[TEAM_A].entries[2]
    target.data.character.ex = 1
    data.configs.dps!.teamsById[TEAM_B].entries = makeCrowd(TOP_N_PUBLIC, TEAM_B)
    expect(deriveVisibleEntries({
      characterData: data,
      activeConfigType: LeaderboardConfigType.DPS,
      activeTeamId: LEADERBOARD_FILTER_ALL,
      filterCharacterEidolon: LEADERBOARD_FILTER_ALL,
      filterCharacterEx: LeaderboardExFilter.On,
      topNPublic: TOP_N_PUBLIC,
    })).toEqual([])
  })

  test('caps a team board at the data depth, not a fixed 100', () => {
    const data = makeCharacterData()
    data.configs.dps!.teamsById[TEAM_B].entries = makeCrowd(TOP_N_PUBLIC + 5, TEAM_B)
    const visible = deriveVisibleEntries({
      characterData: data,
      activeConfigType: LeaderboardConfigType.DPS,
      activeTeamId: TEAM_B,
      filterCharacterEidolon: LEADERBOARD_FILTER_ALL,
      filterCharacterEx: LeaderboardExFilter.All,
      topNPublic: TOP_N_PUBLIC,
    })
    expect(visible).toHaveLength(TOP_N_PUBLIC)
    expect(visible.at(-1)?.rank).toBe(TOP_N_PUBLIC)
  })

  test('all-teams merge never shows more ranks than the data depth', () => {
    const data = makeCharacterData()
    // Two full boards merge into 2N builds
    data.configs.dps!.teamsById[TEAM_A].entries = makeCrowd(TOP_N_PUBLIC, TEAM_A)
    data.configs.dps!.teamsById[TEAM_B].entries = makeCrowd(TOP_N_PUBLIC, TEAM_B)
    const visible = deriveVisibleEntries({
      characterData: data,
      activeConfigType: LeaderboardConfigType.DPS,
      activeTeamId: LEADERBOARD_FILTER_ALL,
      filterCharacterEidolon: LEADERBOARD_FILTER_ALL,
      filterCharacterEx: LeaderboardExFilter.All,
      topNPublic: TOP_N_PUBLIC,
    })
    expect(visible).toHaveLength(TOP_N_PUBLIC)
    expect(visible.map((entry) => entry.rank)).toEqual(Array.from({ length: TOP_N_PUBLIC }, (_, i) => i + 1))
  })

  test('linked builds clear EX filter and use compressed character EX in preview', () => {
    characterDataFixture.configs.dps!.teamsById[TEAM_A].entries[2].data.character.ex = 1
    useLeaderboardTabStore.setState({ filterCharacterEx: LeaderboardExFilter.Off })
    selectLeaderboardBuild(TARGET_BUILD_ID)
    const state = useLeaderboardTabStore.getState()
    expect(state.filterCharacterEx).toBe(LeaderboardExFilter.All)
    expect(state.selectedBuildId).toBe(TARGET_BUILD_ID)
    expect(state.expandedCharacter?.form.characterEx).toBe(1)
  })
  beforeEach(() => {
    characterDataFixture = makeCharacterData()
    useLeaderboardTabStore.setState({
      activeTeamId: LEADERBOARD_FILTER_ALL,
      selectedBuildId: null,
      characterData: null,
      visibleEntries: [],
      topNPublic: TOP_N_PUBLIC,
    })
  })

  test('fixture reproduces the reported ranks: #3 on the team board, #6 across all teams', () => {
    const characterData = makeCharacterData()
    const rankOn = (activeTeamId: string) =>
      deriveVisibleEntries({
        characterData,
        activeConfigType: LeaderboardConfigType.DPS,
        activeTeamId,
        filterCharacterEidolon: LEADERBOARD_FILTER_ALL,
        filterCharacterEx: LeaderboardExFilter.All,
        topNPublic: TOP_N_PUBLIC,
      }).find((e) => e.buildId === TARGET_BUILD_ID)?.rank

    expect(rankOn(TEAM_A)).toBe(3)
    expect(rankOn(LEADERBOARD_FILTER_ALL)).toBe(6)
  })

  test('lands on the all-teams board so the rank matches the timeline', () => {
    selectLeaderboardBuild(TARGET_BUILD_ID)

    const state = useLeaderboardTabStore.getState()
    expect(state.activeTeamId).toBe(LEADERBOARD_FILTER_ALL)
    expect(state.selectedBuildId).toBe(TARGET_BUILD_ID)
    expect(state.visibleEntries.find((e) => e.buildId === TARGET_BUILD_ID)?.rank).toBe(6)
  })

  test('falls back to the team board when the build is outside the all-teams cutoff', () => {
    // Push the target past the all-teams depth; it stays on top of TEAM_A
    characterDataFixture.configs.dps!.teamsById[TEAM_B].entries = makeCrowd(TOP_N_PUBLIC, TEAM_B)

    selectLeaderboardBuild(TARGET_BUILD_ID)

    const state = useLeaderboardTabStore.getState()
    expect(state.activeTeamId).toBe(TEAM_A)
    expect(state.selectedBuildId).toBe(TARGET_BUILD_ID)
  })

  test('unknown buildId falls back to the character without selecting a build', () => {
    selectLeaderboardBuild('does-not-exist', { characterId: CHARACTER_ID, configType: LeaderboardConfigType.DPS })

    const state = useLeaderboardTabStore.getState()
    expect(state.selectedCharacterId).toBe(CHARACTER_ID)
    expect(state.activeTeamId).toBe(LEADERBOARD_FILTER_ALL)
  })
})
