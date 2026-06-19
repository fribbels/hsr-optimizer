import {
  emptyBuildScoreCacheStats,
  emptyMetricsSnapshot,
} from '../shared/metrics'
import {
  createNodeWorker,
  type NodeWorker,
} from '../shared/nodeFacade'
import type {
  FailureEntry,
  LeaderboardBuildScoreCacheStats,
  LeaderboardMetricsSnapshot,
  LeaderboardScoreWorkerRequest,
  LeaderboardScoreWorkerResponse,
  LeaderboardScoreWorkerRuntimeConfig,
  LeaderboardVersionFile,
  ParsedProfile,
  PrivateRankedEntry,
} from '../shared/types'

type LeaderboardScoreWorkerPoolOptions = {
  workerScriptUrl: URL,
  workerCount: number,
  runtimeConfig: LeaderboardScoreWorkerRuntimeConfig,
  maxRetries?: number,
}

type ScoreProfileResult = {
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  scored: number,
  failed: number,
  scoringRuns: number,
  buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
  metrics: LeaderboardMetricsSnapshot,
  elapsedMs: number,
}

type QueuedProfileTask = {
  id: number,
  profile: ParsedProfile,
  profileIndex: number,
  versions: LeaderboardVersionFile,
  globalVersion: number,
  attempts: number,
  enqueuedAt: number,
  dispatchedAt: number,
  resolve: (value: ScoreProfileResult & { profileIndex: number }) => void,
  reject: (error: Error) => void,
}

type WorkerSlot = {
  index: number,
  worker: NodeWorker,
  currentTask: QueuedProfileTask | null,
}

export class LeaderboardScoreWorkerPool {
  private readonly workerScriptUrl: URL
  private readonly workerCount: number
  private readonly runtimeConfig: LeaderboardScoreWorkerRuntimeConfig
  private readonly maxRetries: number
  private readonly workers: WorkerSlot[] = []
  private readonly queue: QueuedProfileTask[] = []
  private taskId = 1
  private terminated = false
  private completedProfiles = 0
  private failedProfiles = 0
  private maxQueueDepth = 0
  private maxInFlight = 0
  private totalQueueWaitMs = 0
  private totalRoundTripMs = 0
  private totalWorkerElapsedMs = 0

  constructor(options: LeaderboardScoreWorkerPoolOptions) {
    if (!Number.isInteger(options.workerCount) || options.workerCount <= 0) {
      throw new Error(`LeaderboardScoreWorkerPool workerCount must be a positive integer, received ${options.workerCount}`)
    }

    this.workerScriptUrl = options.workerScriptUrl
    this.workerCount = options.workerCount
    this.runtimeConfig = options.runtimeConfig
    this.maxRetries = options.maxRetries ?? 1
  }

  async scoreProfiles(input: {
    profiles: ParsedProfile[],
    versions: LeaderboardVersionFile,
    globalVersion: number,
    estimatedRuns?: number,
  }): Promise<{
    entries: PrivateRankedEntry[],
    failures: FailureEntry[],
    buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
    metrics: LeaderboardMetricsSnapshot,
  }> {
    const { profiles, versions, globalVersion } = input
    let completedRuns = 0
    const totalRuns = input.estimatedRuns ?? 0
    let cacheHits = 0
    let cacheMisses = 0

    const results = await Promise.all(profiles.map((profile, profileIndex) => {
      return this.runProfile({
        profile,
        profileIndex,
        versions,
        globalVersion,
      }).then((result) => {
        completedRuns += result.scoringRuns
        cacheHits += result.buildScoreCacheStats.l1Hits + result.buildScoreCacheStats.sqliteHits
        cacheMisses += result.buildScoreCacheStats.misses
        const cacheTotal = cacheHits + cacheMisses
        const hitRate = cacheTotal > 0 ? `${(100 * cacheHits / cacheTotal).toFixed(1)}%` : '-'
        const runsProgress = totalRuns > 0 ? `[${completedRuns}/${totalRuns} runs] ` : ''
        console.log(`${runsProgress}[${profileIndex + 1}/${profiles.length} profiles] [cache: ${hitRate} hit, ${cacheHits}/${cacheTotal}]`)
        return result
      })
    }))

    results.sort((a, b) => a.profileIndex - b.profileIndex)

    const entries = results.flatMap((result) => result.entries)
    const failures = results.flatMap((result) => result.failures)
    const buildScoreCacheStats = sumBuildScoreCacheStats(results.map((result) => result.buildScoreCacheStats))
    const metrics = sumMetricSnapshots(results.map((result) => result.metrics))

    console.log(`Total: ${entries.length} entries, ${failures.length} failures`)
    return { entries, failures, buildScoreCacheStats, metrics }
  }

