import type { LeaderboardCliOptions } from 'leaderboard/shared/cliOptions'
import type {
  ExportParseSummary,
  FailureEntry,
  LeaderboardBuildScoreCacheStats,
  LeaderboardMetricsSnapshot,
  LeaderboardScoringProfile,
  PrivateRankedEntry,
  PrivateRankedOutput,
} from 'leaderboard/shared/types'
import { getSimScoreGrade } from 'lib/scoring/dpsScore'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'

function getCharacterLogName(characterId: string): string {
  const name = getGameMetadata().characters[characterId as CharacterId]?.name ?? characterId
  const sep = name.indexOf('•')
  return sep >= 0 ? name.substring(sep + 1).trimStart() : name
}

export function printResolvedConfig(options: LeaderboardCliOptions): void {
  console.log('Resolved leaderboard config:')
  console.log(JSON.stringify(options, null, 2))
}

export function printLeaderboardResults(privateOutput: PrivateRankedOutput, topNPublic: number): void {
  console.log('\n========== LEADERBOARD RESULTS ==========')
  for (const [, board] of Object.entries(privateOutput.boards)) {
    const name = getCharacterLogName(board.characterId)
    const topEntries = board.entries.slice(0, topNPublic)
    console.log(`\n--- ${name} (${board.configType.toUpperCase()} ${board.teamId}) - ${board.entries.length} ranked ---`)
    for (const e of topEntries) {
      const pct = (e.score * 100).toFixed(1)
      const grade = getSimScoreGrade(e.score, true, 6)
      const eidolon = e.data.character.r || 0
      const lc = e.data.character.q
      const lcStr = lc ? `LC:${lc.t} S${lc.r}` : 'no LC'
      console.log(`  #${String(e.rank).padStart(2)}  ${pct.padStart(6)}%  ${grade.padEnd(5)}  E${eidolon}  ${lcStr.padEnd(16)}`)
    }
  }
  console.log('\n=========================================')
}

export function printTopNCoverageAnalysis(privateOutput: PrivateRankedOutput, topNPublic: number): void {
  const MIN_AEON_SCORE = 1.50

  type CharStats = {
    boards: number,
    survivors: number,
    scored: number,
    aeonUids: Set<string>,
    topNAeonUids: Set<string>,
    maxRankTopNAeons: number,
  }
  const charStats = new Map<string, CharStats>()

  for (const [, board] of Object.entries(privateOutput.boards)) {
    const charId = board.characterId

    let stats = charStats.get(charId)
    if (!stats) {
      stats = { boards: 0, survivors: board.completeness.totalScoredEntries, scored: 0, aeonUids: new Set(), topNAeonUids: new Set(), maxRankTopNAeons: 0 }
      charStats.set(charId, stats)
    }
    stats.boards++
    stats.scored += board.completeness.totalScoredEntries

    for (const entry of board.entries) {
      if (entry.score >= MIN_AEON_SCORE) {
        stats.aeonUids.add(entry.uidHash)
      }
    }

    const publicEntries = board.entries.slice(0, topNPublic)
    for (const entry of publicEntries) {
      if (entry.score >= MIN_AEON_SCORE) {
        stats.topNAeonUids.add(entry.uidHash)
        if (entry.preFilterRank > stats.maxRankTopNAeons) {
          stats.maxRankTopNAeons = entry.preFilterRank
        }
      }
    }
  }

  const sorted = [...charStats.entries()]
    .map(([charId, stats]) => ({
      charId,
      name: getCharacterLogName(charId),
      boards: stats.boards,
      survivors: stats.survivors,
      scored: stats.scored,
      aeons: stats.aeonUids.size,
      topN: stats.topNAeonUids.size,
      need: stats.maxRankTopNAeons,
    }))
    .sort((a, b) => b.need - a.need)

  const globalMaxRank = sorted.reduce((max, s) => Math.max(max, s.need), 0)

  console.log('\n========== TOP-N COVERAGE ANALYSIS ==========')
  console.log('Question: what --top-n covers the best 100 aeons (>=150%) per board?')
  console.log()
  console.log(`${'Character'.padEnd(20)} ${'Aeons'.padStart(5)} ${'TopN'.padStart(5)} ${'k'.padStart(2)} ${'Surv'.padStart(5)} ${'Scored'.padStart(6)} ${'Need'.padStart(5)}`)
  console.log('-'.repeat(50))
  for (const s of sorted) {
    const need = s.need > 0 ? String(s.need) : '-'
    console.log(
      `${s.name.padEnd(20)} ${String(s.aeons).padStart(5)} ${String(s.topN).padStart(5)} ${String(s.boards).padStart(2)} ${String(s.survivors).padStart(5)} ${String(s.scored).padStart(6)} ${need.padStart(5)}`,
    )
  }
  console.log('-'.repeat(50))
  console.log(`Global max pre-filter rank needed for top-${topNPublic} aeons: ${globalMaxRank}`)
  const margin = Math.ceil(globalMaxRank * 1.5)
  console.log(`Recommended --top-n with 1.5x margin: ${margin}`)
  console.log('==============================================\n')
}

