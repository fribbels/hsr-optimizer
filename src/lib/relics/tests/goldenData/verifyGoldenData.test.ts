/**
 * Golden Test Verification for Relic Scoring Pipeline
 *
 * Compares the current scorer output against goldenResults.json to detect regressions.
 * Also benchmarks per-character and aggregate scoring performance.
 *
 * Run with: npm run vitest:fast -- --testPathPattern=verifyGoldenData
 *
 * If this test fails after a refactor, it means the scoring output changed.
 * Investigate each failing pair (character × relic) to determine if the change is intentional.
 */

// @vitest-environment jsdom
import fs from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { Metadata } from 'lib/state/metadataInitializer'
import { AugmentedStats } from 'lib/relics/relicAugmenter'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'
import { afterAll, describe, expect, test } from 'vitest'
import type { GoldenResults } from './generateGoldenData.test'

Metadata.initialize()

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1')

const FIELD_NAMES = [
  'scoreNumber', 'mainStatScore',
  'fCurrent', 'fBest', 'fAverage', 'fWorst', 'fRerollAvg', 'fBlockerAvg',
  'pCurrentPct', 'pBestPct', 'pAveragePct', 'pWorstPct', 'pRerollAvgPct', 'pBlockedRerollAvgPct',
]

/** Tolerance for floating point comparison — 6 decimal places */
const EPSILON = 1e-5

function r6(n: number): number {
  return Math.round(n * 1e6) / 1e6
}

function hydrateRelic(raw: Record<string, unknown>): Relic {
  return {
    ...raw,
    previewSubstats: (raw.previewSubstats as Relic['previewSubstats']) ?? [],
    weightScore: (raw.weightScore as number) ?? 0,
    augmentedStats: (raw.augmentedStats as AugmentedStats) ?? ({} as AugmentedStats),
  } as Relic
}

// Load golden data
const goldenPath = path.join(__dirname, 'goldenResults.json')
const relicsPath = path.join(__dirname, 'testRelics.json')

if (!fs.existsSync(goldenPath) || !fs.existsSync(relicsPath)) {
  throw new Error(
    'Golden data not found. Run the generator first:\n'
    + '  npx vitest run src/lib/relics/tests/goldenData/generateGoldenData.test.ts',
  )
}

const golden: GoldenResults = JSON.parse(fs.readFileSync(goldenPath, 'utf8'))
const relics: Relic[] = JSON.parse(fs.readFileSync(relicsPath, 'utf8')).map(hydrateRelic)

// ── Benchmark tracking ──────────────────────────────────────────────────────────

type CharBenchmark = {
  charId: string
  totalMs: number
  currentMs: number
  futureMs: number
  potentialMs: number
  relicCount: number
  mismatchCount: number
}

const benchmarks: CharBenchmark[] = []
const suiteStart = performance.now()

