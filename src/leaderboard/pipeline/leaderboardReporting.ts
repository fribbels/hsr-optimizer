import type { LeaderboardCliOptions } from 'leaderboard/shared/cliOptions'
import type { MinifiedCharacter } from 'leaderboard/shared/profileCompression'
import type {
  ExportParseSummary,
  FailureEntry,
  LeaderboardBuildScoreCacheStats,
  LeaderboardMetricsSnapshot,
  LeaderboardScoringProfile,
  PrivateRankedEntry,
  PrivateRankedOutput,
} from 'leaderboard/shared/types'
import { gradeConversion, statConversion } from 'lib/importer/characterConverter'
import { Constants } from 'lib/constants/constants'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import { substatPotentialUnits } from 'lib/relics/scoring/scoringConstants'
import { getSimScoreGrade } from 'lib/scoring/dpsScore'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { precisionRound } from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

function getCharacterLogName(characterId: string): string {
  const name = getGameMetadata().characters[characterId as CharacterId]?.name ?? characterId
  const sep = name.indexOf('•')
  return sep >= 0 ? name.substring(sep + 1).trimStart() : name
}

export function printResolvedConfig(options: LeaderboardCliOptions): void {
  console.log('Resolved leaderboard config:')
  console.log(JSON.stringify(options, null, 2))
}

export function printLeaderboardResults(privateOutput: PrivateRankedOutput, topNPublic: number): void {
  console.log('\n========== LEADERBOARD RESULTS ==========')
  for (const [, board] of Object.entries(privateOutput.boards)) {
    const name = getCharacterLogName(board.characterId)
    const topEntries = board.entries.slice(0, topNPublic)
    console.log(`\n--- ${name} (${board.configType.toUpperCase()} ${board.teamId}) - ${board.entries.length} ranked ---`)
    for (const e of topEntries) {
      const pct = (e.score * 100).toFixed(1)
      const grade = getSimScoreGrade(e.score, true, 6)
      const eidolon = e.data.character.r || 0
      const lc = e.data.character.q
      const lcStr = lc ? `LC:${lc.t} S${lc.r}` : 'no LC'
      console.log(`  #${String(e.rank).padStart(2)}  ${pct.padStart(6)}%  ${grade.padEnd(5)}  E${eidolon}  ${lcStr.padEnd(16)}`)
    }
  }
  console.log('\n=========================================')
}

