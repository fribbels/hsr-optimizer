// @vitest-environment node
import { LeaderboardBuildScoreCache } from 'leaderboard/cache/leaderboardBuildScoreCache'
import type { LeaderboardBuildScore } from 'leaderboard/shared/scoreLeaderboardBuild'
import {
  afterEach,
  describe,
  expect,
  test,
} from 'vitest'

const VERSIONS_HASH = 'test-versions-hash'

const openCaches: LeaderboardBuildScoreCache[] = []

function createCache(options?: { flushInterval?: number, flushIntervalMs?: number }): LeaderboardBuildScoreCache {
  const cache = new LeaderboardBuildScoreCache({
    dbPath: ':memory:',
    leaderboardVersionsHash: VERSIONS_HASH,
    flushInterval: options?.flushInterval ?? 100,
    // Disabled by default so count-based behaviour is machine-speed independent.
    flushIntervalMs: options?.flushIntervalMs ?? Number.MAX_SAFE_INTEGER,
  })
  openCaches.push(cache)
  return cache
}

function makeScore(value: number): LeaderboardBuildScore {
  return { score: value } as unknown as LeaderboardBuildScore
}

afterEach(() => {
  openCaches.length = 0
})

describe('LeaderboardBuildScoreCache flush batching', () => {
  test('buffers writes instead of committing one transaction per set', () => {
    const cache = createCache({ flushInterval: 100 })

    for (let i = 0; i < 99; i++) {
      cache.set(`key-${i}`, makeScore(i))
    }

    expect(cache.stats().writes).toBe(99)
    expect(cache.stats().flushes).toBe(0)
  })

  test('commits a single transaction once the buffer reaches flushInterval', () => {
    const cache = createCache({ flushInterval: 100 })

    for (let i = 0; i < 100; i++) {
      cache.set(`key-${i}`, makeScore(i))
    }

    const stats = cache.stats()
    expect(stats.flushes).toBe(1)
    expect(stats.flushedRows).toBe(100)
  })

  test('flushes on elapsed time even when the buffer is not full', () => {
    const cache = createCache({ flushInterval: 100, flushIntervalMs: 0 })

    cache.set('key-a', makeScore(1))

    const stats = cache.stats()
    expect(stats.flushes).toBe(1)
    expect(stats.flushedRows).toBe(1)
  })

  test('explicit flush drains a partial buffer and is idempotent', () => {
    const cache = createCache({ flushInterval: 100 })

    cache.set('key-a', makeScore(1))
    cache.flush()
    cache.flush()

    const stats = cache.stats()
    expect(stats.flushes).toBe(1)
    expect(stats.flushedRows).toBe(1)
  })

  test('flushed rows are readable back through the cache', () => {
    const cache = createCache({ flushInterval: 100 })

    cache.set('key-a', makeScore(42))
    cache.flush()

    expect(cache.get('key-a')).not.toBeNull()
    expect(cache.get('missing-key')).toBeNull()
  })

  test('a healthy flush records no retries', () => {
    const cache = createCache({ flushInterval: 10 })

    for (let i = 0; i < 10; i++) {
      cache.set(`key-${i}`, makeScore(i))
    }

    expect(cache.stats().flushRetries).toBe(0)
  })
})
