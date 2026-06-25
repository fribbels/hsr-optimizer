import { TimelineEventType } from 'leaderboard/timeline/timelineTypes'
import type { LeaderboardSnapshot, LeaderboardSnapshotEntry } from 'leaderboard/timeline/timelineTypes'
import { extractSnapshot } from 'leaderboard/timeline/extractSnapshot'
import { deduplicateAndMerge, diffSnapshots, displayScore } from 'leaderboard/timeline/computeTimeline'
import { deriveTimelinePath, deriveSnapshotPath } from 'leaderboard/timeline/timelineStorage'
import type { PrivateBoard, PrivateBoardCompleteness, PrivateRankedEntry, PrivateRankedOutput } from 'leaderboard/shared/types'
import type { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import type { LeaderboardEidolonGroup } from 'leaderboard/shared/eidolonConfig'
import { ScoringConfigType } from 'types/metadata'
import type { CharacterId } from 'types/character'
import { cwd } from 'leaderboard/shared/nodeFacade'
import {
  describe,
  expect,
  test,
} from 'vitest'

const VERSIONS = { global: 1, characters: {}, lightCones: {} }
const TEAM_ID = 'sorted-1005-1309-1313'

function makeBoard(characterId: string, entries: Array<{ score: number, uidHash?: string }>): PrivateBoard {
  return {
    characterId,
    configType: 'dps' as LeaderboardConfigType,
    teamId: TEAM_ID,
    entries: entries.map((e, i) => ({
      rank: i + 1,
      uid: `uid-${i}`,
      uidHash: e.uidHash ?? `hash-${characterId}-${i}`,
      payloadHash: 'ph',
      score: e.score,
      configType: ScoringConfigType.DPS,
      characterId,
      teamId: TEAM_ID,
      teamTier: 'e0' as LeaderboardEidolonGroup,
      data: {} as any,
      dependencyVersions: {} as any,
      dependencyDigest: 'digest',
      preFilterRank: i + 1,
    })),
    completeness: {
      scoredCandidateCount: entries.length,
      totalScoredEntries: entries.length,
      privateCutoffScore: null,
      publicCutoffScore: null,
      topN: 100,
      topNPublic: 100,
      canRefillPublicTopN: true,
    },
  }
}

function makePrivateOutput(boards: Record<string, PrivateBoard>): PrivateRankedOutput {
  return {
    generatedAt: '2026-06-24T00:00:00.000Z',
    versions: VERSIONS,
    sourceExport: { path: 'test', profileCount: 100 },
    boards,
    payloadIndex: { profiles: {} },
  }
}

describe('extractSnapshot', () => {
  test('picks the best score across multiple boards for the same character', () => {
    const output = makePrivateOutput({
      'board-low': makeBoard('1001', [{ score: 1.5 }]),
      'board-high': makeBoard('1001', [{ score: 2.0 }]),
    })
    const result = extractSnapshot(output, new Map(), null, '2026-06-24T00:00:00Z')

    expect(result.snapshot.characters['1001'].topScore).toBe(2.0)
  })

  test('skips empty boards', () => {
    const output = makePrivateOutput({
      'board-empty': makeBoard('1001', []),
      'board-filled': makeBoard('1002', [{ score: 1.0 }]),
    })
    const result = extractSnapshot(output, new Map(), null, '2026-06-24T00:00:00Z')

    expect(result.snapshot.characters['1001']).toBeUndefined()
    expect(result.snapshot.characters['1002']).toBeDefined()
  })

  test('breaks ties by characterId alphabetically', () => {
    const output = makePrivateOutput({
      'board-b': makeBoard('1002', [{ score: 1.5 }]),
      'board-a': makeBoard('1001', [{ score: 1.5 }]),
    })
    const result = extractSnapshot(output, new Map(), null, '2026-06-24T00:00:00Z')

    expect(result.snapshot.characters['1001'].rank).toBe(1)
    expect(result.snapshot.characters['1002'].rank).toBe(2)
  })

  test('uses totalCounts correctly', () => {
    const output = makePrivateOutput({
      board: makeBoard('1001', [{ score: 1.0 }]),
    })
    const totalCounts = new Map([['1001', 42]])
    const result = extractSnapshot(output, totalCounts, null, '2026-06-24T00:00:00Z')

    expect(result.snapshot.characters['1001'].entryCount).toBe(42)
  })

  test('defaults entryCount to 0 for missing totalCounts', () => {
    const output = makePrivateOutput({
      board: makeBoard('1001', [{ score: 1.0 }]),
    })
    const result = extractSnapshot(output, new Map(), null, '2026-06-24T00:00:00Z')

    expect(result.snapshot.characters['1001'].entryCount).toBe(0)
  })

  test('watermark carries forward from previous snapshot', () => {
    const output = makePrivateOutput({
      board: makeBoard('1001', [{ score: 1.5 }]),
    })
    const previous: LeaderboardSnapshot = {
      generatedAt: '2026-06-23T00:00:00Z',
      characters: {
        '1001': { topScore: 2.0, highWatermark: 2.0, rank: 1, entryCount: 10 },
      },
    }
    const result = extractSnapshot(output, new Map(), previous, '2026-06-24T00:00:00Z')

    expect(result.snapshot.characters['1001'].highWatermark).toBe(2.0)
    expect(result.snapshot.characters['1001'].topScore).toBe(1.5)
  })

  test('watermark initializes to topScore when no previous snapshot', () => {
    const output = makePrivateOutput({
      board: makeBoard('1001', [{ score: 1.8 }]),
    })
    const result = extractSnapshot(output, new Map(), null, '2026-06-24T00:00:00Z')

    expect(result.snapshot.characters['1001'].highWatermark).toBe(1.8)
  })

  test('topBuildIds has entries for each character with 12-char hex strings', () => {
    const output = makePrivateOutput({
      'board-a': makeBoard('1001', [{ score: 2.0 }]),
      'board-b': makeBoard('1002', [{ score: 1.5 }]),
    })
    const result = extractSnapshot(output, new Map(), null, '2026-06-24T00:00:00Z')

    expect(result.topBuildIds.size).toBe(2)
    expect(result.topBuildIds.has('1001' as CharacterId)).toBe(true)
    expect(result.topBuildIds.has('1002' as CharacterId)).toBe(true)
    for (const buildId of result.topBuildIds.values()) {
      expect(buildId).toMatch(/^[0-9a-f]{12}$/)
    }
  })
})

describe('diffSnapshots', () => {
  test('cold start (null previous) returns no events', () => {
    const current: LeaderboardSnapshot = {
      generatedAt: '2026-06-24T00:00:00Z',
      characters: {
        '1001': { topScore: 2.0, highWatermark: 2.0, rank: 1, entryCount: 10 },
      },
    }
    const events = diffSnapshots(current, null, new Map(), '2026-06-24')

    expect(events).toEqual([])
  })

  test('new character emits NEW_CHARACTER with correct fields', () => {
    const previous: LeaderboardSnapshot = {
      generatedAt: '2026-06-23T00:00:00Z',
      characters: {},
    }
    const current: LeaderboardSnapshot = {
      generatedAt: '2026-06-24T00:00:00Z',
      characters: {
        '1001': { topScore: 2.0, highWatermark: 2.0, rank: 1, entryCount: 15 },
      },
    }
    const buildIds = new Map<CharacterId, string>([['1001' as CharacterId, 'abc123def456']])
    const events = diffSnapshots(current, previous, buildIds, '2026-06-24')

    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      type: TimelineEventType.NEW_CHARACTER,
      characterId: '1001',
      date: '2026-06-24',
      score: 2.0,
      rank: 1,
      entryCount: 15,
      buildId: 'abc123def456',
    })
  })

  test('score exceeding watermark at display precision emits NEW_BEST', () => {
    const previous: LeaderboardSnapshot = {
      generatedAt: '2026-06-23T00:00:00Z',
      characters: {
        '1001': { topScore: 1.5, highWatermark: 1.5, rank: 2, entryCount: 10 },
      },
    }
    const current: LeaderboardSnapshot = {
      generatedAt: '2026-06-24T00:00:00Z',
      characters: {
        '1001': { topScore: 1.502, highWatermark: 1.502, rank: 1, entryCount: 12 },
      },
    }
    const buildIds = new Map<CharacterId, string>([['1001' as CharacterId, 'aaa111bbb222']])
    const events = diffSnapshots(current, previous, buildIds, '2026-06-24')

    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      type: TimelineEventType.NEW_BEST,
      characterId: '1001',
      date: '2026-06-24',
      score: 1.502,
      previousScore: 1.5,
      rank: 1,
      previousRank: 2,
      buildId: 'aaa111bbb222',
    })
  })

  test('sub-display-precision score increase does NOT emit', () => {
    const previous: LeaderboardSnapshot = {
      generatedAt: '2026-06-23T00:00:00Z',
      characters: {
        '1001': { topScore: 1.500, highWatermark: 1.500, rank: 1, entryCount: 10 },
      },
    }
    const current: LeaderboardSnapshot = {
      generatedAt: '2026-06-24T00:00:00Z',
      characters: {
        '1001': { topScore: 1.5009, highWatermark: 1.5009, rank: 1, entryCount: 10 },
      },
    }
    const events = diffSnapshots(current, previous, new Map(), '2026-06-24')

    expect(events).toEqual([])
  })

  test('score decrease ignored', () => {
    const previous: LeaderboardSnapshot = {
      generatedAt: '2026-06-23T00:00:00Z',
      characters: {
        '1001': { topScore: 2.0, highWatermark: 2.0, rank: 1, entryCount: 10 },
      },
    }
    const current: LeaderboardSnapshot = {
      generatedAt: '2026-06-24T00:00:00Z',
      characters: {
        '1001': { topScore: 1.8, highWatermark: 2.0, rank: 1, entryCount: 10 },
      },
    }
    const events = diffSnapshots(current, previous, new Map(), '2026-06-24')

    expect(events).toEqual([])
  })

  test('rank-only change with same score ignored', () => {
    const previous: LeaderboardSnapshot = {
      generatedAt: '2026-06-23T00:00:00Z',
      characters: {
        '1001': { topScore: 1.5, highWatermark: 1.5, rank: 1, entryCount: 10 },
      },
    }
    const current: LeaderboardSnapshot = {
      generatedAt: '2026-06-24T00:00:00Z',
      characters: {
        '1001': { topScore: 1.5, highWatermark: 1.5, rank: 3, entryCount: 10 },
      },
    }
    const events = diffSnapshots(current, previous, new Map(), '2026-06-24')

    expect(events).toEqual([])
  })

  test('score increase with rank worsening is a valid NEW_BEST', () => {
    const previous: LeaderboardSnapshot = {
      generatedAt: '2026-06-23T00:00:00Z',
      characters: {
        '1001': { topScore: 1.5, highWatermark: 1.5, rank: 1, entryCount: 10 },
      },
    }
    const current: LeaderboardSnapshot = {
      generatedAt: '2026-06-24T00:00:00Z',
      characters: {
        '1001': { topScore: 1.502, highWatermark: 1.502, rank: 3, entryCount: 10 },
      },
    }
    const buildIds = new Map<CharacterId, string>([['1001' as CharacterId, 'xyz789abc012']])
    const events = diffSnapshots(current, previous, buildIds, '2026-06-24')

    expect(events).toHaveLength(1)
    expect(events[0].type).toBe(TimelineEventType.NEW_BEST)
    expect(events[0]).toMatchObject({
      score: 1.502,
      previousScore: 1.5,
      rank: 3,
      previousRank: 1,
    })
  })

  test('build cycling blocked: score returns to previous level after drop does not exceed watermark', () => {
    const previous: LeaderboardSnapshot = {
      generatedAt: '2026-06-23T00:00:00Z',
      characters: {
        '1001': { topScore: 1.8, highWatermark: 2.0, rank: 1, entryCount: 10 },
      },
    }
    const current: LeaderboardSnapshot = {
      generatedAt: '2026-06-24T00:00:00Z',
      characters: {
        '1001': { topScore: 2.0, highWatermark: 2.0, rank: 1, entryCount: 10 },
      },
    }
    const events = diffSnapshots(current, previous, new Map(), '2026-06-24')

    expect(events).toEqual([])
  })
})