export function printTopNCoverageAnalysis(privateOutput: PrivateRankedOutput, topNPublic: number): void {
  const MIN_AEON_SCORE = 1.50

  type CharStats = {
    boards: number,
    survivors: number,
    scored: number,
    aeonUids: Set<string>,
    topNAeonUids: Set<string>,
    maxRankTopNAeons: number,
  }
  const charStats = new Map<string, CharStats>()

  for (const [, board] of Object.entries(privateOutput.boards)) {
    const charId = board.characterId

    let stats = charStats.get(charId)
    if (!stats) {
      stats = { boards: 0, survivors: board.completeness.totalScoredEntries, scored: 0, aeonUids: new Set(), topNAeonUids: new Set(), maxRankTopNAeons: 0 }
      charStats.set(charId, stats)
    }
    stats.boards++
    stats.scored += board.completeness.totalScoredEntries

    for (const entry of board.entries) {
      if (entry.score >= MIN_AEON_SCORE) {
        stats.aeonUids.add(entry.uidHash)
      }
    }

    const publicEntries = board.entries.slice(0, topNPublic)
    for (const entry of publicEntries) {
      if (entry.score >= MIN_AEON_SCORE) {
        stats.topNAeonUids.add(entry.uidHash)
        if (entry.preFilterRank > stats.maxRankTopNAeons) {
          stats.maxRankTopNAeons = entry.preFilterRank
        }
      }
    }
  }

  const sorted = [...charStats.entries()]
    .map(([charId, stats]) => ({
      charId,
      name: getCharacterLogName(charId),
      boards: stats.boards,
      survivors: stats.survivors,
      scored: stats.scored,
      aeons: stats.aeonUids.size,
      topN: stats.topNAeonUids.size,
      need: stats.maxRankTopNAeons,
    }))
    .sort((a, b) => b.need - a.need)

  const globalMaxRank = sorted.reduce((max, s) => Math.max(max, s.need), 0)

  console.log('\n========== TOP-N COVERAGE ANALYSIS ==========')
  console.log('Question: what --top-n covers the best 100 aeons (>=150%) per board?')
  console.log()
  console.log(`${'Character'.padEnd(20)} ${'Aeons'.padStart(5)} ${'TopN'.padStart(5)} ${'k'.padStart(2)} ${'Surv'.padStart(5)} ${'Scored'.padStart(6)} ${'Need'.padStart(5)}`)
  console.log('-'.repeat(50))
  for (const s of sorted) {
    const need = s.need > 0 ? String(s.need) : '-'
    console.log(
      `${s.name.padEnd(20)} ${String(s.aeons).padStart(5)} ${String(s.topN).padStart(5)} ${String(s.boards).padStart(2)} ${String(s.survivors).padStart(5)} ${String(s.scored).padStart(6)} ${need.padStart(5)}`,
    )
  }
  console.log('-'.repeat(50))
  console.log(`Global max pre-filter rank needed for top-${topNPublic} aeons: ${globalMaxRank}`)
  const margin = Math.ceil(globalMaxRank * 1.5)
  console.log(`Recommended --top-n with 1.5x margin: ${margin}`)
  console.log('==============================================\n')

  printWeightAnalysisSummary(sorted, privateOutput, topNPublic)

  const DIAGNOSTIC_NEED_THRESHOLD = 500
  const highNeedChars = sorted.filter((s) => s.need >= DIAGNOSTIC_NEED_THRESHOLD)
  for (const charStat of highNeedChars) {
    printDeepAeonDiagnostic(charStat.charId, charStat.name, privateOutput, topNPublic)
  }
}

function decodeMainStat(tid: number, mainAffixId: number): string {
  const metadata = getGameMetadata().relics
  const tidStr = String(tid)
  const gradeId = tidStr.substring(0, 1)
  const partId = tidStr.substring(4, 5)
  const key = `${gradeId === '6' ? 5 : Number(gradeId)}${partId}`
  const affixData = metadata.relicMainAffixes[key]?.affixes[mainAffixId]
  if (!affixData) return `?${mainAffixId}`
  const stat = statConversion[affixData.property as keyof typeof statConversion]
  return stat ?? affixData.property
}

function decodeSetName(tid: number): string {
  const metadata = getGameMetadata().relics
  const tidStr = String(tid)
  const setId = tidStr.substring(1, 4)
  return metadata.relicSets[setId]?.name ?? setId
}

function decodeLcName(lcTid: number): string {
  const metadata = getGameMetadata().lightCones
  return metadata[String(lcTid) as LightConeId]?.name ?? String(lcTid)
}

function getBuildSummary(char: MinifiedCharacter): { body: string, feet: string, sphere: string, rope: string, sets: string, eidolon: number, lc: string, lcSuper: number } {
  const relics = char.l ?? []
  let body = '-'
  let feet = '-'
  let sphere = '-'
  let rope = '-'
  const setNames: string[] = []

  for (const relic of relics) {
    const partId = String(relic.t).substring(4, 5)
    const mainStat = decodeMainStat(relic.t, relic.m)
    const setName = decodeSetName(relic.t)
    setNames.push(setName)

    if (partId === '3') body = mainStat
    else if (partId === '4') feet = mainStat
    else if (partId === '5') sphere = mainStat
    else if (partId === '6') rope = mainStat
  }

  const setCounts = new Map<string, number>()
  for (const s of setNames) setCounts.set(s, (setCounts.get(s) ?? 0) + 1)
  const sets = [...setCounts.entries()]
    .filter(([, c]) => c >= 2)
    .map(([name, c]) => `${name}(${c})`)
    .join(' + ') || 'broken'

  return {
    body,
    feet,
    sphere,
    rope,
    sets,
    eidolon: char.r ?? 0,
    lc: char.q ? decodeLcName(char.q.t) : 'none',
    lcSuper: char.q?.r ?? 0,
  }
}