  async terminate(): Promise<void> {
    this.terminated = true
    this.logStats()

    const error = new Error('Leaderboard score worker pool terminated')
    for (const task of this.queue.splice(0)) {
      task.reject(error)
    }

    const terminations = this.workers.map((slot) => {
      if (slot.currentTask) {
        slot.currentTask.reject(error)
        slot.currentTask = null
      }

      return slot.worker.terminate()
    })

    this.workers.length = 0
    await Promise.allSettled(terminations)
  }

  private runProfile(input: {
    profile: ParsedProfile,
    profileIndex: number,
    versions: LeaderboardVersionFile,
    globalVersion: number,
  }): Promise<ScoreProfileResult & { profileIndex: number }> {
    if (this.terminated) {
      return Promise.reject(new Error('Leaderboard score worker pool already terminated'))
    }

    this.ensureStarted()

    return new Promise((resolve, reject) => {
      this.queue.push({
        id: this.taskId++,
        profile: input.profile,
        profileIndex: input.profileIndex,
        versions: input.versions,
        globalVersion: input.globalVersion,
        attempts: 0,
        enqueuedAt: performance.now(),
        dispatchedAt: 0,
        resolve,
        reject,
      })
      this.maxQueueDepth = Math.max(this.maxQueueDepth, this.queue.length)
      this.drainQueue()
    })
  }

  private ensureStarted(): void {
    if (this.workers.length > 0) return

    for (let i = 0; i < this.workerCount; i++) {
      this.workers.push(this.createWorkerSlot(i))
    }
  }

  private createWorkerSlot(index: number): WorkerSlot {
    const slot: WorkerSlot = {
      index,
      worker: createNodeWorker(this.workerScriptUrl),
      currentTask: null,
    }

    slot.worker.on<LeaderboardScoreWorkerResponse>('message', (response) => {
      this.handleWorkerMessage(slot, response)
    })
    slot.worker.on('error', (error) => {
      this.handleWorkerFailure(slot, error)
    })
    slot.worker.on('exit', (code) => {
      if (this.terminated) return

      const message = code === 0
        ? `Leaderboard score worker ${slot.index} exited before pool termination`
        : `Leaderboard score worker ${slot.index} exited with code ${code}`
      this.handleWorkerFailure(slot, new Error(message))
    })

    return slot
  }

  private handleWorkerMessage(slot: WorkerSlot, response: LeaderboardScoreWorkerResponse): void {
    const task = slot.currentTask
    if (!task || task.id !== response.id) {
      this.handleWorkerFailure(slot, new Error(`Leaderboard score worker ${slot.index} returned unexpected task ${response.id}`))
      return
    }

    slot.currentTask = null
    const finishedAt = performance.now()
    this.totalRoundTripMs += finishedAt - task.dispatchedAt
    this.totalWorkerElapsedMs += response.ok ? response.elapsedMs : 0

    if (!response.ok) {
      this.failedProfiles++
      this.retryOrReject(task, new Error(response.stack ?? response.error))
    } else {
      this.completedProfiles++
      task.resolve({
        profileIndex: task.profileIndex,
        entries: response.entries,
        failures: response.failures,
        scored: response.scored,
        failed: response.failed,
        scoringRuns: response.scoringRuns,
        buildScoreCacheStats: response.buildScoreCacheStats,
        metrics: response.metrics,
        elapsedMs: response.elapsedMs,
      })
    }

    this.drainQueue()
  }