describe('golden scoring verification', () => {
  for (const charId of golden.meta.characterIds) {
    test(`character ${charId}`, () => {
      const scorer = new RelicScorer()
      const expectedResults = golden.results[charId]
      const failures: string[] = []

      let currentMs = 0
      let futureMs = 0
      let potentialMs = 0

      const charStart = performance.now()

      for (let i = 0; i < relics.length; i++) {
        const relic = relics[i]
        const expected = expectedResults[i]

        let t0 = performance.now()
        const [current, future, potential] = scorer.scoreAllThree(relic, charId as CharacterId)
        currentMs += performance.now() - t0

        const actual = [
          r6(current.scoreNumber),
          r6(current.mainStatScore),
          r6(future.current),
          r6(future.best),
          r6(future.average),
          r6(future.worst),
          r6(future.rerollAvg),
          r6(future.blockerAvg),
          r6(potential.currentPct),
          r6(potential.bestPct),
          r6(potential.averagePct),
          r6(potential.worstPct),
          r6(potential.rerollAvgPct),
          r6(potential.blockedRerollAvgPct),
        ]

        for (let f = 0; f < actual.length; f++) {
          if (Math.abs(actual[f] - expected[f]) > EPSILON) {
            failures.push(
              `relic[${i}] (id=${relic.id}, ${relic.part} ${relic.main.stat}): `
              + `${FIELD_NAMES[f]} expected ${expected[f]} got ${actual[f]}`,
            )
          }
        }
      }

      const totalMs = performance.now() - charStart

      benchmarks.push({
        charId,
        totalMs,
        currentMs,
        futureMs,
        potentialMs,
        relicCount: relics.length,
        mismatchCount: failures.length,
      })

      if (failures.length > 0) {
        const sample = failures.slice(0, 20).join('\n  ')
        const extra = failures.length > 20 ? `\n  ... and ${failures.length - 20} more` : ''
        expect.fail(`${failures.length} scoring mismatches for character ${charId}:\n  ${sample}${extra}`)
      }
    })
  }

  afterAll(() => {
    const suiteMs = performance.now() - suiteStart
    const totalPairs = benchmarks.reduce((sum, b) => sum + b.relicCount, 0)
    const totalMismatches = benchmarks.reduce((sum, b) => sum + b.mismatchCount, 0)

    const totalCurrentMs = benchmarks.reduce((sum, b) => sum + b.currentMs, 0)
    const totalFutureMs = benchmarks.reduce((sum, b) => sum + b.futureMs, 0)
    const totalPotentialMs = benchmarks.reduce((sum, b) => sum + b.potentialMs, 0)
    const totalScoringMs = benchmarks.reduce((sum, b) => sum + b.totalMs, 0)

    const charTimes = benchmarks.map((b) => b.totalMs).sort((a, b) => a - b)
    const p50 = charTimes[Math.floor(charTimes.length * 0.5)]
    const p95 = charTimes[Math.floor(charTimes.length * 0.95)]
    const fastest = charTimes[0]
    const slowest = charTimes[charTimes.length - 1]

    const slowest5 = [...benchmarks].sort((a, b) => b.totalMs - a.totalMs).slice(0, 5)

    console.log('\n' + '='.repeat(80))
    console.log('GOLDEN SCORING BENCHMARK RESULTS')
    console.log('='.repeat(80))
    console.log(`Characters:      ${benchmarks.length}`)
    console.log(`Relics:          ${relics.length}`)
    console.log(`Total pairs:     ${totalPairs.toLocaleString()}`)
    console.log(`Mismatches:      ${totalMismatches}`)
    console.log('')
    console.log('── Aggregate Timing ──')
    console.log(`Suite wall time: ${suiteMs.toFixed(1)} ms`)
    console.log(`Scoring total:   ${totalScoringMs.toFixed(1)} ms`)
    console.log(`  currentScore:  ${totalCurrentMs.toFixed(1)} ms  (${(totalCurrentMs / totalScoringMs * 100).toFixed(1)}%)`)
    console.log(`  futureScore:   ${totalFutureMs.toFixed(1)} ms  (${(totalFutureMs / totalScoringMs * 100).toFixed(1)}%)`)
    console.log(`  potential:     ${totalPotentialMs.toFixed(1)} ms  (${(totalPotentialMs / totalScoringMs * 100).toFixed(1)}%)`)
    console.log('')
    console.log('── Per-Relic Amortized ──')
    console.log(`Avg per pair:    ${(totalScoringMs / totalPairs * 1000).toFixed(2)} µs`)
    console.log(`  currentScore:  ${(totalCurrentMs / totalPairs * 1000).toFixed(2)} µs`)
    console.log(`  futureScore:   ${(totalFutureMs / totalPairs * 1000).toFixed(2)} µs`)
    console.log(`  potential:     ${(totalPotentialMs / totalPairs * 1000).toFixed(2)} µs`)
    console.log(`Throughput:      ${(totalPairs / (totalScoringMs / 1000)).toFixed(0)} pairs/sec`)
    console.log('')
    console.log('── Per-Character Distribution ──')
    console.log(`Fastest:         ${fastest.toFixed(2)} ms`)
    console.log(`p50 (median):    ${p50.toFixed(2)} ms`)
    console.log(`p95:             ${p95.toFixed(2)} ms`)
    console.log(`Slowest:         ${slowest.toFixed(2)} ms`)
    console.log('')
    console.log('── Slowest 5 Characters ──')
    for (const b of slowest5) {
      console.log(`  ${b.charId}: ${b.totalMs.toFixed(2)} ms (current=${b.currentMs.toFixed(1)}, future=${b.futureMs.toFixed(1)}, potential=${b.potentialMs.toFixed(1)})`)
    }
    console.log('='.repeat(80))
  })
})