const DIAGNOSTIC_LIMIT = 20

function printDeepAeonDiagnostic(charId: string, charName: string, privateOutput: PrivateRankedOutput, topNPublic: number): void {
  const MIN_AEON_SCORE = 1.50

  const aeonEntries: PrivateRankedEntry[] = []
  const nonAeonEntries: PrivateRankedEntry[] = []

  for (const [, board] of Object.entries(privateOutput.boards)) {
    if (board.characterId !== charId) continue
    const publicEntries = board.entries.slice(0, topNPublic)
    for (const entry of publicEntries) {
      if (entry.score >= MIN_AEON_SCORE) {
        aeonEntries.push(entry)
      } else {
        nonAeonEntries.push(entry)
      }
    }
  }

  aeonEntries.sort((a, b) => b.preFilterRank - a.preFilterRank)
  nonAeonEntries.sort((a, b) => a.preFilterRank - b.preFilterRank)

  console.log(`\n===== DEEP AEON DIAGNOSTIC: ${charName} (${aeonEntries.length} aeons, ${nonAeonEntries.length} non-aeons in top-${topNPublic}) =====`)

  console.log(`\n-- Deepest-ranked aeons (worst prefilter rank first) --`)
  console.log(`${'Rank'.padStart(5)} ${'Score'.padStart(6)} ${'E'.padStart(1)} ${'Body'.padEnd(10)} ${'Feet'.padEnd(10)} ${'Sphere'.padEnd(14)} ${'Rope'.padEnd(10)} LC`)
  for (const entry of aeonEntries.slice(0, DIAGNOSTIC_LIMIT)) {
    const b = getBuildSummary(entry.data.character)
    const pct = (entry.score * 100).toFixed(0)
    console.log(
      `${String(entry.preFilterRank).padStart(5)} ${(pct + '%').padStart(6)} ${String(b.eidolon).padStart(1)} ${b.body.padEnd(10)} ${b.feet.padEnd(10)} ${b.sphere.padEnd(14)} ${b.rope.padEnd(10)} S${b.lcSuper} ${b.lc}`,
    )
  }
  console.log(`  Sets: ${aeonEntries.slice(0, DIAGNOSTIC_LIMIT).map((e) => getBuildSummary(e.data.character).sets).join(' | ')}`)

  console.log(`\n-- Top-ranked non-aeons (best prefilter rank first) --`)
  console.log(`${'Rank'.padStart(5)} ${'Score'.padStart(6)} ${'E'.padStart(1)} ${'Body'.padEnd(10)} ${'Feet'.padEnd(10)} ${'Sphere'.padEnd(14)} ${'Rope'.padEnd(10)} LC`)
  for (const entry of nonAeonEntries.slice(0, DIAGNOSTIC_LIMIT)) {
    const b = getBuildSummary(entry.data.character)
    const pct = (entry.score * 100).toFixed(0)
    console.log(
      `${String(entry.preFilterRank).padStart(5)} ${(pct + '%').padStart(6)} ${String(b.eidolon).padStart(1)} ${b.body.padEnd(10)} ${b.feet.padEnd(10)} ${b.sphere.padEnd(14)} ${b.rope.padEnd(10)} S${b.lcSuper} ${b.lc}`,
    )
  }
  console.log(`  Sets: ${nonAeonEntries.slice(0, DIAGNOSTIC_LIMIT).map((e) => getBuildSummary(e.data.character).sets).join(' | ')}`)
  console.log()
}

