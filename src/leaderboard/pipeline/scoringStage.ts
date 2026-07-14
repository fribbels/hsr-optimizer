import {
  boardKeyFromEntry,
  entryReplacementKey,
} from 'leaderboard/output/privateOutput'
import { FixedSizeMinQueue } from 'lib/dataStructures/fixedSizeMinQueue'
import {
  ScoringProgressTracker,
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
  let scoringResult: RunScoringStageResult | null = null
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

  scoringResult.elapsedMs = scoringElapsedMs
  return scoringResult
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


async function processCharacter(input: {
  characterId: string,
  candidates: CharacterCandidate[],
  workerPool: LeaderboardScoreWorkerPool,
  versions: LeaderboardVersionFile,
  globalVersion: number,
  topK: number,
  progress: ScoringProgressTracker,
}): Promise<CharacterResult> {
  const { characterId, candidates, workerPool, versions, globalVersion, topK, progress } = input
  const charStartMs = performance.now()
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

    const batchNum = batchesRun + 1
    const label = `${characterId} batch${batchNum} (${progress.completedCharacters}/${progress.totalCharacters} chars done)`
    const result = await workerPool.scoreProfiles({ profiles, versions, globalVersion, label })
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

    if (!batchHitTopK) {
      converged = true
      break
    }
  }

  const charElapsedS = ((performance.now() - charStartMs) / 1000).toFixed(1)
  const status = converged ? `Converged after ${batchesRun} batches` : `Scored all ${batchesRun} batches`
  console.log(`[${characterId}] ${status} (${candidatesScored}/${candidates.length} candidates, ${allEntries.length} entries, ${charElapsedS}s)`)

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

  progress.onCharacterComplete(characterResult.candidatesScored, characterResult.totalCandidates, characterResult.converged)
  return characterResult
}

async function runPerCharacterBatchedScoring(
  workerPool: LeaderboardScoreWorkerPool,
  input: RunScoringStageInput,
): Promise<RunScoringStageResult> {
  const candidatesByChar = groupCandidatesByCharacter(input.profiles)
  const totalCandidates = [...candidatesByChar.values()].reduce((n, c) => n + c.length, 0)
  const progress = new ScoringProgressTracker(candidatesByChar.size, totalCandidates)
  const candidateCounts = [...candidatesByChar.values()].map((c) => c.length).sort((a, b) => a - b)
  const minCandidates = candidateCounts[0] ?? 0
  const medianCandidates = candidateCounts[Math.floor(candidateCounts.length / 2)] ?? 0
  const maxCandidates = candidateCounts[candidateCounts.length - 1] ?? 0
  console.log(`\nPer-character batching: ${candidatesByChar.size} characters, ${totalCandidates} total candidates (min=${minCandidates}, median=${medianCandidates}, max=${maxCandidates})`)

  const sortedEntries = [...candidatesByChar.entries()].sort((a, b) => a[1].length - b[1].length)

  const CHARACTER_CONCURRENCY = 4
  const characterResults: CharacterResult[] = new Array(sortedEntries.length)
  let nextIndex = 0

  async function processNextCharacter(): Promise<void> {
    while (nextIndex < sortedEntries.length) {
      const index = nextIndex++
      const [characterId, candidates] = sortedEntries[index]
      characterResults[index] = await processCharacter({
        characterId,
        candidates,
        workerPool,
        versions: input.versions,
        globalVersion: input.globalVersion,
        topK: input.topNPublic,
        progress,
      })
    }
  }

  await Promise.all(Array.from({ length: CHARACTER_CONCURRENCY }, () => processNextCharacter()))

  const avgBatches = characterResults.length > 0
    ? (characterResults.reduce((n, r) => n + r.batchesRun, 0) / characterResults.length).toFixed(1)
    : '0'
  const savedPct = totalCandidates > 0 ? Math.round(100 * progress.candidatesSaved / totalCandidates) : 0

  console.log(`\nScoring complete: ${characterResults.length} characters, ${progress.candidatesScored} scored (${savedPct}% saved), converged ${progress.convergedCount}, avg batches ${avgBatches}`)

  return {
    entries: characterResults.flatMap((r) => r.entries),
    failures: [],
    buildScoreCacheStats: sumBuildScoreCacheStats(characterResults.map((r) => r.buildScoreCacheStats)),
    metrics: sumMetricSnapshots(characterResults.map((r) => r.metrics)),
    elapsedMs: 0,
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

  get boardCount(): number {
    return this.boards.size
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
    const dedupeKey = entryReplacementKey(entry)
    if (this.seen.has(dedupeKey)) return false

    if (this.heap.size() >= this.heap.limit) {
      const min = this.heap.top()!
      const displaces = entry.score > min.score
        || (entry.score === min.score && entry.uidHash < min.uidHash)
      if (!displaces) return false
      this.seen.delete(entryReplacementKey(min))
    }

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
