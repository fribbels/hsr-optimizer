import { MIN_PUBLIC_SCORE } from 'leaderboard/shared/constants'
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

// Percentage of total candidates per character to include in each batch
const BATCH_PERCENT = 15
// Minimum candidates per batch regardless of percentage
const BATCH_MIN = 100
// Maximum candidates per batch regardless of percentage
const BATCH_MAX = 500

export type RunScoringStageInput = {
  profiles: LeaderboardScoringProfile[],
  versions: LeaderboardVersionFile,
  globalVersion: number,
  workerCount: number,
  runtimeConfig: LeaderboardScoreWorkerRuntimeConfig,
  workerScriptUrl: URL,
}

export type RunScoringStageResult = {
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
  metrics: LeaderboardMetricsSnapshot,
  elapsedMs: number,
}

type WorkerScoreProfilesResult = Omit<RunScoringStageResult, 'elapsedMs'>

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
  let scoringResult: WorkerScoreProfilesResult | null = null
  try {
    scoringResult = await runBatchedScoring(workerPool, input)
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
// Batched scoring — process candidates in qualityOrder batches per character,
// stopping each character once it no longer produces public-threshold output.
// ---------------------------------------------------------------------------

type CharacterBatchState = {
  batchSize: number,
  hasSeenPublicOutput: boolean,
  done: boolean,
}

// Orchestrates batch rounds: init → loop(select→score→update) → merge
async function runBatchedScoring(
  workerPool: LeaderboardScoreWorkerPool,
  input: RunScoringStageInput,
): Promise<WorkerScoreProfilesResult> {
  const { profiles, versions, globalVersion } = input
  const { characterStates, maxRounds } = initializeBatchStates(profiles)

  // Process candidates in rounds, stopping characters that no longer produce public output
  const roundResults: WorkerScoreProfilesResult[] = []
  for (let round = 0; round < maxRounds; round++) {
    // Select candidates belonging to this round's batch window
    const { profiles: roundProfiles, submittedCharacterIds } = selectRoundCandidates(profiles, characterStates, round)
    if (roundProfiles.length === 0) break

    const roundCandidates = roundProfiles.reduce((n, p) => n + p.characters.length, 0)
    console.log(`\nBatch round ${round + 1}: ${roundProfiles.length} profiles, ${roundCandidates} candidates, ${submittedCharacterIds.size} active characters`)

    // Score this round's candidates via worker pool
    const result = await workerPool.scoreProfiles({ profiles: roundProfiles, versions, globalVersion })
    roundResults.push(result)

    // Mark characters as done if they've converged
    updateStopStates(characterStates, result.entries, result.failures, submittedCharacterIds, round)

    const doneCount = [...characterStates.values()].filter((s) => s.done).length
    console.log(`Batch round ${round + 1} complete: ${result.entries.length} entries, ${doneCount}/${characterStates.size} characters done`)
  }

  // Characters that used all batches without converging were fully scored anyway
  const exhausted = [...characterStates.entries()].filter(([, s]) => !s.done)
  if (exhausted.length > 0) {
    console.warn(`Batching: ${exhausted.length} character(s) used all batches without converging: ${exhausted.map(([id]) => id).join(', ')}`)
  }

  return mergeRoundResults(roundResults)
}

// Counts candidates per character and computes per-character batch sizes
function initializeBatchStates(profiles: LeaderboardScoringProfile[]): {
  characterStates: Map<string, CharacterBatchState>,
  maxRounds: number,
} {
  // Count how many candidates exist per character across all profiles
  const candidateCounts = new Map<string, number>()
  for (const profile of profiles) {
    for (const character of profile.characters) {
      const charId = String(character.unconverted.avatarId)
      candidateCounts.set(charId, (candidateCounts.get(charId) ?? 0) + 1)
    }
  }

  // Compute batch size for each character and determine how many rounds are needed
  const characterStates = new Map<string, CharacterBatchState>()
  let maxRounds = 0
  for (const [characterId, totalCandidates] of candidateCounts) {
    const rawSize = Math.ceil(totalCandidates * BATCH_PERCENT / 100)
    const batchSize = Math.max(BATCH_MIN, Math.min(BATCH_MAX, rawSize))
    characterStates.set(characterId, {
      batchSize,
      hasSeenPublicOutput: false,
      done: false,
    })
    maxRounds = Math.max(maxRounds, Math.ceil(totalCandidates / batchSize))
  }

  return { characterStates, maxRounds }
}

// Selects candidates whose qualityOrder falls in the current round's batch window
function selectRoundCandidates(
  profiles: LeaderboardScoringProfile[],
  characterStates: Map<string, CharacterBatchState>,
  round: number,
): { profiles: LeaderboardScoringProfile[], submittedCharacterIds: Set<string> } {
  const roundProfiles: LeaderboardScoringProfile[] = []
  const submittedCharacterIds = new Set<string>()

  for (const profile of profiles) {
    const roundCharacters: LeaderboardScoringCharacter[] = []

    for (const character of profile.characters) {
      const charId = String(character.unconverted.avatarId)
      const state = characterStates.get(charId)
      if (!state || state.done) continue

      // qualityOrder / batchSize determines which round this candidate belongs to
      if (Math.floor(character.qualityOrder / state.batchSize) === round) {
        roundCharacters.push(character)
        submittedCharacterIds.add(charId)
      }
    }

    // Rebuild profile with only this round's characters
    if (roundCharacters.length > 0) {
      roundProfiles.push({
        uid: profile.uid,
        fetchedAt: profile.fetchedAt,
        payloadHash: profile.payloadHash,
        characters: roundCharacters,
      })
    }
  }

  return { profiles: roundProfiles, submittedCharacterIds }
}

// Marks characters done if they previously produced public output but didn't this round
function updateStopStates(
  characterStates: Map<string, CharacterBatchState>,
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  submittedCharacterIds: Set<string>,
  round: number,
): void {
  const activeThisRound = new Set<string>()

  for (const entry of entries) {
    if (entry.score >= MIN_PUBLIC_SCORE) {
      const state = characterStates.get(entry.characterId)
      if (state) state.hasSeenPublicOutput = true
      activeThisRound.add(entry.characterId)
    }
  }

  // Failures keep the character active so it isn't stopped on a transient error
  for (const failure of failures) {
    activeThisRound.add(String(failure.characterId))
  }

  // Never stop on round 0 — need at least one full batch before evaluating convergence
  if (round === 0) return

  for (const characterId of submittedCharacterIds) {
    const state = characterStates.get(characterId)
    if (!state || state.done) continue
    if (!state.hasSeenPublicOutput) continue
    if (!activeThisRound.has(characterId)) {
      state.done = true
    }
  }
}

// Flattens per-round results into a single combined result
function mergeRoundResults(results: WorkerScoreProfilesResult[]): WorkerScoreProfilesResult {
  return {
    entries: results.flatMap((r) => r.entries),
    failures: results.flatMap((r) => r.failures),
    buildScoreCacheStats: sumBuildScoreCacheStats(results.map((r) => r.buildScoreCacheStats)),
    metrics: sumMetricSnapshots(results.map((r) => r.metrics)),
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
