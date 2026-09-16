// @vitest-environment jsdom
/// <reference types="node" />
// Experiment harness for SPD-as-chase-stat benchmark research. Not a regression test.
// Run: npx vitest --no-watch --pool=threads src/lib/simulations/tests/dpsScore/spdChaseExperiment.test.ts
import { SilverWolfLv999 } from 'lib/conditionals/character/1500/SilverWolfLv999'
import { WelcomeToTheCosmicCity } from 'lib/conditionals/lightcone/5star/WelcomeToTheCosmicCity'
import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  executeOrchestrator,
  prepareOrchestrator,
} from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import {
  generateE0S1Test,
  generateTestSingleRelicsByPart,
  testCharacter,
  testMains,
  testSets,
  testStatSpreadSpd,
} from 'lib/simulations/tests/simTestUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  createDiminishingReturns,
  dpsDiminishingReturns,
} from 'lib/scoring/simScoringUtils'
import { clone } from 'lib/utils/objectUtils'
import {
  type ComputeOptimalSimulationSearchRunner,
  type ComputeOptimalSimulationSearchStats,
  runComputeOptimalSimulationInline,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { type Character } from 'types/character'
import {
  ScoringConfigType,
  type SimulationMetadata,
  SpdBenchmarkMode,
} from 'types/metadata'
import {
  describe,
  test,
} from 'vitest'
import fs from 'node:fs'

const REPORT_PATH = process.env.SPD_CHASE_REPORT ?? 'plans/scratch/spd-chase-experiment.log'

function log(line: string) {
  console.log(line)
  fs.appendFileSync(REPORT_PATH, line + '\n')
}

Metadata.initialize()
globalThis.SEQUENTIAL_BENCHMARKS = true

type PhaseStats = {
  sims: number,
  measurements: number,
  dimensions: number[],
  elapsedMs: number,
}

type RunSummary = {
  label: string,
  originalSpd: number,
  originalScore: number,
  percent: number,
  benchmarkScore: number,
  benchmarkSpdRolls: number,
  benchmarkCombatSpd: number,
  benchmarkStats: Record<string, number>,
  perfectionScore: number,
  perfectionSpdRolls: number,
  perfectionCombatSpd: number,
  benchmark: PhaseStats,
  perfection: PhaseStats,
  totalMs: number,
}

function emptyPhase(): PhaseStats {
  return { sims: 0, measurements: 0, dimensions: [], elapsedMs: 0 }
}

function record(phase: PhaseStats, stats: ComputeOptimalSimulationSearchStats | undefined) {
  if (!stats) return
  phase.sims++
  phase.measurements += stats.measurements
  phase.dimensions.push(stats.dimensions)
  phase.elapsedMs += stats.elapsedMs
}

type RunOptions = {
  spdBenchmark?: number,
  mode?: SpdBenchmarkMode,
  stats?: Record<string, number>,
  sets?: ReturnType<typeof testSets>,
}

// A 48-roll user build over Silver Wolf's real substats, everything else zero
function realisticStats(spd: number, cr: number, cd: number, hp: number, def: number): Record<string, number> {
  return {
    ...testStatSpreadSpd(0, 0),
    [Stats.SPD]: spd,
    [Stats.CR]: cr,
    [Stats.CD]: cd,
    [Stats.HP_P]: hp,
    [Stats.DEF_P]: def,
  }
}

async function runSilverWolf(label: string, userSpdRolls: number, options: RunOptions = {}): Promise<RunSummary> {
  const { spdBenchmark, mode, stats, sets } = options
  const input = generateE0S1Test({
    character: testCharacter(SilverWolfLv999.id, WelcomeToTheCosmicCity.id),
    teammate0: testCharacter('1000', '20000'),
    teammate1: testCharacter('1000', '20000'),
    teammate2: testCharacter('1000', '20000'),
    sets: sets ?? testSets(Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl, Sets.PunklordeStageZero),
    mains: testMains(Stats.CD, Stats.SPD, Stats.HP_P, Stats.HP_P),
    stats: stats ?? testStatSpreadSpd(userSpdRolls, 8),
  })
  const mutateMetadata = mode == null ? undefined : (m: SimulationMetadata) => {
    m.spdBenchmarkMode = mode
  }

  const character = { form: { ...input.character } } as Character
  const simulationMetadata = clone(getGameMetadata().characters[SilverWolfLv999.id].scoringMetadata.simulation!)
  mutateMetadata?.(simulationMetadata)
  const singleRelicByPart = generateTestSingleRelicsByPart(input.sets, input.mains, input.stats)

  const benchmark = emptyPhase()
  const perfection = emptyPhase()
  const searchRunner: ComputeOptimalSimulationSearchRunner = async (workerInput, runnerContext) => {
    const output = runComputeOptimalSimulationInline(workerInput)
    record(runnerContext.phase === 'benchmark' ? benchmark : perfection, output.searchStats)
    return output
  }

  const startMs = performance.now()
  const orchestrator = prepareOrchestrator(
    character,
    { configType: ScoringConfigType.DPS, simulation: simulationMetadata },
    singleRelicByPart,
    { spdBenchmark },
  )
  await executeOrchestrator(orchestrator, { searchRunner })
  const totalMs = performance.now() - startMs

  const benchmarkResult = orchestrator.benchmarkSimResult!
  const perfectionResult = orchestrator.perfectionSimResult!

  return {
    label,
    originalSpd: orchestrator.originalSpd!,
    originalScore: orchestrator.originalSimResult!.simScore,
    percent: orchestrator.percent!,
    benchmarkScore: orchestrator.benchmarkSimScore!,
    benchmarkSpdRolls: orchestrator.benchmarkSimRequest!.stats[Stats.SPD] ?? 0,
    benchmarkCombatSpd: benchmarkResult.x.getSelfValue(StatKey.SPD),
    benchmarkStats: { ...orchestrator.benchmarkSimRequest!.stats },
    perfectionScore: orchestrator.perfectionSimScore!,
    perfectionSpdRolls: orchestrator.perfectionSimRequest!.stats[Stats.SPD] ?? 0,
    perfectionCombatSpd: perfectionResult.x.getSelfValue(StatKey.SPD),
    benchmark,
    perfection,
    totalMs,
  }
}

function printSummary(s: RunSummary) {
  const fmt = (n: number) => n.toFixed(1)
  log(`\n=== ${s.label}`)
  log(`original: spd=${fmt(s.originalSpd)} score=${fmt(s.originalScore)} percent=${(s.percent * 100).toFixed(2)}%`)
  log(`benchmark: score=${fmt(s.benchmarkScore)} spdRolls=${s.benchmarkSpdRolls.toFixed(2)} combatSpd=${fmt(s.benchmarkCombatSpd)} stats=${JSON.stringify(s.benchmarkStats)}`)
  log(`perfection: score=${fmt(s.perfectionScore)} spdRolls=${s.perfectionSpdRolls.toFixed(2)} combatSpd=${fmt(s.perfectionCombatSpd)}`)
  log(
    `search benchmark: sims=${s.benchmark.sims} measurements=${s.benchmark.measurements} dims=[${s.benchmark.dimensions.join(',')}] ms=${fmt(s.benchmark.elapsedMs)}`,
  )
  log(
    `search perfection: sims=${s.perfection.sims} measurements=${s.perfection.measurements} dims=[${s.perfection.dimensions.join(',')}] ms=${fmt(s.perfection.elapsedMs)}`,
  )
  log(`total ms=${fmt(s.totalMs)}`)
}

const FIXED = SpdBenchmarkMode.FIXED
const CHASE = SpdBenchmarkMode.CHASE

describe('SPD chase experiment: Silver Wolf Lv999', () => {
  test('baseline: FIXED pinned benchmark at user SPD', async () => {
    printSummary(await runSilverWolf('FIXED @ user spd (10 spd rolls)', 10, { mode: FIXED }))
    printSummary(await runSilverWolf('FIXED @ user spd (20 spd rolls)', 20, { mode: FIXED }))
  }, 600_000)

  test('chase: SPD as a search dimension', async () => {
    printSummary(await runSilverWolf('CHASE (10 user spd rolls)', 10, { mode: CHASE }))
    printSummary(await runSilverWolf('CHASE (20 user spd rolls)', 20, { mode: CHASE }))
    printSummary(await runSilverWolf('CHASE (0 user spd rolls)', 0, { mode: CHASE }))
  }, 600_000)

  test('chase repeatability: 5 runs, same input', async () => {
    const rows: string[] = []
    for (let i = 0; i < 5; i++) {
      const s = await runSilverWolf(`chase repeat ${i}`, 20, { mode: CHASE })
      rows.push(
        `run=${i} benchmark=${s.benchmarkScore.toFixed(0)} spdRolls=${s.benchmarkSpdRolls} combatSpd=${s.benchmarkCombatSpd.toFixed(1)} perfection=${s.perfectionScore.toFixed(0)} pSpdRolls=${s.perfectionSpdRolls} measurements=${s.benchmark.measurements}/${s.perfection.measurements} ms=${s.totalMs.toFixed(0)}`,
      )
    }
    log('\n=== CHASE REPEAT\n' + rows.join('\n'))
  }, 600_000)

  test('realistic 48-roll builds: FIXED vs CHASE percent', async () => {
    const builds: [string, Record<string, number>][] = [
      ['A spd4 cr14 cd14 hp8 def8', realisticStats(4, 14, 14, 8, 8)],
      ['B spd12 cr12 cd12 hp6 def6', realisticStats(12, 12, 12, 6, 6)],
      ['C spd20 cr10 cd10 hp4 def4', realisticStats(20, 10, 10, 4, 4)],
      ['D spd28 cr8 cd8 hp2 def2', realisticStats(28, 8, 8, 2, 2)],
    ]
    const rows: string[] = []
    for (const [name, stats] of builds) {
      const fixed = await runSilverWolf(`FIXED ${name}`, 0, { mode: FIXED, stats })
      const chase = await runSilverWolf(`CHASE ${name}`, 0, { mode: CHASE, stats })
      rows.push(
        `${name}: userSpd=${fixed.originalSpd.toFixed(1)} userScore=${fixed.originalScore.toFixed(0)}`
          + ` | FIXED bench=${fixed.benchmarkScore.toFixed(0)} (spdRolls=${fixed.benchmarkSpdRolls.toFixed(1)}) perf=${fixed.perfectionScore.toFixed(0)} percent=${(fixed.percent * 100).toFixed(1)}%`
          + ` | CHASE bench=${chase.benchmarkScore.toFixed(0)} (spdRolls=${chase.benchmarkSpdRolls} spd=${chase.benchmarkCombatSpd.toFixed(1)}) perf=${chase.perfectionScore.toFixed(0)} percent=${(chase.percent * 100).toFixed(1)}%`,
      )
    }
    log('\n=== REALISTIC BUILDS FIXED vs CHASE\n' + rows.join('\n'))
  }, 1_200_000)

  test('pinned sweep: benchmark score as a function of forced SPD target', async () => {
    const rows: string[] = []
    for (const target of [150, 160, 165, 170, 175, 180, 185, 190, 195, 200, 210]) {
      const s = await runSilverWolf(`pinned sweep @ ${target}`, 25, { spdBenchmark: target, mode: FIXED })
      rows.push(
        `target=${target} combatSpd=${s.benchmarkCombatSpd.toFixed(1)} spdRolls=${s.benchmarkSpdRolls.toFixed(2)} benchmark=${s.benchmarkScore.toFixed(0)} perfection=${s.perfectionScore.toFixed(0)} measurements=${s.benchmark.measurements}/${s.perfection.measurements} ms=${s.totalMs.toFixed(0)}`,
      )
    }
    log('\n=== PINNED SWEEP\n' + rows.join('\n'))
  }, 1_800_000)

  test('fine pinned sweep 186..200 step 1: ground truth around the chase optimum', async () => {
    const rows: string[] = []
    let best = { target: 0, score: 0 }
    for (let target = 186; target <= 200; target++) {
      const s = await runSilverWolf(`fine sweep @ ${target}`, 25, { spdBenchmark: target, mode: FIXED })
      if (s.benchmarkScore > best.score) best = { target, score: s.benchmarkScore }
      rows.push(`target=${target} spdRolls=${s.benchmarkSpdRolls.toFixed(2)} benchmark=${s.benchmarkScore.toFixed(0)} perfection=${s.perfectionScore.toFixed(0)}`)
    }
    rows.push(`BEST pinned: target=${best.target} benchmark=${best.score.toFixed(0)}`)
    log('\n=== FINE PINNED SWEEP\n' + rows.join('\n'))
  }, 1_800_000)
})

describe('SPD chase experiment: perfection phase probe', () => {
  test('high pinned sweep 210..245: does pinned perfection exceed the CHASE perfection?', async () => {
    const rows: string[] = []
    for (const target of [210, 215, 220, 225, 230, 235, 240, 245]) {
      const s = await runSilverWolf(`high sweep @ ${target}`, 32, { spdBenchmark: target, mode: FIXED })
      rows.push(`target=${target} combatSpd=${s.benchmarkCombatSpd.toFixed(1)} bSpdRolls=${s.benchmarkSpdRolls.toFixed(2)} benchmark=${s.benchmarkScore.toFixed(0)} pSpdRolls=${s.perfectionSpdRolls.toFixed(2)} perfection=${s.perfectionScore.toFixed(0)} measurements=${s.benchmark.measurements}/${s.perfection.measurements}`)
    }
    log('\n=== HIGH PINNED SWEEP\n' + rows.join('\n'))
  }, 1_800_000)
})

describe('SPD chase experiment: multi-combo pool timing', () => {
  test('user sets differ from default: 4-combo pool, 8 partial sims per phase', async () => {
    const userSets = testSets(Sets.MusketeerOfWildWheat, Sets.MusketeerOfWildWheat, Sets.RutilantArena)
    const stats = realisticStats(12, 12, 12, 6, 6)
    const rows: string[] = []
    for (const mode of [FIXED, CHASE, FIXED, CHASE]) {
      const s = await runSilverWolf(`pool ${mode}`, 0, { mode, stats, sets: userSets })
      rows.push(
        `${mode}: bench=${s.benchmarkScore.toFixed(0)} (spdRolls=${s.benchmarkSpdRolls} spd=${s.benchmarkCombatSpd.toFixed(1)}) perf=${s.perfectionScore.toFixed(0)} percent=${(s.percent * 100).toFixed(1)}%`
          + ` | benchmark sims=${s.benchmark.sims} meas=${s.benchmark.measurements} dims=[${s.benchmark.dimensions.join(',')}] ms=${s.benchmark.elapsedMs.toFixed(0)}`
          + ` | perfection sims=${s.perfection.sims} meas=${s.perfection.measurements} ms=${s.perfection.elapsedMs.toFixed(0)} | total ms=${s.totalMs.toFixed(0)}`,
      )
    }
    log('\n=== MULTI-COMBO POOL TIMING\n' + rows.join('\n'))
  }, 1_800_000)
})

// Ground truth on the exact CHASE objective: for every SPD roll count in [min, max], fix SPD at that count
// (real SPD, no forcing) and let the tree optimize the other stats. Compare the best against the single CHASE search.
async function runExhaustiveSpd(label: string, stats: Record<string, number>) {
  const input = generateE0S1Test({
    character: testCharacter(SilverWolfLv999.id, WelcomeToTheCosmicCity.id),
    teammate0: testCharacter('1000', '20000'),
    teammate1: testCharacter('1000', '20000'),
    teammate2: testCharacter('1000', '20000'),
    sets: testSets(Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl, Sets.PunklordeStageZero),
    mains: testMains(Stats.CD, Stats.SPD, Stats.HP_P, Stats.HP_P),
    stats,
  })
  const character = { form: { ...input.character } } as Character
  const simulationMetadata = clone(getGameMetadata().characters[SilverWolfLv999.id].scoringMetadata.simulation!)
  simulationMetadata.spdBenchmarkMode = SpdBenchmarkMode.CHASE
  const singleRelicByPart = generateTestSingleRelicsByPart(input.sets, input.mains, input.stats)

  const rows: string[] = []
  let exhaustiveMeasurements = { benchmark: 0, perfection: 0 }
  const best: Record<string, { score: number, spd: number, treeScore: number, treeSpd: number }> = {}

  const searchRunner: ComputeOptimalSimulationSearchRunner = async (workerInput, runnerContext) => {
    const phase = runnerContext.phase
    const feet = workerInput.partialSimulationWrapper.simulation.request.simFeet
    const body = workerInput.partialSimulationWrapper.simulation.request.simBody
    const minSpd = workerInput.inputMinSubstatRollCounts[Stats.SPD]
    const maxSpd = workerInput.inputMaxSubstatRollCounts[Stats.SPD]

    // Single CHASE tree search (what production does)
    const treeOutput = runComputeOptimalSimulationInline(clone(workerInput))
    const treeScore = treeOutput.simulation!.result!.simScore
    const treeSpd = treeOutput.simulation!.request.stats[Stats.SPD]

    let bestScore = -Infinity
    let bestSpd = -1
    const curve: string[] = []
    for (let k = minSpd; k <= maxSpd; k++) {
      const fixedInput = clone(workerInput)
      fixedInput.inputMinSubstatRollCounts[Stats.SPD] = k
      fixedInput.inputMaxSubstatRollCounts[Stats.SPD] = k
      fixedInput.partialSimulationWrapper.speedRollsDeduction = k
      fixedInput.partialSimulationWrapper.speedRollsMax = k
      let output
      try {
        output = runComputeOptimalSimulationInline(fixedInput)
      } catch (e) {
        curve.push(`${k}:infeasible`)
        continue
      }
      const score = output.simulation!.result!.simScore
      exhaustiveMeasurements[phase] += output.searchStats?.measurements ?? 0
      curve.push(`${k}:${score.toFixed(0)}`)
      if (score > bestScore) {
        bestScore = score
        bestSpd = k
      }
    }
    const key = `${phase} ${body}/${feet}`
    best[key] = { score: bestScore, spd: bestSpd, treeScore, treeSpd }
    rows.push(`${key} spd[${minSpd}..${maxSpd}] tree: spd=${treeSpd} score=${treeScore.toFixed(0)} (meas=${treeOutput.searchStats?.measurements}) | exhaustive best: spd=${bestSpd} score=${bestScore.toFixed(0)} | curve: ${curve.join(' ')}`)
    return treeOutput
  }

  const orchestrator = prepareOrchestrator(
    character,
    { configType: ScoringConfigType.DPS, simulation: simulationMetadata },
    singleRelicByPart,
    {},
  )
  await executeOrchestrator(orchestrator, { searchRunner })

  const verdicts = Object.entries(best).map(([key, b]) => {
    const gap = (b.score - b.treeScore) / b.score
    return `${key}: tree ${b.treeScore >= b.score ? 'MATCHES' : `BELOW by ${(gap * 100).toFixed(3)}%`} exhaustive (tree spd=${b.treeSpd}, exhaustive spd=${b.spd})`
  })
  log(`\n=== EXHAUSTIVE SPD CHECK ${label}\n` + rows.join('\n') + '\n' + verdicts.join('\n')
    + `\nexhaustive measurements: benchmark=${exhaustiveMeasurements.benchmark} perfection=${exhaustiveMeasurements.perfection}`)
}

describe('SPD chase experiment: exhaustive SPD ground truth', () => {
  test('exhaustive over SPD roll count with other stats re-optimized', async () => {
    await runExhaustiveSpd('default sets', realisticStats(12, 12, 12, 6, 6))
  }, 1_800_000)
})

// Records the SPD diminishing-returns exponent decision: how the CHASE optimum moves under exponent 0 (none), 0.10 (current), 0.25 (same as other stats).
describe('SPD chase experiment: SPD DR exponent sensitivity', () => {
  test('exponent 0 / 0.10 / 0.25', async () => {
    const originalSpdFormula = dpsDiminishingReturns.spd
    const variants: [string, typeof originalSpdFormula][] = [
      ['exp 0 (no DR)', (_mains, rolls) => rolls],
      ['exp 0.10 (current)', originalSpdFormula],
      ['exp 0.25 (same as other stats)', createDiminishingReturns(12, 2).stat],
    ]
    const rows: string[] = []
    try {
      for (const [name, formula] of variants) {
        dpsDiminishingReturns.spd = formula
        const s = await runSilverWolf(`DR ${name}`, 0, { mode: CHASE, stats: realisticStats(12, 12, 12, 6, 6) })
        rows.push(`${name}: benchmark spdRolls=${s.benchmarkSpdRolls} combatSpd=${s.benchmarkCombatSpd.toFixed(1)} score=${s.benchmarkScore.toFixed(0)} | perfection spdRolls=${s.perfectionSpdRolls} score=${s.perfectionScore.toFixed(0)} | user B percent=${(s.percent * 100).toFixed(1)}%`)
      }
    } finally {
      dpsDiminishingReturns.spd = originalSpdFormula
    }
    log('\n=== SPD DR EXPONENT SWEEP\n' + rows.join('\n'))
  }, 1_200_000)
})