function extractSubstatUnitsFromMinified(char: MinifiedCharacter): Record<string, number> {
  const metadata = getGameMetadata().relics
  const units: Record<string, number> = {}

  for (const relic of char.l ?? []) {
    const tidStr = String(relic.t)
    const gradeId = tidStr.substring(0, 1)
    const grade = gradeConversion[gradeId] ?? 5

    for (const sub of relic.u) {
      const subData = metadata.relicSubAffixes[grade]?.affixes[sub.a]
      if (!subData) continue

      const stat = statConversion[subData.property as keyof typeof statConversion] as string
      if (!stat) continue

      const count = sub.c
      const step = sub.s || 0
      const rawValue = subData.base * count + subData.step * step
      let value = precisionRound(rawValue * (isFlat(stat) ? 1 : 100), 5)
      value = RelicRollFixer.fixSubStatValue(stat, value, grade)

      units[stat] = (units[stat] ?? 0) + substatPotentialUnits(stat, value)
    }
  }

  return units
}

const STAT_SHORT: Record<string, string> = {
  [Constants.Stats.CR]: 'CR',
  [Constants.Stats.CD]: 'CD',
  [Constants.Stats.ATK_P]: 'ATK%',
  [Constants.Stats.HP_P]: 'HP%',
  [Constants.Stats.DEF_P]: 'DEF%',
  [Constants.Stats.SPD]: 'SPD',
  [Constants.Stats.EHR]: 'EHR',
  [Constants.Stats.RES]: 'RES',
  [Constants.Stats.BE]: 'BE',
  [Constants.Stats.ERR]: 'ERR',
  [Constants.Stats.OHB]: 'OHB',
}

const EXCLUDED_STATS = new Set([Constants.Stats.ATK, Constants.Stats.HP, Constants.Stats.DEF])

const STAT_ORDER = [
  Constants.Stats.ATK_P, Constants.Stats.HP_P, Constants.Stats.DEF_P,
  Constants.Stats.CR, Constants.Stats.CD, Constants.Stats.SPD,
  Constants.Stats.EHR, Constants.Stats.RES, Constants.Stats.BE,
  Constants.Stats.ERR, Constants.Stats.OHB,
]

type SubstatAnalysisResult = {
  charId: string,
  name: string,
  stats: string[],
  weights: number[],
}

function analyzeSubstatAllocation(charId: string, privateOutput: PrivateRankedOutput, topNPublic: number): SubstatAnalysisResult | null {
  type EntryData = { units: Record<string, number>, isTop: boolean }
  const entryMap = new Map<string, EntryData>()

  for (const [, board] of Object.entries(privateOutput.boards)) {
    if (board.characterId !== charId) continue
    for (const entry of board.entries) {
      const existing = entryMap.get(entry.uidHash)
      if (!existing) {
        entryMap.set(entry.uidHash, {
          units: extractSubstatUnitsFromMinified(entry.data.character),
          isTop: entry.rank <= topNPublic,
        })
      } else if (entry.rank <= topNPublic) {
        existing.isTop = true
      }
    }
  }

  const topEntries = [...entryMap.values()].filter((e) => e.isTop)
  if (topEntries.length === 0) return null

  const stats = STAT_ORDER.filter((stat) => !EXCLUDED_STATS.has(stat))

  const avgAllocation = stats.map(() => 0)
  for (const entry of topEntries) {
    let total = 0
    for (const stat of stats) {
      total += entry.units[stat] ?? 0
    }
    if (total === 0) continue
    for (let i = 0; i < stats.length; i++) {
      avgAllocation[i] += (entry.units[stats[i]] ?? 0) / total
    }
  }
  for (let i = 0; i < stats.length; i++) {
    avgAllocation[i] /= topEntries.length
  }

  const maxAlloc = Math.max(...avgAllocation)
  const weights = maxAlloc > 0
    ? avgAllocation.map((a) => precisionRound(a / maxAlloc, 2))
    : avgAllocation

  return {
    charId,
    name: getCharacterLogName(charId),
    stats,
    weights,
  }
}

type CoverageCharStat = { charId: string, name: string, aeons: number, topN: number, boards: number, survivors: number, scored: number, need: number }

