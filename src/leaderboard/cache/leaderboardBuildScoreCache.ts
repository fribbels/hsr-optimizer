import {
  CACHE_TABLE,
  compactDatabase,
  openLeaderboardBuildScoreCacheDatabase,
  readSqliteChanges,
} from 'leaderboard/cache/leaderboardBuildScoreCacheDb'
import {
  createLeaderboardBuildScoreCacheValue,
  parseLeaderboardBuildScoreCacheValue,
} from 'leaderboard/cache/leaderboardBuildScoreCacheValue'
import { emptyBuildScoreCacheStats } from 'leaderboard/shared/metrics'
import {
  homeDir,
  resolvePath,
  sleepSync,
  type SqliteDatabase,
  type SqliteStatement,
} from 'leaderboard/shared/nodeFacade'
import type { LeaderboardBuildScore } from 'leaderboard/shared/scoreLeaderboardBuild'
import type {
  LeaderboardBuildScoreCache as LeaderboardBuildScoreCacheContract,
  LeaderboardBuildScoreCachePruneOptions,
  LeaderboardBuildScoreCachePruneStats,
  LeaderboardBuildScoreCacheStats,
} from 'leaderboard/shared/types'

export { buildLeaderboardBuildScoreCacheKey, buildStrippedRelicHash } from 'leaderboard/cache/leaderboardBuildScoreKey'

const DEFAULT_DB_PATH = resolvePath(homeDir(), 'leaderboard-cache/leaderboard-build-score-cache.sqlite')
const DEFAULT_FLUSH_INTERVAL = 100

// Bounds buffered work lost when the pool terminates without draining.
const DEFAULT_FLUSH_INTERVAL_MS = 5000

const FLUSH_MAX_ATTEMPTS = 5
const FLUSH_RETRY_BASE_MS = 100

export type LeaderboardBuildScoreCacheOptions = {
  dbPath?: string,
  leaderboardVersionsHash: string,
  flushInterval?: number,
  flushIntervalMs?: number,
}

// node:sqlite exposes the SQLite result code as `errcode`; message is a fallback.
const SQLITE_BUSY_ERRCODE = 5
const SQLITE_LOCKED_ERRCODE = 6

type SqliteErrorLike = Error & { errcode?: number }

function isBusyError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const errcode = (error as SqliteErrorLike).errcode
  if (errcode === SQLITE_BUSY_ERRCODE || errcode === SQLITE_LOCKED_ERRCODE) return true

  return error.message.includes('database is locked')
}

type LeaderboardBuildScorePendingWrite = {
  key: string,
  leaderboardVersionsHash: string,
  valueJson: string,
  createdAt: string,
}

type LeaderboardBuildScoreCacheRow = {
  value: string,
}

export class LeaderboardBuildScoreCache implements LeaderboardBuildScoreCacheContract {
  private readonly leaderboardVersionsHash: string
  private readonly flushInterval: number
  private readonly flushIntervalMs: number
  private lastFlushMs = performance.now()
  private readonly db: SqliteDatabase

  private readonly stmtSelect: SqliteStatement<LeaderboardBuildScoreCacheRow>
  private readonly stmtInsert: SqliteStatement
  private readonly stmtDelete: SqliteStatement
  private readonly stmtClear: SqliteStatement
  private readonly stmtPrune: SqliteStatement
  private readonly stmtBegin: SqliteStatement
  private readonly stmtCommit: SqliteStatement
  private readonly stmtRollback: SqliteStatement

  private readonly l1 = new Map<string, LeaderboardBuildScore>()
  private readonly pending = new Map<string, Promise<LeaderboardBuildScore | null>>()
  private readonly cacheStats: LeaderboardBuildScoreCacheStats = emptyBuildScoreCacheStats()
  private readonly writeBuffer: LeaderboardBuildScorePendingWrite[] = []

  constructor(options: LeaderboardBuildScoreCacheOptions) {
    this.leaderboardVersionsHash = options.leaderboardVersionsHash
    this.flushInterval = options.flushInterval ?? DEFAULT_FLUSH_INTERVAL
    this.flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS
    this.db = openLeaderboardBuildScoreCacheDatabase(options.dbPath ?? DEFAULT_DB_PATH)

    this.stmtSelect = this.db.prepare<LeaderboardBuildScoreCacheRow>(
      `SELECT value FROM ${CACHE_TABLE} WHERE key = ?`,
    )
    this.stmtInsert = this.db.prepare(`
      INSERT OR REPLACE INTO ${CACHE_TABLE}
        (key, leaderboard_versions_hash, value, created_at)
      VALUES (?, ?, ?, ?)
    `)
    this.stmtDelete = this.db.prepare(`DELETE FROM ${CACHE_TABLE} WHERE key = ?`)
    this.stmtClear = this.db.prepare(`DELETE FROM ${CACHE_TABLE}`)
    this.stmtPrune = this.db.prepare(`
      DELETE FROM ${CACHE_TABLE}
      WHERE leaderboard_versions_hash <> ?
    `)
    this.stmtBegin = this.db.prepare('BEGIN IMMEDIATE')
    this.stmtCommit = this.db.prepare('COMMIT')
    this.stmtRollback = this.db.prepare('ROLLBACK')
  }

