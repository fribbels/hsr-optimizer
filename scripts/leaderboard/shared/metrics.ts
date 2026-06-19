import type { LeaderboardBuildScoreCacheStats, LeaderboardMetrics, LeaderboardMetricsSnapshot } from './types'

function buildTaggedKey(name: string, tags?: Record<string, string>): string {
  if (!tags || Object.keys(tags).length === 0) return name
  const tagStr = Object.keys(tags).sort().map((k) => `${k}=${tags[k]}`).join(',')
  return `${name}:${tagStr}`
}

type TimingAggregate = { count: number; totalMs: number }

export function emptyMetricsSnapshot(): LeaderboardMetricsSnapshot {
  return {
    counters: {},
    gauges: {},
    timings: {},
  }
}

export function emptyBuildScoreCacheStats(): LeaderboardBuildScoreCacheStats {
  return {
    l1Hits: 0,
    sqliteHits: 0,
    misses: 0,
    writes: 0,
    corruptRowsDeleted: 0,
  }
}

export function createLeaderboardMetrics(): LeaderboardMetrics {
  const counters = new Map<string, number>()
  const timings = new Map<string, TimingAggregate>()
  const gauges = new Map<string, number>()

  return {
    increment(name: string, value = 1, tags?: Record<string, string>): void {
      const key = buildTaggedKey(name, tags)
      counters.set(key, (counters.get(key) ?? 0) + value)
    },

    timing(name: string, ms: number, tags?: Record<string, string>): void {
      const key = buildTaggedKey(name, tags)
      const agg = timings.get(key)
      if (agg) {
        agg.count++
        agg.totalMs += ms
      } else {
        timings.set(key, { count: 1, totalMs: ms })
      }
    },

    gauge(name: string, value: number, tags?: Record<string, string>): void {
      const key = buildTaggedKey(name, tags)
      gauges.set(key, value)
    },

    snapshot(): LeaderboardMetricsSnapshot {
      const counterSnapshot: Record<string, number> = {}
      for (const [key, value] of counters) {
        counterSnapshot[key] = value
      }

      const gaugeSnapshot: Record<string, number> = {}
      for (const [key, value] of gauges) {
        gaugeSnapshot[key] = value
      }

      const timingSnapshot: Record<string, { count: number; totalMs: number; avgMs: number }> = {}
      for (const [key, agg] of timings) {
        timingSnapshot[key] = { count: agg.count, totalMs: agg.totalMs, avgMs: agg.count > 0 ? agg.totalMs / agg.count : 0 }
      }

      return {
        counters: counterSnapshot,
        gauges: gaugeSnapshot,
        timings: timingSnapshot,
      }
    },
  }
}
