// @vitest-environment jsdom
import { readFileSync } from 'fs'
import { performance } from 'perf_hooks'
import { applyTeamAwareSetConditionalPresets } from 'lib/conditionals/evaluation/applyPresets'
import { Stats } from 'lib/constants/constants'
import type { SetsOrnaments, SetsRelics } from 'lib/sets/setConfigRegistry'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import { getAKeyName, GlobalRegister, StatKey } from 'lib/optimization/engine/config/keys'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { AbilityMeta } from 'lib/optimization/rotation/turnAbilityConfig'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import type { Simulation } from 'lib/simulations/statSimulationTypes'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import {
  trackedBasicStatKeys,
  trackedCombatStatKeys,
} from 'lib/simulations/tests/simTestUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { describe, expect, test } from 'vitest'

Metadata.initialize()

// ─── Constants ──────────────────────────────────────────────────────────────

const EPSILON = 1e-5
const BasicKeyNames = Object.keys(BasicKey) as (keyof typeof BasicKey)[]

// ─── Stat spread reconstruction from build labels ───────────────────────────

const STAT_SPREAD_MAP: Record<string, Record<string, number>> = {
  balanced: { [Stats.ATK_P]: 10, [Stats.DEF_P]: 10, [Stats.HP_P]: 10, [Stats.SPD]: 10, [Stats.CR]: 10, [Stats.CD]: 10, [Stats.EHR]: 10, [Stats.RES]: 10, [Stats.BE]: 10 },
  crit: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 15, [Stats.CD]: 15, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 },
  speed: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 15, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 },
  break: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 15 },
  defensive: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 15, [Stats.HP_P]: 15, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 },
  none: {},
  atk_heavy: { [Stats.ATK_P]: 20, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 },
  cd_stack: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 25, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 },
  ehr: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 15, [Stats.RES]: 5, [Stats.BE]: 5 },
  err: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5, [Stats.ERR]: 10 },
  ohb: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 10, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5, [Stats.OHB]: 15 },
  high_rolls: { [Stats.ATK_P]: 15, [Stats.DEF_P]: 15, [Stats.HP_P]: 15, [Stats.SPD]: 15, [Stats.CR]: 15, [Stats.CD]: 15, [Stats.EHR]: 15, [Stats.RES]: 15, [Stats.BE]: 15 },
  spd_crit: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 15, [Stats.CR]: 10, [Stats.CD]: 15, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 },
  break_ehr: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 15, [Stats.RES]: 5, [Stats.BE]: 15 },
  tank: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 20, [Stats.HP_P]: 20, [Stats.SPD]: 10, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 10, [Stats.BE]: 5 },
  low_rolls: { [Stats.ATK_P]: 3, [Stats.DEF_P]: 3, [Stats.HP_P]: 3, [Stats.SPD]: 3, [Stats.CR]: 3, [Stats.CD]: 3, [Stats.EHR]: 3, [Stats.RES]: 3, [Stats.BE]: 3 },
}

function getStatsForSpread(spreadLabel: string): Record<string, number> {
  return STAT_SPREAD_MAP[spreadLabel] ?? {}
}

// ─── Result extraction (mirrors generator) ──────────────────────────────────