  get(key: string): LeaderboardBuildScore | null {
    const cached = this.readCachedScore(key)
    if (cached != null) return cached

    this.cacheStats.misses++
    return null
  }

  set(key: string, score: LeaderboardBuildScore): void {
    this.l1.set(key, score)
    this.cacheStats.writes++

    const createdAt = new Date().toISOString()
    const cacheValue = createLeaderboardBuildScoreCacheValue(key, score, createdAt)

    this.writeBuffer.push({
      key,
      leaderboardVersionsHash: this.leaderboardVersionsHash,
      valueJson: JSON.stringify(cacheValue),
      createdAt,
    })

    if (
      this.writeBuffer.length >= this.flushInterval
      || performance.now() - this.lastFlushMs >= this.flushIntervalMs
    ) {
      this.flush()
    }
  }

  getOrCompute(
    key: string,
    compute: () => Promise<LeaderboardBuildScore | null>,
  ): Promise<LeaderboardBuildScore | null> {
    const cached = this.readCachedScore(key)
    if (cached != null) return Promise.resolve(cached)

    const existingPending = this.pending.get(key)
    if (existingPending) return existingPending

    this.cacheStats.misses++
    const promise = Promise.resolve()
      .then(compute)
      .then((score) => {
        if (score != null) {
          this.set(key, score)
        }
        return score
      })
      .finally(() => {
        this.pending.delete(key)
      })
    this.pending.set(key, promise)
    return promise
  }

  flush(): void {
    if (this.writeBuffer.length === 0) return

    const startedAt = performance.now()
    const rowCount = this.writeBuffer.length

    for (let attempt = 1; attempt <= FLUSH_MAX_ATTEMPTS; attempt++) {
      try {
        this.commitWriteBuffer()

        const elapsedMs = performance.now() - startedAt
        this.cacheStats.flushes++
        this.cacheStats.flushedRows += rowCount
        this.cacheStats.flushMs += elapsedMs
        this.cacheStats.maxFlushMs = Math.max(this.cacheStats.maxFlushMs, elapsedMs)
        this.lastFlushMs = performance.now()
        return
      } catch (error) {
        // Only lock contention is transient; corruption and disk-full must surface.
        if (!isBusyError(error) || attempt === FLUSH_MAX_ATTEMPTS) throw error

        this.cacheStats.flushRetries++
        sleepSync(FLUSH_RETRY_BASE_MS * attempt)
      }
    }
  }

  private commitWriteBuffer(): void {
    let transactionStarted = false
    try {
      this.stmtBegin.run()
      transactionStarted = true

      for (const write of this.writeBuffer) {
        this.stmtInsert.run(
          write.key,
          write.leaderboardVersionsHash,
          write.valueJson,
          write.createdAt,
        )
      }

      this.stmtCommit.run()
      transactionStarted = false
      this.writeBuffer.length = 0
    } catch (error) {
      if (transactionStarted) {
        try {
          this.stmtRollback.run()
        } catch {
          // Preserve the original SQLite error from the failed transaction.
        }
      }
      throw error
    }
  }

  clear(): LeaderboardBuildScoreCachePruneStats {
    this.writeBuffer.length = 0
    this.pending.clear()
    this.l1.clear()
    const result = this.stmtClear.run()
    compactDatabase(this.db)
    return { deletedRows: readSqliteChanges(result) }
  }

  prune(pruneOptions: LeaderboardBuildScoreCachePruneOptions): LeaderboardBuildScoreCachePruneStats {
    this.flush()
    this.l1.clear()
    const result = this.stmtPrune.run(
      pruneOptions.leaderboardVersionsHash,
    )
    compactDatabase(this.db)
    return { deletedRows: readSqliteChanges(result) }
  }

  stats(): LeaderboardBuildScoreCacheStats {
    return { ...this.cacheStats }
  }

  private readCachedScore(key: string): LeaderboardBuildScore | null {
    const l1Score = this.l1.get(key)
    if (l1Score != null) {
      this.cacheStats.l1Hits++
      return l1Score
    }

    return this.readSqliteScore(key)
  }

  private readSqliteScore(key: string): LeaderboardBuildScore | null {
    const row = this.stmtSelect.get(key)
    if (row == null) return null

    const parsed = parseLeaderboardBuildScoreCacheValue(row.value, key)
    if (parsed == null) {
      this.deleteCorruptRow(key)
      return null
    }

    this.l1.set(key, parsed.score)
    this.cacheStats.sqliteHits++
    return parsed.score
  }

  private deleteCorruptRow(key: string): void {
    this.stmtDelete.run(key)
    this.cacheStats.corruptRowsDeleted++
  }
}