function printWeightAnalysisSummary(chars: CoverageCharStat[], privateOutput: PrivateRankedOutput, topNPublic: number): void {
  const fs = require('fs') as typeof import('fs')
  const path = require('path') as typeof import('path')

  console.log('\n========== SUBSTAT ANALYSIS: top-100 substat allocation (normalized to 1.00) ==========')
  const results: SubstatAnalysisResult[] = []

  for (const c of chars) {
    const result = analyzeSubstatAllocation(c.charId, privateOutput, topNPublic)
    if (result) results.push(result)
  }

  const usedStats = new Set<string>()
  for (const r of results) {
    for (const stat of r.stats) usedStats.add(stat)
  }
  const columns = STAT_ORDER.filter((s) => usedStats.has(s))

  const COL_W = 10
  const charMap = new Map(chars.map((c) => [c.charId, c]))
  const prefix = `${'Character'.padEnd(20)} ${'Aeons'.padStart(5)} ${'TopN'.padStart(5)} ${'k'.padStart(2)} ${'Surv'.padStart(5)} ${'Need'.padStart(5)}`
  const header = prefix + columns.map((s) => (STAT_SHORT[s] ?? s).padStart(COL_W)).join('')

  console.log()
  console.log(header)
  const divider = '-'.repeat(header.length)
  console.log(divider)

  const lines: string[] = [header, divider]

  for (const r of results) {
    const weightMap = new Map<string, number>()
    for (let i = 0; i < r.stats.length; i++) {
      weightMap.set(r.stats[i], r.weights[i])
    }

    const c = charMap.get(r.charId)!
    let line = `${r.name.padEnd(20)} ${String(c.aeons).padStart(5)} ${String(c.topN).padStart(5)} ${String(c.boards).padStart(2)} ${String(c.survivors).padStart(5)} ${String(c.need).padStart(5)}`
    for (const stat of columns) {
      const w = weightMap.get(stat)
      if (w === undefined) {
        line += ' '.repeat(COL_W)
      } else {
        line += w.toFixed(2).padStart(COL_W)
      }
    }
    console.log(line)
    lines.push(line)
  }

  console.log(divider)
  lines.push(divider)
  console.log()

  const outDir = path.resolve('plans/scratch')
  fs.mkdirSync(outDir, { recursive: true })

  const txtPath = path.resolve(outDir, 'weight-analysis.txt')
  fs.writeFileSync(txtPath, lines.join('\n') + '\n')
  console.log(`  → saved to ${txtPath}`)

  const jsonData = results.map((r) => {
    const c = charMap.get(r.charId)!
    const weights: Record<string, number> = {}
    for (let i = 0; i < r.stats.length; i++) {
      weights[STAT_SHORT[r.stats[i]] ?? r.stats[i]] = r.weights[i]
    }
    const charMeta = getGameMetadata().characters[r.charId as CharacterId]
    return {
      charId: r.charId,
      name: r.name,
      path: charMeta?.path ?? '',
      aeons: c.aeons,
      topN: c.topN,
      boards: c.boards,
      survivors: c.survivors,
      need: c.need,
      weights,
    }
  })
  const jsonPath = path.resolve(outDir, 'weight-analysis.json')
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2) + '\n')
  console.log(`  → saved to ${jsonPath}`)
}

type RunSummaryInput = {
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
  exportProfileCount: number,
  parseSummary: ExportParseSummary,
  profiles: LeaderboardScoringProfile[],
  totalCandidates: number,
  metrics: LeaderboardMetricsSnapshot,
  workerCount: number,
  buildScoreCacheDbPath: string,
  freshRun: boolean,
  pruneBuildScoreCache: boolean,
  topN: number,
  topNPublic: number,
  parseElapsedMs: number,
  prefilterElapsedMs: number,
  scoringElapsedMs: number,
  runElapsedMs: number,
}