function extractActualResults(result: ReturnType<typeof runStatSimulations>[0]) {
  const { x, primaryActionStats, actionDamage } = result

  const basicStats: Record<string, number> = {}
  for (const key of trackedBasicStatKeys) {
    basicStats[BasicKeyNames[key]] = precisionRound(x.c.a[key], 6)
  }

  const combatStats: Record<string, number> = {}
  for (const key of trackedCombatStatKeys) {
    combatStats[getAKeyName(key)] = precisionRound(x.a[key], 6)
  }
  if (primaryActionStats) {
    combatStats['CR'] = precisionRound(primaryActionStats.sourceEntityCR, 6)
    combatStats['CD'] = precisionRound(primaryActionStats.sourceEntityCD, 6)
    combatStats['DMG_BOOST'] = precisionRound(
      primaryActionStats.DMG_BOOST + primaryActionStats.sourceEntityElementDmgBoost, 6,
    )
  }
  combatStats['EHP'] = precisionRound(x.a[StatKey.EHP], 6)
  combatStats['COMBO_DMG'] = precisionRound(x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG), 6)

  const roundedActionDamage: Record<string, number> = {}
  for (const ability of ['BASIC', 'SKILL', 'ULT', 'FUA', 'DOT', 'BREAK', 'MEMO_SKILL', 'MEMO_TALENT']) {
    roundedActionDamage[`${ability}_DMG`] = 0
  }
  roundedActionDamage['HEAL_VALUE'] = 0
  roundedActionDamage['SHIELD_VALUE'] = 0

  if (actionDamage) {
    let healValue = 0
    let shieldValue = 0
    for (const [actionName, dmg] of Object.entries(actionDamage)) {
      const abilityKind = actionName.replace(/^[A-Z]+_/, '')
      const meta = AbilityMeta[abilityKind as keyof typeof AbilityMeta]
      if (meta?.category === 'heal') healValue += dmg ?? 0
      else if (meta?.category === 'shield') shieldValue += dmg ?? 0
      else if (meta?.category === 'damage') roundedActionDamage[`${abilityKind}_DMG`] = precisionRound(dmg ?? 0, 6)
    }
    roundedActionDamage['HEAL_VALUE'] = precisionRound(healValue, 6)
    roundedActionDamage['SHIELD_VALUE'] = precisionRound(shieldValue, 6)
  }

  return {
    comboDmg: precisionRound(x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG), 6),
    ehp: precisionRound(x.a[StatKey.EHP], 6),
    primaryActionStats: {
      DMG_BOOST: precisionRound(primaryActionStats?.DMG_BOOST ?? 0, 6),
      sourceEntityCR: precisionRound(primaryActionStats?.sourceEntityCR ?? 0, 6),
      sourceEntityCD: precisionRound(primaryActionStats?.sourceEntityCD ?? 0, 6),
      sourceEntityElementDmgBoost: precisionRound(primaryActionStats?.sourceEntityElementDmgBoost ?? 0, 6),
    },
    actionDamage: roundedActionDamage,
    basicStats,
    combatStats,
  }
}

// ─── Form reconstruction ────────────────────────────────────────────────────

function reconstructForm(characterId: CharacterId, lightConeId: LightConeId) {
  const form = generateFullDefaultForm(characterId, lightConeId, 0, 1)
  if (!form) return null

  const simMeta = getGameMetadata().characters[characterId]?.scoringMetadata?.simulation
  if (simMeta?.teammates) {
    for (let idx = 0; idx < Math.min(simMeta.teammates.length, 3); idx++) {
      const tm = simMeta.teammates[idx]
      if (!tm?.characterId) continue
      const tmForm = generateFullDefaultForm(tm.characterId, tm.lightCone, tm.characterEidolon, tm.lightConeSuperimposition, true)
      if (!tmForm) continue
      if (tm.teamRelicSet) tmForm.teamRelicSet = tm.teamRelicSet
      if (tm.teamOrnamentSet) tmForm.teamOrnamentSet = tm.teamOrnamentSet
      if (idx === 0) form.teammate0 = tmForm
      if (idx === 1) form.teammate1 = tmForm
      if (idx === 2) form.teammate2 = tmForm
    }
  }
  applyTeamAwareSetConditionalPresets(form)
  return form
}

// ─── Comparison ─────────────────────────────────────────────────────────────