  private handleWorkerFailure(slot: WorkerSlot, error: Error): void {
    const task = slot.currentTask
    slot.currentTask = null

    if (task) {
      this.failedProfiles++
      this.retryOrReject(task, error)
    }

    this.replaceWorker(slot)
    this.drainQueue()
  }

  private retryOrReject(task: QueuedProfileTask, error: Error): void {
    if (task.attempts < this.maxRetries && !this.terminated) {
      this.queue.unshift({
        ...task,
        attempts: task.attempts + 1,
      })
      return
    }

    task.reject(error)
  }

  private replaceWorker(slot: WorkerSlot): void {
    const index = this.workers.indexOf(slot)
    void slot.worker.terminate().catch(() => {})

    if (this.terminated || index === -1) return
    this.workers[index] = this.createWorkerSlot(slot.index)
  }

  private drainQueue(): void {
    if (this.terminated) return

    for (const slot of this.workers) {
      if (this.queue.length === 0) return
      if (slot.currentTask != null) continue

      const task = this.queue.shift()!
      slot.currentTask = task
      task.dispatchedAt = performance.now()
      this.totalQueueWaitMs += task.dispatchedAt - task.enqueuedAt
      const request: LeaderboardScoreWorkerRequest = {
        id: task.id,
        profile: task.profile,
        versions: task.versions,
        globalVersion: task.globalVersion,
        runtimeConfig: this.runtimeConfig,
      }
      try {
        slot.worker.postMessage(request)
      } catch (e) {
        this.handleWorkerFailure(slot, e instanceof Error ? e : new Error(String(e)))
        return
      }
      this.maxInFlight = Math.max(
        this.maxInFlight,
        this.workers.filter((workerSlot) => workerSlot.currentTask != null).length,
      )
    }
  }

  private logStats(): void {
    const finishedProfiles = this.completedProfiles + this.failedProfiles
    if (finishedProfiles === 0 && this.queue.length === 0 && this.workers.length === 0) return

    const divisor = Math.max(1, finishedProfiles)
    console.log(
      'Leaderboard profile worker pool stats:',
      JSON.stringify(
        {
          workers: this.workerCount,
          completedProfiles: this.completedProfiles,
          failedProfiles: this.failedProfiles,
          maxQueueDepth: this.maxQueueDepth,
          maxInFlight: this.maxInFlight,
          avgQueueWaitMs: this.totalQueueWaitMs / divisor,
          avgRoundTripMs: this.totalRoundTripMs / divisor,
          avgWorkerElapsedMs: this.totalWorkerElapsedMs / divisor,
        },
        null,
        2,
      ),
    )
  }
}

function sumBuildScoreCacheStats(stats: LeaderboardBuildScoreCacheStats[]): LeaderboardBuildScoreCacheStats {
  return stats.reduce<LeaderboardBuildScoreCacheStats>((sum, stat) => ({
    l1Hits: sum.l1Hits + stat.l1Hits,
    sqliteHits: sum.sqliteHits + stat.sqliteHits,
    misses: sum.misses + stat.misses,
    writes: sum.writes + stat.writes,
    corruptRowsDeleted: sum.corruptRowsDeleted + stat.corruptRowsDeleted,
  }), emptyBuildScoreCacheStats())
}

function sumMetricSnapshots(snapshots: LeaderboardMetricsSnapshot[]): LeaderboardMetricsSnapshot {
  const result = emptyMetricsSnapshot()
  for (const snapshot of snapshots) {
    for (const [key, value] of Object.entries(snapshot.counters)) {
      result.counters[key] = (result.counters[key] ?? 0) + value
    }
    for (const [key, value] of Object.entries(snapshot.gauges)) {
      result.gauges[key] = value
    }
    for (const [key, value] of Object.entries(snapshot.timings)) {
      const current = result.timings[key] ?? { count: 0, totalMs: 0, avgMs: 0 }
      current.count += value.count
      current.totalMs += value.totalMs
      current.avgMs = current.totalMs / current.count
      result.timings[key] = current
    }
  }
  return result
}
