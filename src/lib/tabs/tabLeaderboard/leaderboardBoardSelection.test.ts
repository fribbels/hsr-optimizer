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
  beforeEach(() => {
    characterDataFixture = makeCharacterData()
    useLeaderboardTabStore.setState({
      activeTeamId: LEADERBOARD_FILTER_ALL,
      selectedBuildId: null,
      characterData: null,
      visibleEntries: [],
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
    // 100 stronger builds on TEAM_B push the target past LEADERBOARD_DISPLAY_TOP_N on all-teams,
    // while it stays reachable at the top of TEAM_A.
    characterDataFixture.configs.dps!.teamsById[TEAM_B].entries = Array.from({ length: 100 }, (_, i) =>
      makeEntry(`cand-crowd-${i}`, 1.9 - i * 0.001, `crowd-${i}`, TEAM_B))

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