function compareRecord(
  actual: Record<string, number>,
  expected: Record<string, number>,
  section: string,
  charId: string,
  buildLabel: string,
  failures: string[],
) {
  for (const [key, expectedVal] of Object.entries(expected)) {
    const actualVal = actual[key] ?? 0
    const diff = Math.abs(actualVal - expectedVal)
    const relativeDiff = expectedVal !== 0 ? diff / Math.abs(expectedVal) : diff
    if (diff > EPSILON && relativeDiff > EPSILON) {
      failures.push(`${charId} / ${buildLabel} / ${section}.${key}: expected ${expectedVal}, got ${actualVal} (diff=${diff.toExponential(2)})`)
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const BENCHMARK_RUNS = 3

interface PreparedCharacter {
  characterId: string
  form: NonNullable<ReturnType<typeof reconstructForm>>
  context: ReturnType<typeof generateContext>
  builds: Array<{ label: string, spreadLabel: string, simRelicSet1: string, simRelicSet2: string, simOrnamentSet: string, expected: Record<string, unknown> }>
}

function buildSimulation(build: PreparedCharacter['builds'][0]): Simulation {
  return {
    simType: StatSimTypes.SubstatRolls,
    request: {
      simRelicSet1: build.simRelicSet1 as SetsRelics,
      simRelicSet2: build.simRelicSet2 as SetsRelics,
      simOrnamentSet: build.simOrnamentSet as SetsOrnaments,
      simBody: Stats.CR,
      simFeet: Stats.SPD,
      simPlanarSphere: Stats.ATK_P,
      simLinkRope: Stats.ATK_P,
      stats: getStatsForSpread(build.spreadLabel),
    },
  } as unknown as Simulation
}

function runSimPass(prepared: PreparedCharacter[]): { charSimMs: number[] } {
  const charSimMs: number[] = []
  for (const char of prepared) {
    const tSim = performance.now()
    for (const build of char.builds) {
      runStatSimulations([buildSimulation(build)], char.form, char.context)
    }
    charSimMs.push(performance.now() - tSim)
  }
  return { charSimMs }
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

// ─── Test ───────────────────────────────────────────────────────────────────

describe('verify simulateBuild golden data', () => {
  test('all characters match golden data (3-run median benchmark)', () => {
    const goldenDataRaw = readFileSync('src/lib/simulations/tests/goldenData/goldenSimBuildResults.json', 'utf-8')
    const goldenData = JSON.parse(goldenDataRaw)
    const dbMeta = getGameMetadata()

    // ── Phase 1: Prepare contexts (timed separately) ──
    const tCtxStart = performance.now()
    const prepared: PreparedCharacter[] = []
    const failures: string[] = []

    for (const charData of goldenData.characters) {
      const { characterId, lightConeId, builds } = charData
      const form = reconstructForm(characterId as CharacterId, lightConeId as LightConeId)
      if (!form) {
        failures.push(`${characterId}: failed to reconstruct form`)
        continue
      }
      const context = generateContext(form)
      prepared.push({ characterId, form, context, builds })
    }
    const contextMs = performance.now() - tCtxStart

    // ── Phase 2: Correctness verification (run 1) ──
    let totalBuilds = 0
    for (const char of prepared) {
      for (const build of char.builds) {
        const result = runStatSimulations([buildSimulation(build)], char.form, char.context)[0]
        const actual = extractActualResults(result)
        const expected = build.expected as ReturnType<typeof extractActualResults>

        compareRecord(actual.basicStats, expected.basicStats, 'basicStats', char.characterId, build.label, failures)
        compareRecord(actual.combatStats, expected.combatStats, 'combatStats', char.characterId, build.label, failures)
        compareRecord(actual.actionDamage, expected.actionDamage, 'actionDamage', char.characterId, build.label, failures)
        compareRecord(
          actual.primaryActionStats as unknown as Record<string, number>,
          expected.primaryActionStats as unknown as Record<string, number>,
          'primaryActionStats', char.characterId, build.label, failures,
        )

        const comboDiff = Math.abs(actual.comboDmg - expected.comboDmg)
        if (comboDiff > EPSILON && (expected.comboDmg === 0 || comboDiff / Math.abs(expected.comboDmg) > EPSILON)) {
          failures.push(`${char.characterId} / ${build.label} / comboDmg: expected ${expected.comboDmg}, got ${actual.comboDmg}`)
        }

        const ehpDiff = Math.abs(actual.ehp - expected.ehp)
        if (ehpDiff > EPSILON && (expected.ehp === 0 || ehpDiff / Math.abs(expected.ehp) > EPSILON)) {
          failures.push(`${char.characterId} / ${build.label} / ehp: expected ${expected.ehp}, got ${actual.ehp}`)
        }
        totalBuilds++
      }
    }

    // ── Phase 3: Benchmark (3 runs, take median) ──
    const runSimTotals: number[] = []
    const perCharRuns: number[][] = prepared.map(() => [])

    for (let run = 0; run < BENCHMARK_RUNS; run++) {
      const { charSimMs } = runSimPass(prepared)
      runSimTotals.push(charSimMs.reduce((a, b) => a + b, 0))
      for (let i = 0; i < charSimMs.length; i++) {
        perCharRuns[i].push(charSimMs[i])
      }
    }

    const medianSimMs = median(runSimTotals)

    // Per-character median sim times
    const charMedians = prepared.map((char, i) => ({
      id: char.characterId,
      simMs: median(perCharRuns[i]),
      builds: char.builds.length,
    }))
    charMedians.sort((a, b) => b.simMs - a.simMs)

    const sortedMedians = charMedians.map((c) => c.simMs).sort((a, b) => a - b)
    const p50 = sortedMedians[Math.floor(sortedMedians.length * 0.5)]
    const p95 = sortedMedians[Math.floor(sortedMedians.length * 0.95)]

    console.log('================================================================================')
    console.log('GOLDEN SIMULATEBUILD VERIFICATION + BENCHMARK')
    console.log('================================================================================')
    console.log(`Characters:       ${prepared.length}`)
    console.log(`Total builds:     ${totalBuilds}`)
    console.log(`Benchmark runs:   ${BENCHMARK_RUNS}`)
    console.log(`Failures:         ${failures.length}`)
    console.log('')
    console.log('── Timing (median of 3 runs) ──')
    console.log(`Context gen:      ${contextMs.toFixed(1)} ms`)
    console.log(`Simulations:      ${medianSimMs.toFixed(1)} ms`)
    console.log(`All 3 runs:       ${runSimTotals.map((t) => t.toFixed(1) + ' ms').join(', ')}`)
    console.log('')
    console.log('── Per-Build (median) ──')
    console.log(`Avg per build:    ${(medianSimMs / totalBuilds).toFixed(3)} ms`)
    console.log(`Throughput:       ${(totalBuilds / (medianSimMs / 1000)).toFixed(0)} builds/sec`)
    console.log('')
    console.log('── Per-Character Sim Time (median) ──')
    console.log(`p50:              ${p50.toFixed(1)} ms`)
    console.log(`p95:              ${p95.toFixed(1)} ms`)
    console.log(`Slowest:          ${sortedMedians[sortedMedians.length - 1].toFixed(1)} ms`)
    console.log('')
    console.log('── Slowest 5 Characters ──')
    for (let i = 0; i < Math.min(5, charMedians.length); i++) {
      const c = charMedians[i]
      const name = dbMeta.characters[c.id as CharacterId]?.name ?? c.id
      console.log(`  ${name.padEnd(20)} ${c.simMs.toFixed(1)} ms  (${c.builds} builds, ${(c.simMs / c.builds).toFixed(3)} ms/build)`)
    }
    console.log('')
    console.log('── AGENT: Next Steps ──')
    console.log(`1. Record median: ${medianSimMs.toFixed(1)} ms | Throughput: ${(totalBuilds / (medianSimMs / 1000)).toFixed(0)} builds/sec`)
    console.log('2. Log this iteration to .claude/plans/optimization-log.md:')
    console.log('   [ITERATION N] target: <what>, result: kept/reverted, before: Xms, after: Xms, why: <1-line reason>')
    console.log('3. If you just made a change:')
    console.log('   - IMPROVED? Commit with before/after numbers')
    console.log('   - SAME or WORSE? Revert with: git checkout src/')
    console.log('4. Pick next target — investigate the slowest characters above')
    console.log('5. Implement ONE change, then run: npm run bench:simbuild:verify')
    console.log('6. Read the FULL output above, then IMMEDIATELY begin next iteration.')
    console.log('================================================================================')

    // Assert no failures
    if (failures.length > 0) {
      const sample = failures.slice(0, 20).join('\n  ')
      const extra = failures.length > 20 ? `\n  ... and ${failures.length - 20} more` : ''
      expect.fail(`${failures.length} golden data mismatches:\n  ${sample}${extra}`)
    }
  }, 300_000)
})
