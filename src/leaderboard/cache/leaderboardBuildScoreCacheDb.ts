import {
  cwd,
  dirnamePath,
  ensureDirectory,
  openSqliteDatabase,
  resolvePath,
  type SqliteDatabase,
  type SqliteRunResult,
} from 'leaderboard/shared/nodeFacade'

export const CACHE_TABLE = 'leaderboard_build_score_cache'

export function openLeaderboardBuildScoreCacheDatabase(dbPath: string): SqliteDatabase {
  const absPath = dbPath === ':memory:' ? ':memory:' : resolvePath(cwd(), dbPath)
  if (absPath !== ':memory:') ensureDirectory(dirnamePath(absPath))
  const db = openSqliteDatabase(absPath)
  db.exec('PRAGMA busy_timeout = 5000')
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA synchronous = NORMAL')

  migrateLegacyTable(db)

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${CACHE_TABLE} (
      key TEXT PRIMARY KEY,
      leaderboard_versions_hash TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_build_score_cache_versions
      ON ${CACHE_TABLE}(leaderboard_versions_hash)
  `)

  return db
}

export function compactDatabase(db: SqliteDatabase): void {
  db.exec('PRAGMA wal_checkpoint(TRUNCATE)')
  db.exec('VACUUM')
}

export function readSqliteChanges(result: SqliteRunResult): number {
  const changes = result.changes
  if (typeof changes === 'bigint') return Number(changes)
  return changes
}

function migrateLegacyTable(db: SqliteDatabase): void {
  const row = db.prepare(`
    SELECT COUNT(*) as cnt
    FROM pragma_table_info('${CACHE_TABLE}')
    WHERE name IN ('source_namespace_hash', 'score_mode')
  `).get() as { cnt: number } | undefined

  if (row && row.cnt > 0) {
    db.exec(`DROP TABLE ${CACHE_TABLE}`)
    db.exec('DROP INDEX IF EXISTS idx_leaderboard_build_score_cache_source')
  }
}
