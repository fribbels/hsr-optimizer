// @vitest-environment jsdom
import { Sets, Stats } from 'lib/constants/constants'
import type { SetsOrnaments, SetsRelics } from 'lib/sets/setConfigRegistry'
import { runDpsScoreBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { generateTestSingleRelicsByPart, testStatSpread } from 'lib/simulations/tests/simTestUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { clone } from 'lib/utils/objectUtils'
import type { Character, CharacterId } from 'types/character'
import type { MainStats } from 'lib/constants/constants'
import type { SimulationMetadata } from 'types/metadata'
import { describe, test } from 'vitest'

Metadata.initialize()

// ─── Benchmark helpers ───────────────────────────────────────────────────────

function median(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function pickFirstMains(simulation: SimulationMetadata) {
  return {
    simBody: (simulation.parts.Body?.[0] ?? Stats.CR) as MainStats,
    simFeet: (simulation.parts.Feet?.[0] ?? Stats.SPD) as MainStats,
    simPlanarSphere: (simulation.parts.PlanarSphere?.[0] ?? Stats.ATK_P) as MainStats,
    simLinkRope: (simulation.parts.LinkRope?.[0] ?? Stats.ATK_P) as MainStats,
  }
}

async function runPipeline(characterId: CharacterId) {
  globalThis.SEQUENTIAL_BENCHMARKS = true

  const dbMetadata = getGameMetadata()
  const simMetadata = clone(dbMetadata.characters[characterId].scoringMetadata.simulation!)
  const relicSetCombo = simMetadata.relicSets[0]
  const relicSet1 = relicSetCombo[0] as SetsRelics
  const relicSet2 = (relicSetCombo[1] ?? relicSetCombo[0]) as SetsRelics
  const ornamentSet = simMetadata.ornamentSets[0] as SetsOrnaments
  const mains = pickFirstMains(simMetadata)

  const character = {
    form: {
      characterId,
      lightCone: simMetadata.teammates[0]?.lightCone ?? '23001',
      characterEidolon: 6,
      lightConeSuperimposition: 5,
    },
  } as Character

  const singleRelicByPart = generateTestSingleRelicsByPart(
    { simRelicSet1: relicSet1, simRelicSet2: relicSet2, simOrnamentSet: ornamentSet },
    mains,
    testStatSpread(10),
  )

  await runDpsScoreBenchmarkOrchestrator(character, simMetadata, singleRelicByPart, {})
}

// ─── Characters covering different code paths ────────────────────────────────

const BENCH_CHARACTERS: { name: string; id: CharacterId }[] = [
  { name: 'Anaxa', id: '1405' as CharacterId },
]

const ITERATIONS = 3
const RUNS = 3

// ─── Benchmark ───────────────────────────────────────────────────────────────

describe('DPS Score Pipeline Benchmark', () => {
  test('full pipeline with real damage function', async () => {
    const totalStart = performance.now()
    const results: Record<string, number[]> = {}

    // Warmup
    for (const char of BENCH_CHARACTERS) {
      await runPipeline(char.id)
    }

    for (let run = 0; run < RUNS; run++) {
      for (const char of BENCH_CHARACTERS) {
        const samples: number[] = []
        for (let i = 0; i < ITERATIONS; i++) {
          const start = performance.now()
          await runPipeline(char.id)
          samples.push(performance.now() - start)
        }
        const med = median(samples);
        (results[char.name] ??= []).push(med)
      }
    }

    console.log('')
    console.log('DPS Score Pipeline Benchmark Results')
    for (const [name, medians] of Object.entries(results)) {
      console.log(`${name.padEnd(16)} ${median(medians).toFixed(0).padStart(6)}ms  (runs: ${medians.map((m) => m.toFixed(0)).join(', ')})`)
    }
    console.log(`Total: ${((performance.now() - totalStart) / 1000).toFixed(1)}s`)
  }, 600_000)
})