describe('deduplicateAndMerge', () => {
  test('same-day same-character: new event replaces existing', () => {
    const newEvent = {
      type: TimelineEventType.NEW_BEST as const,
      characterId: '1001' as CharacterId,
      date: '2026-06-24',
      score: 2.5,
      previousScore: 2.0,
      rank: 1,
      previousRank: 1,
      buildId: 'aaa',
    }
    const existingEvent = {
      type: TimelineEventType.NEW_BEST as const,
      characterId: '1001' as CharacterId,
      date: '2026-06-24',
      score: 2.2,
      previousScore: 2.0,
      rank: 1,
      previousRank: 1,
      buildId: 'bbb',
    }
    const merged = deduplicateAndMerge([newEvent], [existingEvent], 50)

    expect(merged).toHaveLength(1)
    expect(merged[0].score).toBe(2.5)
    expect((merged[0] as any).buildId).toBe('aaa')
  })

  test('cross-day events preserved', () => {
    const day1 = {
      type: TimelineEventType.NEW_BEST as const,
      characterId: '1001' as CharacterId,
      date: '2026-06-23',
      score: 2.0,
      previousScore: 1.5,
      rank: 1,
      previousRank: 2,
      buildId: 'aaa',
    }
    const day2 = {
      type: TimelineEventType.NEW_BEST as const,
      characterId: '1001' as CharacterId,
      date: '2026-06-24',
      score: 2.5,
      previousScore: 2.0,
      rank: 1,
      previousRank: 1,
      buildId: 'bbb',
    }
    const merged = deduplicateAndMerge([day2], [day1], 50)

    expect(merged).toHaveLength(2)
  })

  test('deterministic sorting newest-first', () => {
    const events = [
      {
        type: TimelineEventType.NEW_BEST as const,
        characterId: '1001' as CharacterId,
        date: '2026-06-22',
        score: 1.5,
        previousScore: 1.0,
        rank: 1,
        previousRank: 1,
        buildId: 'a',
      },
      {
        type: TimelineEventType.NEW_BEST as const,
        characterId: '1002' as CharacterId,
        date: '2026-06-24',
        score: 2.5,
        previousScore: 2.0,
        rank: 1,
        previousRank: 1,
        buildId: 'b',
      },
      {
        type: TimelineEventType.NEW_CHARACTER as const,
        characterId: '1003' as CharacterId,
        date: '2026-06-23',
        score: 1.8,
        rank: 1,
        entryCount: 5,
        buildId: 'c',
      },
    ]
    const merged = deduplicateAndMerge(events, [], 50)

    expect(merged[0].date).toBe('2026-06-24')
    expect(merged[1].date).toBe('2026-06-23')
    expect(merged[2].date).toBe('2026-06-22')
  })

  test('cap at maxEvents after merge', () => {
    const events = Array.from({ length: 10 }, (_, i) => ({
      type: TimelineEventType.NEW_BEST as const,
      characterId: `char-${i}` as CharacterId,
      date: `2026-06-${String(10 + i).padStart(2, '0')}`,
      score: i + 1,
      previousScore: i,
      rank: 1,
      previousRank: 1,
      buildId: `id-${i}`,
    }))
    const merged = deduplicateAndMerge(events, [], 3)

    expect(merged).toHaveLength(3)
    expect(merged[0].date).toBe('2026-06-19')
    expect(merged[2].date).toBe('2026-06-17')
  })
})

describe('path derivation', () => {
  test('deriveTimelinePath produces correct sibling of public output', () => {
    const result = deriveTimelinePath('./public/leaderboard/leaderboard.json')
    const expected = cwd() + '/public/leaderboard/leaderboard-timeline.json'
    const normalized = result.replace(/\\/g, '/')
    const normalizedExpected = expected.replace(/\\/g, '/')

    expect(normalized).toBe(normalizedExpected)
  })

  test('deriveSnapshotPath produces correct sibling of DB path', () => {
    const result = deriveSnapshotPath('./data/cache.sqlite')
    const expected = cwd() + '/data/leaderboard-snapshot.json'
    const normalized = result.replace(/\\/g, '/')
    const normalizedExpected = expected.replace(/\\/g, '/')

    expect(normalized).toBe(normalizedExpected)
  })
})

describe('displayScore', () => {
  test('converts score to truncated integer', () => {
    expect(displayScore(1.754)).toBe(1754)
  })

  test('truncates, does not round', () => {
    expect(displayScore(1.7549)).toBe(1754)
  })
})
