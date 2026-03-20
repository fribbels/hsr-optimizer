// @vitest-environment jsdom
import { readFileSync } from 'fs'
import { performance } from 'perf_hooks'
import { runDpsScoreBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { generateTestSingleRelicsByPart, testStatSpread } from 'lib/simulations/tests/simTestUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { clone } from 'lib/utils/objectUtils'
import type { Character, CharacterId } from 'types/character'
import { describe, expect, test } from 'vitest'

Metadata.initialize()

// ─── Types (matching generator output) ───────────────────────────────────────

interface DpsScoreGoldenEntry {
  characterId: string
  lightConeId: string
  characterName: string
  eidolon: number
  superimposition: number
  relicSet1: string
  relicSet2: string
  ornamentSet: string
  mains: {
    simBody: string
    simFeet: string
    simPlanarSphere: string
    simLinkRope: string
  }
  expected: {
    percent: number
    originalSimScore: number
    benchmarkSimScore: number
    perfectionSimScore: number
    baselineSimScore: number
  }
  durationMs: number
}

interface DpsScoreGoldenData {
  meta: {
    generatedAt: string
    characterCount: number
    version: string
    totalDurationMs: number
  }
  entries: DpsScoreGoldenEntry[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GOLDEN_DATA_PATH = 'src/lib/simulations/tests/goldenData/goldenDpsScoreResults.json'
const DEFAULT_STATS = testStatSpread(10)
// toBeCloseTo(expected, numDigits) checks |received - expected| < 10^(-numDigits) / 2
// numDigits=5 → tolerance of 5e-6, appropriate for DPS score precision
const PRECISION_DIGITS = 5

// ─── Load golden data ────────────────────────────────────────────────────────

let goldenData: DpsScoreGoldenData
try {
  goldenData = JSON.parse(readFileSync(GOLDEN_DATA_PATH, 'utf-8'))
} catch {
  throw new Error(
    `Golden data not found at ${GOLDEN_DATA_PATH}. Run the generator first:\n`
    + '  npx vitest run src/lib/simulations/tests/goldenData/generateDpsScoreGoldenData.test.ts',
  )
}

// ─── Verification ────────────────────────────────────────────────────────────

describe('verify DPS score golden data', () => {
  const totalStart = performance.now()
  const timings: { name: string; durationMs: number }[] = []

  for (const entry of goldenData.entries) {
    test(`${entry.characterName} (${entry.characterId})`, async () => {
      globalThis.SEQUENTIAL_BENCHMARKS = true

      const dbMetadata = getGameMetadata()
      const simMetadata = clone(dbMetadata.characters[entry.characterId as CharacterId]?.scoringMetadata?.simulation)

      if (!simMetadata) {
        throw new Error(`No simulation metadata found for ${entry.characterId}`)
      }

      const character = {
        form: {
          characterId: entry.characterId,
          lightCone: entry.lightConeId,
          characterEidolon: entry.eidolon,
          lightConeSuperimposition: entry.superimposition,
        },
      } as Character

      const singleRelicByPart = generateTestSingleRelicsByPart(
        {
          simRelicSet1: entry.relicSet1 as any,
          simRelicSet2: entry.relicSet2 as any,
          simOrnamentSet: entry.ornamentSet as any,
        },
        entry.mains as any,
        DEFAULT_STATS,
      )

      const entryStart = performance.now()
      const orchestrator = await runDpsScoreBenchmarkOrchestrator(
        character,
        simMetadata,
        singleRelicByPart,
        {},
      )
      const durationMs = performance.now() - entryStart

      timings.push({ name: entry.characterName, durationMs })

      const simScore = orchestrator.simulationScore!
      const expected = entry.expected

      expect(simScore.percent).toBeCloseTo(expected.percent, PRECISION_DIGITS)
      expect(simScore.originalSimScore).toBeCloseTo(expected.originalSimScore, PRECISION_DIGITS)
      expect(simScore.benchmarkSimScore).toBeCloseTo(expected.benchmarkSimScore, PRECISION_DIGITS)
      expect(simScore.maximumSimScore).toBeCloseTo(expected.perfectionSimScore, PRECISION_DIGITS)
      expect(simScore.baselineSimScore).toBeCloseTo(expected.baselineSimScore, PRECISION_DIGITS)
    }, 60_000) // 60s per character
  }

  test.sequential('summary', () => {
    const totalMs = performance.now() - totalStart
    const sorted = [...timings].sort((a, b) => b.durationMs - a.durationMs)

    console.log('================================================================================')
    console.log('DPS SCORE GOLDEN DATA VERIFICATION')
    console.log('================================================================================')
    console.log(`Characters verified: ${timings.length}`)
    console.log(`Total time:          ${(totalMs / 1000).toFixed(1)}s`)
    console.log(`Avg per character:   ${(totalMs / timings.length / 1000).toFixed(2)}s`)
    console.log('')
    console.log('Slowest characters:')
    for (const entry of sorted.slice(0, 10)) {
      console.log(`  ${entry.name.padEnd(30)} ${(entry.durationMs / 1000).toFixed(2)}s`)
    }
    console.log('================================================================================')
  })
})
