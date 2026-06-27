import {
  boardKeyFromEntry,
  entryReplacementKey,
} from 'leaderboard/output/privateOutput'
import { FixedSizeMinQueue } from 'lib/dataStructures/fixedSizeMinQueue'
import {
  emptyBuildScoreCacheStats,
  emptyMetricsSnapshot,
  sumBuildScoreCacheStats,
  sumMetricSnapshots,
} from 'leaderboard/shared/metrics'
import type {
  FailureEntry,
  LeaderboardBuildScoreCacheStats,
  LeaderboardMetricsSnapshot,
  LeaderboardScoreWorkerRuntimeConfig,
  LeaderboardScoringCharacter,
  LeaderboardScoringProfile,
  LeaderboardVersionFile,
  PrivateRankedEntry,
} from 'leaderboard/shared/types'
import { LeaderboardScoreWorkerPool } from 'leaderboard/workers/profileWorkerPool'

const BATCH_PERCENT = 15
const BATCH_MIN = 100
const BATCH_MAX = 500

export type RunScoringStageInput = {
  profiles: LeaderboardScoringProfile[],
  versions: LeaderboardVersionFile,
  globalVersion: number,
  workerCount: number,
  runtimeConfig: LeaderboardScoreWorkerRuntimeConfig,
  workerScriptUrl: URL,
  topNPublic: number,
}

export type RunScoringStageResult = {
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
  metrics: LeaderboardMetricsSnapshot,
  elapsedMs: number,
}

export async function runScoringStage(input: RunScoringStageInput): Promise<RunScoringStageResult> {
  const scoringStartMs = performance.now()
  if (input.profiles.length === 0) {
    return {
      entries: [],
      failures: [],
      buildScoreCacheStats: emptyBuildScoreCacheStats(),
      metrics: emptyMetricsSnapshot(),
      elapsedMs: performance.now() - scoringStartMs,
    }
  }

  const workerPool = new LeaderboardScoreWorkerPool({
    workerScriptUrl: input.workerScriptUrl,
    workerCount: input.workerCount,
    runtimeConfig: input.runtimeConfig,
  })
  console.log(`Leaderboard profile worker_threads enabled: ${input.workerCount} workers`)

  let scoringError: unknown
  let scoringResult: Omit<RunScoringStageResult, 'elapsedMs'> | null = null
  try {
    scoringResult = await runPerCharacterBatchedScoring(workerPool, input)
  } catch (error: unknown) {
    scoringError = error
  }
  const scoringElapsedMs = performance.now() - scoringStartMs

  const cleanupError = await terminateWorkerPool(workerPool)
  if (scoringError != null) {
    if (cleanupError != null) {
      console.warn('Leaderboard score worker cleanup failed after scoring error:', cleanupError)
    }
    throw scoringError
  }
  if (cleanupError != null) {
    throw cleanupError
  }
  if (scoringResult == null) {
    throw new Error('Leaderboard scoring finished without a result')
  }

  return { ...scoringResult, elapsedMs: scoringElapsedMs }
}

// ---------------------------------------------------------------------------
// Per-character batched scoring
// ---------------------------------------------------------------------------

type CharacterCandidate = {
  uid: string,
  fetchedAt: number,
  payloadHash: string,
  character: LeaderboardScoringCharacter,
  qualityOrder: number,
}

type CharacterResult = {
  characterId: string,
  entries: PrivateRankedEntry[],
  buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
  metrics: LeaderboardMetricsSnapshot,
  candidatesScored: number,
  totalCandidates: number,
  batchesRun: number,
  converged: boolean,
}

function groupCandidatesByCharacter(profiles: LeaderboardScoringProfile[]): Map<string, CharacterCandidate[]> {
  const byChar = new Map<string, CharacterCandidate[]>()
  for (const profile of profiles) {
    for (const character of profile.characters) {
      const charId = String(character.unconverted.avatarId)
      let list = byChar.get(charId)
      if (!list) {
        list = []
        byChar.set(charId, list)
      }
      list.push({
        uid: profile.uid,
        fetchedAt: profile.fetchedAt,
        payloadHash: profile.payloadHash,
        character,
        qualityOrder: character.qualityOrder,
      })
    }
  }
  for (const candidates of byChar.values()) {
    candidates.sort((a, b) => a.qualityOrder - b.qualityOrder)
  }
  return byChar
}

