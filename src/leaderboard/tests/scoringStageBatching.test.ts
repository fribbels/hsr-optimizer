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
  FailureEntry,
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

describe('runScoringStage batching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    workerPoolMocks.terminate.mockResolvedValue(undefined)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('stops a public character after a successful non-qualifying batch', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 201)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5)] }))
      .mockResolvedValueOnce(scoreResult())

    const result = await runScoringStage(makeInput(profiles))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(2)
    expect(result.entries).toEqual([makeEntry(CHARACTER_ID, 1.5)])
    expect(result.failures).toEqual([])
  })

  test('does not stop before the character has emitted public-threshold output', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 201)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.49)] }))
      .mockResolvedValueOnce(scoreResult())
      .mockResolvedValueOnce(scoreResult())

    await runScoringStage(makeInput(profiles))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(3)
  })

  test('keeps a failed character active for the next batch', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 201)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5)] }))
      .mockResolvedValueOnce(scoreResult({
        failures: [{
          uid: 'uid-101',
          characterId: CHARACTER_ID,
          error: 'scoring failed',
        }],
      }))
      .mockResolvedValueOnce(scoreResult())

    await runScoringStage(makeInput(profiles))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(3)
  })

  test('keeps a public character active while any round entry qualifies', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 301)
    workerPoolMocks.scoreProfiles
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5)] }))
      .mockResolvedValueOnce(scoreResult({ entries: [makeEntry(CHARACTER_ID, 1.5)] }))
      .mockResolvedValueOnce(scoreResult())

    await runScoringStage(makeInput(profiles))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(3)
  })

  test('non-batching path submits the original profiles once', async () => {
    const profiles = makeProfiles(CHARACTER_ID, 2)
    workerPoolMocks.scoreProfiles.mockResolvedValueOnce(scoreResult({
      entries: [makeEntry(CHARACTER_ID, 1.5)],
    }))

    await runScoringStage(makeInput(profiles, { batching: false }))

    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledTimes(1)
    expect(workerPoolMocks.scoreProfiles).toHaveBeenCalledWith({
      profiles,
      versions: VERSIONS,
      globalVersion: 1,
    })
  })
})

const VERSIONS: LeaderboardVersionFile = {
  global: 1,
  characters: {},
  lightCones: {},
}

function makeInput(
  profiles: LeaderboardScoringProfile[],
  overrides: { batching?: boolean } = {},
): RunScoringStageInput {
  return {
    profiles,
    versions: VERSIONS,
    globalVersion: 1,
    workerCount: 1,
    runtimeConfig: {} as LeaderboardScoreWorkerRuntimeConfig,
    workerScriptUrl: WORKER_SCRIPT_URL,
    batching: overrides.batching ?? true,
  }
}

function makeProfiles(characterId: string, count: number): LeaderboardScoringProfile[] {
  return Array.from({ length: count }, (_, index) => ({
    uid: `uid-${index}`,
    fetchedAt: 1,
    payloadHash: `hash-${index}`,
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

function makeEntry(characterId: string, score: number): PrivateRankedEntry {
  return {
    characterId,
    score,
  } as PrivateRankedEntry
}

function scoreResult(input: {
  entries?: PrivateRankedEntry[],
  failures?: FailureEntry[],
} = {}) {
  return {
    entries: input.entries ?? [],
    failures: input.failures ?? [],
    buildScoreCacheStats: emptyBuildScoreCacheStats(),
    metrics: emptyMetricsSnapshot(),
  }
}