export function printRunSummary(input: RunSummaryInput): void {
  const { entries, failures, buildScoreCacheStats, profiles } = input
  const scoringSec = input.scoringElapsedMs / 1000
  const runSec = input.runElapsedMs / 1000

  const perCharStats: Record<string, { entries: number, failures: number }> = {}
  for (const e of entries) {
    const key = getCharacterLogName(String(e.characterId))
    const stat = perCharStats[key] ??= { entries: 0, failures: 0 }
    stat.entries++
  }
  for (const f of failures) {
    const key = getCharacterLogName(String(f.characterId))
    const stat = perCharStats[key] ??= { entries: 0, failures: 0 }
    stat.failures++
  }

  console.log('\n========== RUN SUMMARY ==========')
  console.log(`Config:`)
  console.log(`  workerMode: profile`)
  console.log(`  workerCount: ${input.workerCount}`)
  console.log(`  buildScoreCacheDbPath: ${input.buildScoreCacheDbPath}`)
  console.log(`  freshRun: ${input.freshRun}`)
  console.log(`  pruneBuildScoreCache: ${input.pruneBuildScoreCache}`)
  console.log(`  topN: ${input.topN}`)
  console.log(`  topNPublic: ${input.topNPublic}`)
  console.log(`Input:`)
  console.log(`  exportProfiles: ${input.exportProfileCount}`)
  console.log(`  submitted: ${profiles.length} profiles, ${input.totalCandidates} candidates`)
  console.log(`Scoring:`)
  console.log(`  entries: ${entries.length}`)
  console.log(`  failures: ${failures.length}`)
  for (const [charName, stat] of Object.entries(perCharStats)) {
    console.log(`    ${charName}: ${stat.entries} entries, ${stat.failures} failures`)
  }
  console.log(`Timing:`)
  console.log(`  parse: ${(input.parseElapsedMs / 1000).toFixed(1)}s`)
  console.log(`  prefilter: ${(input.prefilterElapsedMs / 1000).toFixed(1)}s`)
  console.log(`  scoring: ${scoringSec.toFixed(1)}s`)
  console.log(`  total: ${runSec.toFixed(1)}s`)
  console.log(`Throughput:`)
  if (scoringSec > 0 && entries.length > 0) {
    console.log(`  entries/sec: ${(entries.length / scoringSec).toFixed(2)}`)
    console.log(`  profiles/sec: ${(profiles.length / scoringSec).toFixed(2)}`)
    console.log(`  candidates/sec: ${(input.totalCandidates / scoringSec).toFixed(2)}`)
  } else {
    console.log(`  (no scoring work performed)`)
  }
  console.log(`Leaderboard Build Score Cache:`)
  console.log(`  l1Hits: ${buildScoreCacheStats.l1Hits}`)
  console.log(`  sqliteHits: ${buildScoreCacheStats.sqliteHits}`)
  console.log(`  misses: ${buildScoreCacheStats.misses}`)
  console.log(`  writes: ${buildScoreCacheStats.writes}`)
  console.log(`  corruptRowsDeleted: ${buildScoreCacheStats.corruptRowsDeleted}`)
  const cacheHits = buildScoreCacheStats.l1Hits + buildScoreCacheStats.sqliteHits
  if (cacheHits + buildScoreCacheStats.misses > 0) {
    console.log(`  hitRate: ${((cacheHits / (cacheHits + buildScoreCacheStats.misses)) * 100).toFixed(1)}%`)
  }
  const { characterErrors } = input.parseSummary
  if (characterErrors.length > 0) {
    const byAvatar = new Map<number, number>()
    for (const err of characterErrors) {
      byAvatar.set(err.avatarId, (byAvatar.get(err.avatarId) ?? 0) + 1)
    }
    console.log(`Character parse errors: ${characterErrors.length}`)
    for (const [avatarId, count] of [...byAvatar.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${getCharacterLogName(String(avatarId))}: ${count}`)
    }
  }
  console.log(`Metrics:`, JSON.stringify(input.metrics, null, 2))
  console.log('=================================\n')
}