function computeBatchSize(totalCandidates: number): number {
  const rawSize = Math.ceil(totalCandidates * BATCH_PERCENT / 100)
  return Math.max(BATCH_MIN, Math.min(BATCH_MAX, rawSize))
}

type ProgressTracker = {
  totalCharacters: number,
  totalCandidates: number,
  completedCharacters: number,
  candidatesScored: number,
  candidatesSaved: number,
  convergedCount: number,
  startMs: number,
  onCharacterComplete(result: CharacterResult): void,
}

function createProgressTracker(totalCharacters: number, totalCandidates: number): ProgressTracker {
  const tracker: ProgressTracker = {
    totalCharacters,
    totalCandidates,
    completedCharacters: 0,
    candidatesScored: 0,
    candidatesSaved: 0,
    convergedCount: 0,
    startMs: performance.now(),
    onCharacterComplete(result: CharacterResult) {
      tracker.completedCharacters++
      tracker.candidatesScored += result.candidatesScored
      tracker.candidatesSaved += result.totalCandidates - result.candidatesScored
      if (result.converged) tracker.convergedCount++
      const elapsedS = ((performance.now() - tracker.startMs) / 1000).toFixed(0)
      const pct = tracker.totalCandidates > 0
        ? Math.round(100 * tracker.candidatesScored / tracker.totalCandidates)
        : 0
      console.log(
        `--- [${tracker.completedCharacters}/${tracker.totalCharacters} characters] `
        + `${tracker.candidatesScored} scored, ${tracker.candidatesSaved} saved `
        + `(${pct}% of ${tracker.totalCandidates}) `
        + `${tracker.convergedCount} converged, ${elapsedS}s`,
      )
    },
  }
  return tracker
}

async function processCharacter(input: {
  characterId: string,
  candidates: CharacterCandidate[],
  workerPool: LeaderboardScoreWorkerPool,
  versions: LeaderboardVersionFile,
  globalVersion: number,
  topK: number,
  progress: ProgressTracker,
}): Promise<CharacterResult> {
  const { characterId, candidates, workerPool, versions, globalVersion, topK, progress } = input
  const batchSize = computeBatchSize(candidates.length)
  const convergenceTracker = new BoardConvergenceTracker(topK)

  const allEntries: PrivateRankedEntry[] = []
  let cacheStats = emptyBuildScoreCacheStats()
  let metrics = emptyMetricsSnapshot()

  let batchesRun = 0
  let candidatesScored = 0
  let converged = false

  for (let offset = 0; offset < candidates.length; offset += batchSize) {
    const batch = candidates.slice(offset, offset + batchSize)
    const profiles: LeaderboardScoringProfile[] = batch.map((c) => ({
      uid: c.uid,
      fetchedAt: c.fetchedAt,
      payloadHash: c.payloadHash,
      characters: [c.character],
    }))

    const result = await workerPool.scoreProfiles({ profiles, versions, globalVersion, label: characterId })
    batchesRun++
    candidatesScored += batch.length

    if (result.failures.length > 0) {
      throw new Error(
        `Leaderboard scoring failed for ${characterId}: ${result.failures.length} failures in batch ${batchesRun}\n`
        + result.failures.map((f) => `  ${f.uid} / ${f.characterId}: ${f.error}`).join('\n'),
      )
    }

    allEntries.push(...result.entries)
    cacheStats = sumBuildScoreCacheStats([cacheStats, result.buildScoreCacheStats])
    metrics = sumMetricSnapshots([metrics, result.metrics])

    const batchHitTopK = convergenceTracker.ingestBatch(result.entries)

    console.log(
      `[${characterId}] Batch ${batchesRun}: ${batch.length} candidates, `
      + `${result.entries.length} entries, `
      + `${batchHitTopK ? 'top-K updated' : 'no top-K change'}`,
    )

    if (!batchHitTopK) {
      converged = true
      break
    }
  }

  if (converged) {
    console.log(`[${characterId}] Converged after ${batchesRun} batches (${candidatesScored}/${candidates.length} candidates, ${allEntries.length} entries)`)
  } else if (candidates.length > 0) {
    console.log(`[${characterId}] Scored all ${batchesRun} batches (${candidatesScored} candidates, ${allEntries.length} entries)`)
  }

  const characterResult: CharacterResult = {
    characterId,
    entries: allEntries,
    buildScoreCacheStats: cacheStats,
    metrics,
    candidatesScored,
    totalCandidates: candidates.length,
    batchesRun,
    converged,
  }

  progress.onCharacterComplete(characterResult)
  return characterResult
}