type RunSummaryInput = {
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
  exportProfileCount: number,
  parseSummary: ExportParseSummary,
  profiles: LeaderboardScoringProfile[],
  totalCandidates: number,
  metrics: LeaderboardMetricsSnapshot,
  workerCount: number,
  buildScoreCacheDbPath: string,
  freshRun: boolean,
  pruneBuildScoreCache: boolean,
  topN: number,
  topNPublic: number,
  parseElapsedMs: number,
  prefilterElapsedMs: number,
  scoringElapsedMs: number,
  runElapsedMs: number,
}

export function printRunSummary(input: RunSummaryInput): void {
  const { entries, failures, buildScoreCacheStats, profiles } = input
  const scoringSec = input.scoringElapsedMs / 1000
  const runSec = input.runElapsedMs / 1000

  const perCharStats: Record<string, { entries: number, failures: number }> = {}
  for (const e of entries) {
    const key = getCharacterLogName(String(e.characterId))
    const stat = perCharStats[key] ??= { entries: 0, failures: 0 }
    stat.entries++
  }
  for (const f of failures) {
    const key = getCharacterLogName(String(f.characterId))
    const stat = perCharStats[key] ??= { entries: 0, failures: 0 }
    stat.failures++
  }

  console.log('\n========== RUN SUMMARY ==========')
  console.log(`Config:`)
  console.log(`  workerMode: profile`)
  console.log(`  workerCount: ${input.workerCount}`)
  console.log(`  buildScoreCacheDbPath: ${input.buildScoreCacheDbPath}`)
  console.log(`  freshRun: ${input.freshRun}`)
  console.log(`  pruneBuildScoreCache: ${input.pruneBuildScoreCache}`)
  console.log(`  topN: ${input.topN}`)
  console.log(`  topNPublic: ${input.topNPublic}`)
  console.log(`Input:`)
  console.log(`  exportProfiles: ${input.exportProfileCount}`)
  console.log(`  submitted: ${profiles.length} profiles, ${input.totalCandidates} candidates`)
  console.log(`Scoring:`)
  console.log(`  entries: ${entries.length}`)
  console.log(`  failures: ${failures.length}`)
  for (const [charName, stat] of Object.entries(perCharStats)) {
    console.log(`    ${charName}: ${stat.entries} entries, ${stat.failures} failures`)
  }
  console.log(`Timing:`)
  console.log(`  parse: ${(input.parseElapsedMs / 1000).toFixed(1)}s`)
  console.log(`  prefilter: ${(input.prefilterElapsedMs / 1000).toFixed(1)}s`)
  console.log(`  scoring: ${scoringSec.toFixed(1)}s`)
  console.log(`  total: ${runSec.toFixed(1)}s`)
  console.log(`Throughput:`)
  if (scoringSec > 0 && entries.length > 0) {
    console.log(`  entries/sec: ${(entries.length / scoringSec).toFixed(2)}`)
    console.log(`  profiles/sec: ${(profiles.length / scoringSec).toFixed(2)}`)
    console.log(`  candidates/sec: ${(input.totalCandidates / scoringSec).toFixed(2)}`)
  } else {
    console.log(`  (no scoring work performed)`)
  }
  console.log(`Leaderboard Build Score Cache:`)
  console.log(`  l1Hits: ${buildScoreCacheStats.l1Hits}`)
  console.log(`  sqliteHits: ${buildScoreCacheStats.sqliteHits}`)
  console.log(`  misses: ${buildScoreCacheStats.misses}`)
  console.log(`  writes: ${buildScoreCacheStats.writes}`)
  console.log(`  corruptRowsDeleted: ${buildScoreCacheStats.corruptRowsDeleted}`)
  const cacheHits = buildScoreCacheStats.l1Hits + buildScoreCacheStats.sqliteHits
  if (cacheHits + buildScoreCacheStats.misses > 0) {
    console.log(`  hitRate: ${((cacheHits / (cacheHits + buildScoreCacheStats.misses)) * 100).toFixed(1)}%`)
  }
  const { characterErrors } = input.parseSummary
  if (characterErrors.length > 0) {
    const byAvatar = new Map<number, number>()
    for (const err of characterErrors) {
      byAvatar.set(err.avatarId, (byAvatar.get(err.avatarId) ?? 0) + 1)
    }
    console.log(`Character parse errors: ${characterErrors.length}`)
    for (const [avatarId, count] of [...byAvatar.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${getCharacterLogName(String(avatarId))}: ${count}`)
    }
  }
  console.log(`Metrics:`, JSON.stringify(input.metrics, null, 2))
  console.log('=================================\n')
}
