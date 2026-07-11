import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import {
  emptyBuildScoreCacheStats,
  emptyMetricsSnapshot,
} from 'leaderboard/shared/metrics'
import type {
  LeaderboardScoreWorkerRuntimeConfig,
  LeaderboardScoringCharacter,
  LeaderboardScoringProfile,
  LeaderboardVersionFile,
  PrivateRankedEntry,
} from 'leaderboard/shared/types'
import type { RunScoringStageInput } from 'leaderboard/pipeline/scoringStage'

const workerPoolMocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  scoreProfiles: vi.fn(),
  terminate: vi.fn(),
}))

vi.mock('leaderboard/workers/profileWorkerPool', () => ({
  LeaderboardScoreWorkerPool: class {
    constructor(input: unknown) {
      workerPoolMocks.constructor(input)
    }

    scoreProfiles = workerPoolMocks.scoreProfiles
    terminate = workerPoolMocks.terminate
  },
}))

import { runScoringStage } from 'leaderboard/pipeline/scoringStage'

const CHARACTER_ID = '1307'
const WORKER_SCRIPT_URL = new URL('file:///leaderboard-worker.js')

describe('runScoringStage per-character batching', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    workerPoolMocks.terminate.mockResolvedValue(undefined)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns empty result for empty profiles', async () => {
    const result = await runScoringStage(makeInput([]))
    expect(result.entries).toEqual([])
    expect(result.failures).toEqual([])
    expect(workerPoolMocks.scoreProfiles).not.toHaveBeenCalled()
  })

  test('scores all candidates in a single batch when count <= batch size', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 50)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5)] }))

    const result = await runScoringStage(makeInput(profiles))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(1)
    expect(result.entries).toEqual([makeEntry(CHARACTER_ID, 1.5)])
  })

  test('converges when batch produces no top-K entries', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 201)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5)] }))
      .mockResolvedValueOnce(scoreResult())

    const result = await runScoringStage(makeInput(profiles))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(2)
    expect(result.entries).toEqual([makeEntry(CHARACTER_ID, 1.5)])
  })

  test('converges immediately when batch 0 produces no entries', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 201)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult())

    await runScoringStage(makeInput(profiles))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(1)
  })

  test('continues while batches produce top-K entries', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 301)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5, 'uid-a')] }))
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.8, 'uid-b')] }))
      .mockResolvedValueOnce(scoreResult())

    const result = await runScoringStage(makeInput(profiles))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(3)
    expect(result.entries).toHaveLength(2)
  })

  test('throws on scoring failures', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 50)
    workerPoolMocks.scoreProfiles.mockResolvedValueOnce({
      entries: [],
      failures: [{ uid: 'uid-1307-0', characterId: CHARACTER_ID, error: 'scoring failed' }],
      buildScoreCacheStats: emptyBuildScoreCacheStats(),
      metrics: emptyMetricsSnapshot(),
    })

    await expect(runScoringStage(makeInput(profiles)))
      .rejects.toThrow('Leaderboard scoring failed')
  })

  test('converges based on top-K displacement', async () => {
    const topNPublic = 2
    const profiles = makeProfiles(CHARACTER_ID, 301)

    let callIndex = 0
    workerPoolMocks.scoreProfiles.mockImplementation(async () => {
      callIndex++
      if (callIndex === 1) {
        return scoreResult({
          entries: [
            makeEntry(CHARACTER_ID, 1.8, 'uid-a'),
            makeEntry(CHARACTER_ID, 1.6, 'uid-b'),
          ],
        })
      }
      if (callIndex === 2) {
        return scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5, 'uid-c')] })
      }
      return scoreResult()
    })

    const result = await runScoringStage(makeInput(profiles, topNPublic))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(2)
    expect(result.entries).toHaveLength(3)
  })

  test('processes multiple characters independently', async () => {
    const charA = '1001'
    const charB = '1002'
    const profiles: LeaderboardScoringProfile[] = [
      ...makeProfiles(charA, 201),
      ...makeProfiles(charB, 50),
    ]

    const charCallCounts = new Map<string, number>()
    workerPoolMocks.scoreProfiles.mockImplementation(async (input: { profiles: LeaderboardScoringProfile[] }) => {
      const charId = String(input.profiles[0].characters[0].unconverted.avatarId)
      const count = (charCallCounts.get(charId) ?? 0) + 1
      charCallCounts.set(charId, count)
      if (charId === charA) {
        return scoreResult({ entries: count === 1 ? [makeEntry(charA, 1.5, `uid-${charA}-0`)] : [] })
      }
      return scoreResult({ entries: [makeEntry(charB, 1.2, `uid-${charB}-0`)] })
    })

    const result = await runScoringStage(makeInput(profiles))

    expect(result.entries).toHaveLength(2)
  })

  test('submits single-character profiles to worker pool', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 50)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5)] }))

    await runScoringStage(makeInput(profiles))

    const call = workerPoolMocks.scoreProfiles.mock.calls[0][0]
    for (const profile of call.profiles) {
      expect(profile.characters).toHaveLength(1)
    }
  })
})

const VERSIONS: LeaderboardVersionFile = {
  global: 1,
  characters: {},
  lightCones: {},
}

function makeInput(
  profiles: LeaderboardScoringProfile[],
  topNPublic: number = 100,
): RunScoringStageInput {
  return {
    profiles,
    versions: VERSIONS,
    globalVersion: 1,
    workerCount: 1,
    runtimeConfig: {} as LeaderboardScoreWorkerRuntimeConfig,
    workerScriptUrl: WORKER_SCRIPT_URL,
    topNPublic,
  }
}

function makeProfiles(characterId: string, count: number): LeaderboardScoringProfile[] {
  return Array.from({ length: count }, (_, index) => ({
    uid: `uid-${characterId}-${index}`,
    fetchedAt: 1,
    payloadHash: `hash-${characterId}-${index}`,
    characters: [makeCharacter(characterId, index)],
  }))
}

function makeCharacter(characterId: string, qualityOrder: number): LeaderboardScoringCharacter {
  return {
    unconverted: { avatarId: Number(characterId) } as LeaderboardScoringCharacter['unconverted'],
    minified: {} as LeaderboardScoringCharacter['minified'],
    preFilterRank: qualityOrder + 1,
    qualityOrder,
  }
}

function makeEntry(characterId: string, score: number, uid?: string): PrivateRankedEntry {
  return {
    characterId,
    score,
    uid: uid ?? `uid-${characterId}-0`,
    uidHash: `hash-${uid ?? `uid-${characterId}-0`}`,
    configType: 'dps' as PrivateRankedEntry['configType'],
    teamId: 'default',
  } as PrivateRankedEntry
}

function scoreResult(input: {
  entries?: PrivateRankedEntry[],
  failures?: Array<{ uid: string, characterId: string, error: string }>,
} = {}) {
  return {
    entries: input.entries ?? [],
    failures: input.failures ?? [],
    buildScoreCacheStats: emptyBuildScoreCacheStats(),
    metrics: emptyMetricsSnapshot(),
  }
}
