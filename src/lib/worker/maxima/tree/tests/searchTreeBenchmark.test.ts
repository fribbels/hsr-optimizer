import { Stats } from 'lib/constants/constants'
import { type SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { SearchTree } from 'lib/worker/maxima/tree/searchTree'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'
import { describe, test } from 'vitest'

// ─── Benchmark statistics ────────────────────────────────────────────────────

function median(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

// ─── Benchmark runner ────────────────────────────────────────────────────────

function runBenchmark(
  factory: () => void,
  iterations: number,
): number {
  const samples: number[] = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    factory()
    samples.push(performance.now() - start)
  }
  return median(samples)
}

function runSuite() {
  const LIGHT = 100
  const HEAVY = 30

  return {
    '5-D 100%': runBenchmark(() => create5DTree(27).search(), LIGHT),
    '5-D 200%': runBenchmark(() => create5DTree(54).search(), HEAVY),
    '7-D 100%': runBenchmark(() => create7DTree(27).search(), HEAVY),
    '7-D 200%': runBenchmark(() => create7DTree(54).search(), HEAVY),
  }
}

// ─── Realistic test configurations ───────────────────────────────────────────

const STAT_WEIGHTS: Record<string, number> = {
  [Stats.ATK]: 0.3,
  [Stats.ATK_P]: 0.8,
  [Stats.HP]: 0.0,
  [Stats.HP_P]: 0.0,
  [Stats.DEF]: 0.0,
  [Stats.DEF_P]: 0.0,
  [Stats.SPD]: 0.5,
  [Stats.CR]: 1.0,
  [Stats.CD]: 0.9,
  [Stats.EHR]: 0.0,
  [Stats.RES]: 0.0,
  [Stats.BE]: 0.0,
}

function mockDamageFunction(stats: SubstatCounts): number {
  let score = 0
  for (const stat of Object.keys(stats)) {
    score += (stats[stat] ?? 0) * (STAT_WEIGHTS[stat] ?? 0)
  }
  const cr = stats[Stats.CR] ?? 0
  if (cr > 20) score -= (cr - 20) * 0.3
  return score
}

function create5DTree(goal: number) {
  const mains = {
    simBody: Stats.CR,
    simFeet: Stats.SPD,
    simPlanarSphere: Stats.Lightning_DMG,
    simLinkRope: Stats.ATK_P,
  }

  const min: SubstatCounts = {
    [Stats.ATK]: 0, [Stats.ATK_P]: 0, [Stats.HP]: 0, [Stats.HP_P]: 0,
    [Stats.DEF]: 0, [Stats.DEF_P]: 0, [Stats.SPD]: 0, [Stats.CR]: 0,
    [Stats.CD]: 0, [Stats.EHR]: 0, [Stats.RES]: 0, [Stats.BE]: 0,
  }

  const max: SubstatCounts = {
    [Stats.ATK]: 36, [Stats.ATK_P]: 24, [Stats.HP]: 0, [Stats.HP_P]: 0,
    [Stats.DEF]: 0, [Stats.DEF_P]: 0, [Stats.SPD]: 30, [Stats.CR]: 30,
    [Stats.CD]: 36, [Stats.EHR]: 0, [Stats.RES]: 0, [Stats.BE]: 0,
  }

  const mainStats = [Stats.HP, Stats.ATK, Stats.CR, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P]
  const substatValidator = new SubstatDistributionValidator(goal, mains)

  return new SearchTree(goal, min, max, mainStats, mockDamageFunction, substatValidator)
}

function create7DTree(goal: number) {
  const mains = {
    simBody: Stats.CR,
    simFeet: Stats.SPD,
    simPlanarSphere: Stats.ATK_P,
    simLinkRope: Stats.ATK_P,
  }

  const min: SubstatCounts = {
    [Stats.ATK]: 0, [Stats.ATK_P]: 0, [Stats.HP]: 0, [Stats.HP_P]: 0,
    [Stats.DEF]: 0, [Stats.DEF_P]: 0, [Stats.SPD]: 0, [Stats.CR]: 0,
    [Stats.CD]: 0, [Stats.EHR]: 0, [Stats.RES]: 0, [Stats.BE]: 0,
  }

  const max: SubstatCounts = {
    [Stats.ATK]: 36, [Stats.ATK_P]: 24, [Stats.HP]: 0, [Stats.HP_P]: 36,
    [Stats.DEF]: 0, [Stats.DEF_P]: 0, [Stats.SPD]: 30, [Stats.CR]: 30,
    [Stats.CD]: 36, [Stats.EHR]: 36, [Stats.RES]: 0, [Stats.BE]: 0,
  }

  const mainStats = [Stats.HP, Stats.ATK, Stats.CR, Stats.SPD, Stats.ATK_P, Stats.ATK_P]
  const substatValidator = new SubstatDistributionValidator(goal, mains)

  return new SearchTree(goal, min, max, mainStats, mockDamageFunction, substatValidator)
}

// ─── Benchmarks ──────────────────────────────────────────────────────────────

const RUNS = 3

describe('SearchTree.search() — full tree search', () => {
  test('benchmarks', () => {
    const totalStart = performance.now()
    const results: Record<string, number[]> = {}

    for (let run = 0; run < RUNS; run++) {
      const suite = runSuite()
      for (const [name, ms] of Object.entries(suite)) {
        (results[name] ??= []).push(ms)
      }
    }

    console.log('')
    console.log('SearchTree Benchmark Results')
    for (const [name, medians] of Object.entries(results)) {
      console.log(`${name.padEnd(12)} ${median(medians).toFixed(2).padStart(8)}ms  (runs: ${medians.map((m) => m.toFixed(2)).join(', ')})`)
    }
    console.log(`Total: ${((performance.now() - totalStart) / 1000).toFixed(1)}s`)
  }, 600_000)
})
