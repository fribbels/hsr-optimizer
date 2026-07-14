import { computeCandidateId } from 'leaderboard/shared/hash'
import type {
  PublicCharacterData,
  PublicLeaderboardEntry,
} from 'leaderboard/shared/types'
import {
  computeBrowserCandidateId,
  hashLeaderboardUid,
} from 'lib/tabs/tabLeaderboard/leaderboardBrowserHash'
import { normalizeBrowserTimelineEvent } from 'lib/tabs/tabLeaderboard/leaderboardDataLoader'
import { lookupUserLeaderboardRanks } from 'lib/tabs/tabLeaderboard/leaderboardUidLookup'
import type { CharacterId } from 'types/character'
import {
  describe,
  expect,
  test,
} from 'vitest'

const UID = '601069336'
const UID_HASH = '31050e4f5f4bb895ba7ba9326e6dead67ca90d494d548632db2f4b0cab5436a3'
const CHARACTER_ID = '1001' as CharacterId
const CANDIDATE_ID = '6de86cffb601'

function makeEntry(candidateId: string, score: number, buildId: string, teamId: string): PublicLeaderboardEntry {
  return {
    rank: 1,
    characterId: CHARACTER_ID,
    candidateId,
    buildId,
    score,
    data: {
      character: { a: 1001, r: 0 },
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

function makeCharacterData(): PublicCharacterData {
  const dpsTeamA = 'dps-team-a'
  const dpsTeamB = 'dps-team-b'
  const supportTeam = 'support-team'
  const healTeam = 'heal-team'

  return {
    configs: {
      dps: {
        teams: [],
        teamsById: {
          [dpsTeamA]: {
            entries: [
              makeEntry('aaaaaaaaaaaa', 2, '111111111111', dpsTeamA),
              makeEntry(CANDIDATE_ID, 1.8, '222222222222', dpsTeamA),
            ],
            totalEntries: 2,
          },
          [dpsTeamB]: {
            entries: [makeEntry(CANDIDATE_ID, 1.9, '333333333333', dpsTeamB)],
            totalEntries: 1,
          },
        },
        totalEntries: 3,
      },
      support: {
        teams: [],
        teamsById: {
          [supportTeam]: {
            entries: [makeEntry(CANDIDATE_ID, 1.7, '444444444444', supportTeam)],
            totalEntries: 1,
          },
        },
        totalEntries: 1,
      },
      heal: {
        teams: [],
        teamsById: {
          [healTeam]: {
            entries: [makeEntry(CANDIDATE_ID, 1.49, '555555555555', healTeam)],
            totalEntries: 1,
          },
        },
        totalEntries: 1,
      },
    },
  }
}

describe('leaderboard browser hashing', () => {
  test('matches the Node candidate identity vectors', async () => {
    expect(await hashLeaderboardUid(UID)).toBe(UID_HASH)
    expect(await computeBrowserCandidateId(UID_HASH, CHARACTER_ID)).toBe(CANDIDATE_ID)
    expect(computeCandidateId(UID_HASH, CHARACTER_ID)).toBe(CANDIDATE_ID)
  })

  test('normalizes a legacy v2 timeline event before UI consumption', async () => {
    const event = await normalizeBrowserTimelineEvent({
      type: 'new_best',
      characterId: CHARACTER_ID,
      configType: 'dps',
      uidHash: UID_HASH,
      date: '2026-06-24T00:00:00Z',
      score: 2,
      previousScore: 1.9,
      rank: 1,
      previousRank: 2,
      buildId: '111111111111',
    })

    expect(event?.candidateId).toBe(CANDIDATE_ID)
    expect(JSON.stringify(event)).not.toContain('uidHash')
  })
})

describe('lookupUserLeaderboardRanks', () => {
  test('returns only visible all-teams matches in leaderboard rank order', async () => {
    const ranks = await lookupUserLeaderboardRanks(UID, [{
      characterId: CHARACTER_ID,
      characterData: makeCharacterData(),
    }])

    expect(ranks).toEqual([
      {
        characterId: CHARACTER_ID,
        configType: 'support',
        rank: 1,
        score: 1.7,
        buildId: '444444444444',
      },
      {
        characterId: CHARACTER_ID,
        configType: 'dps',
        rank: 2,
        score: 1.9,
        buildId: '333333333333',
      },
    ])
  })
})