async function runPerCharacterBatchedScoring(
  workerPool: LeaderboardScoreWorkerPool,
  input: RunScoringStageInput,
): Promise<Omit<RunScoringStageResult, 'elapsedMs'>> {
  const candidatesByChar = groupCandidatesByCharacter(input.profiles)
  const totalCandidates = [...candidatesByChar.values()].reduce((n, c) => n + c.length, 0)
  const progress = createProgressTracker(candidatesByChar.size, totalCandidates)
  console.log(`\nPer-character batching: ${candidatesByChar.size} characters, ${totalCandidates} total candidates`)

  const characterResults = await Promise.all(
    [...candidatesByChar.entries()].map(([characterId, candidates]) =>
      processCharacter({
        characterId,
        candidates,
        workerPool,
        versions: input.versions,
        globalVersion: input.globalVersion,
        topK: input.topNPublic,
        progress,
      }),
    ),
  )

  const avgBatches = characterResults.length > 0
    ? (characterResults.reduce((n, r) => n + r.batchesRun, 0) / characterResults.length).toFixed(1)
    : '0'
  const maxBatchResult = characterResults.reduce<CharacterResult | null>((max, r) => (!max || r.batchesRun > max.batchesRun) ? r : max, null)

  console.log(
    `\nScoring complete: ${characterResults.length} characters, `
    + `${progress.candidatesScored} candidates scored of ${totalCandidates} total `
    + `(${totalCandidates > 0 ? Math.round(100 * progress.candidatesSaved / totalCandidates) : 0}% saved)`,
  )
  console.log(
    `  Converged: ${progress.convergedCount}/${characterResults.length}, `
    + `Avg batches: ${avgBatches}`
    + (maxBatchResult ? `, Max batches: ${maxBatchResult.batchesRun} (${maxBatchResult.characterId})` : ''),
  )

  return {
    entries: characterResults.flatMap((r) => r.entries),
    failures: [],
    buildScoreCacheStats: sumBuildScoreCacheStats(characterResults.map((r) => r.buildScoreCacheStats)),
    metrics: sumMetricSnapshots(characterResults.map((r) => r.metrics)),
  }
}

// ---------------------------------------------------------------------------
// Board convergence tracker — decides when to stop scoring a character
// ---------------------------------------------------------------------------

class BoardConvergenceTracker {
  private readonly topK: number
  private readonly boards = new Map<string, BoardTopK>()

  constructor(topK: number) {
    this.topK = topK
  }

  ingestBatch(entries: PrivateRankedEntry[]): boolean {
    let batchHitTopK = false
    for (const entry of entries) {
      const key = boardKeyFromEntry(entry)
      let board = this.boards.get(key)
      if (!board) {
        board = new BoardTopK(this.topK)
        this.boards.set(key, board)
      }
      if (board.tryInsert(entry)) {
        batchHitTopK = true
      }
    }
    return batchHitTopK
  }
}

class BoardTopK {
  private readonly heap: FixedSizeMinQueue<PrivateRankedEntry>
  private readonly seen = new Set<string>()

  constructor(k: number) {
    this.heap = new FixedSizeMinQueue<PrivateRankedEntry>(k)
  }

  tryInsert(entry: PrivateRankedEntry): boolean {
    if (this.heap.size() >= this.heap.limit) {
      const min = this.heap.top()!
      const displaces = entry.score > min.score
        || (entry.score === min.score && entry.uidHash < min.uidHash)
      if (!displaces) return false

      const dedupeKey = entryReplacementKey(entry)
      if (this.seen.has(dedupeKey)) return false

      this.seen.delete(entryReplacementKey(min))
      this.heap.fixedSizePush(entry, entry.score)
      this.seen.add(dedupeKey)
      return true
    }

    const dedupeKey = entryReplacementKey(entry)
    if (this.seen.has(dedupeKey)) return false

    this.heap.fixedSizePush(entry, entry.score)
    this.seen.add(dedupeKey)
    return true
  }
}

async function terminateWorkerPool(workerPool: LeaderboardScoreWorkerPool): Promise<unknown | null> {
  try {
    await workerPool.terminate()
    return null
  } catch (error: unknown) {
    return error
  }
}
