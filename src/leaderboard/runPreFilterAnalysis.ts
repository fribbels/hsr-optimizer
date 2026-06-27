import { parseExport } from 'leaderboard/ingest/exportParser'
import { preFilterProfiles } from 'leaderboard/ingest/preFilter'
import {
  computePreFilterSubstatScore,
  extractPreFilterSubstats,
} from 'leaderboard/ingest/preFilterExtractor'
import { readPrivateRankedOutput } from 'leaderboard/output/privateOutput'
import { MIN_PUBLIC_SCORE } from 'leaderboard/shared/constants'
import { findLatestServerExport } from 'leaderboard/shared/exportResolution'
import {
  computeBuildId,
  hashUid,
} from 'leaderboard/shared/hash'
import {
  homeDir,
  isMainModule,
  resolvePath,
  setExitCode,
} from 'leaderboard/shared/nodeFacade'
import type {
  LeaderboardScoringCharacter,
  PrivateRankedEntry,
} from 'leaderboard/shared/types'
import {
  gradeConversion,
  partConversion,
  statConversion,
  tidOverrides,
  type UnconvertedCharacter,
} from 'lib/importer/characterConverter'
import { Constants, type Parts, type StatsValues } from 'lib/constants/constants'
import { prepareScoringMetadata } from 'lib/relics/scoring/scoringMetadata'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { enrichSimulationMetadata } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import type { CharacterId } from 'types/character'
import type { SimulationMetadata } from 'types/metadata'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAIN_STAT_PARTS = new Set<string>([
  Constants.Parts.Body,
  Constants.Parts.Feet,
  Constants.Parts.PlanarSphere,
  Constants.Parts.LinkRope,
])

const ORNAMENT_PARTS = new Set<string>([
  Constants.Parts.PlanarSphere,
  Constants.Parts.LinkRope,
])

// ---------------------------------------------------------------------------
// Relic extraction
// ---------------------------------------------------------------------------

type RelicInfo = {
  part: Parts
  setId: string
  mainStat: StatsValues | null
}

function extractRelicInfos(unconverted: UnconvertedCharacter): RelicInfo[] {
  const relicList = unconverted.relicList
  if (!relicList) return []

  const metadata = getGameMetadata().relics
  const results: RelicInfo[] = []

  for (const preRelic of relicList) {
    const tid = String(preRelic.tid)
    const override = tidOverrides[tid]

    const setId = override?.set ?? tid.substring(1, 4)
    const partId = override?.part ?? tid.substring(4, 5)
    const gradeId = tid.substring(0, 1)
    const grade = gradeConversion[gradeId] ?? 5
    const part = partConversion[partId]
    if (!part) continue

    let mainStat: StatsValues | null = null
    try {
      let mainId = preRelic.mainAffixId
      const mainKey = override ? override.main : `${grade}${partId}`
      if (!mainId && preRelic.main_affix?.type) {
        const affixes = metadata.relicMainAffixes[mainKey]?.affixes
        if (affixes) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const match = Object.values(affixes).find((x: any) => x.property === preRelic.main_affix?.type)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (match) mainId = Number((match as any).affix_id)
        }
      }
      if (mainId) {
        const mainData = metadata.relicMainAffixes[mainKey]?.affixes[mainId]
        if (mainData) {
          mainStat = (statConversion as Record<string, StatsValues>)[mainData.property as string] ?? null
        }
      }
    } catch {
      // skip main stat resolution failures
    }

    results.push({ part, setId, mainStat })
  }

  return results
}

// ---------------------------------------------------------------------------
// Sim-aware parts: union across all config types + enrichment + errRopeEidolon
// ---------------------------------------------------------------------------

const SIM_FIELDS = ['simulation', 'supportSimulation', 'healSimulation', 'shieldSimulation'] as const

type PreFilterParts = Record<string, Set<StatsValues>>

function buildPreFilterParts(charId: CharacterId): PreFilterParts {
  const gameChar = getGameMetadata().characters[charId]
  if (!gameChar?.scoringMetadata) return {}

  const scoringMeta = gameChar.scoringMetadata
  const union: PreFilterParts = {}

  for (const field of SIM_FIELDS) {
    const simMeta = scoringMeta[field] as SimulationMetadata | undefined
    if (!simMeta) continue

    const enriched = JSON.parse(JSON.stringify(simMeta)) as SimulationMetadata
    enrichSimulationMetadata(enriched)

    for (const [part, stats] of Object.entries(enriched.parts)) {
      if (!union[part]) union[part] = new Set()
      for (const stat of stats) {
        union[part].add(stat as StatsValues)
      }
    }

    if (simMeta.errRopeEidolon != null) {
      const rope = Constants.Parts.LinkRope
      if (!union[rope]) union[rope] = new Set()
      union[rope].add(Constants.Stats.ERR as StatsValues)
    }
  }

  return union
}

// ---------------------------------------------------------------------------
// Filter A: main stat validity
// ---------------------------------------------------------------------------

type MainStatMismatch = {
  part: Parts
  actual: StatsValues
  expected: StatsValues[]
}

type MainStatResult = {
  wrongCount: number
  totalChecked: number
  mismatches: MainStatMismatch[]
}

function checkMainStats(relicInfos: RelicInfo[], validParts: PreFilterParts): MainStatResult {
  let wrongCount = 0
  let totalChecked = 0
  const mismatches: MainStatMismatch[] = []

  for (const relic of relicInfos) {
    if (!MAIN_STAT_PARTS.has(relic.part)) continue
    if (!relic.mainStat) continue

    totalChecked++
    const validMains = validParts[relic.part]
    if (!validMains || validMains.size === 0) continue // empty = any accepted
    if (!validMains.has(relic.mainStat)) {
      wrongCount++
      mismatches.push({ part: relic.part, actual: relic.mainStat, expected: [...validMains] })
    }
  }

  return { wrongCount, totalChecked, mismatches }
}

// ---------------------------------------------------------------------------
// Filter B: set completion
// ---------------------------------------------------------------------------

type SetResult = {
  has2pOrnament: boolean
  hasRelicCompletion: boolean
}

function checkSetCompletion(relicInfos: RelicInfo[]): SetResult {
  const relicSetCounts = new Map<string, number>()
  const ornamentSetCounts = new Map<string, number>()

  for (const relic of relicInfos) {
    const counts = ORNAMENT_PARTS.has(relic.part) ? ornamentSetCounts : relicSetCounts
    counts.set(relic.setId, (counts.get(relic.setId) ?? 0) + 1)
  }

  const has2pOrnament = [...ornamentSetCounts.values()].some((c) => c >= 2)
  const has4pRelic = [...relicSetCounts.values()].some((c) => c >= 4)
  const has2p2pRelic = [...relicSetCounts.values()].filter((c) => c >= 2).length >= 2

  return { has2pOrnament, hasRelicCompletion: has4pRelic || has2p2pRelic }
}

// ---------------------------------------------------------------------------
// Per-candidate analysis
// ---------------------------------------------------------------------------

type CandidateAnalysis = {
  uid: string
  charId: string
  preFilterRank: number
  qualityOrder: number
  mainStats: MainStatResult
  sets: SetResult
  passesMainStatFilter: boolean
  passesSetFilter: boolean
  passesBothFilters: boolean
}

function analyzeSurvivor(
  uid: string,
  character: LeaderboardScoringCharacter,
  validParts: PreFilterParts,
): CandidateAnalysis {
  const charId = String(character.unconverted.avatarId)
  const relicInfos = extractRelicInfos(character.unconverted)
  const mainStats = checkMainStats(relicInfos, validParts)
  const sets = checkSetCompletion(relicInfos)

  const passesMainStatFilter = mainStats.wrongCount === 0
  const passesSetFilter = sets.has2pOrnament && sets.hasRelicCompletion

  return {
    uid,
    charId,
    preFilterRank: character.preFilterRank,
    qualityOrder: character.qualityOrder,
    mainStats,
    sets,
    passesMainStatFilter,
    passesSetFilter,
    passesBothFilters: passesMainStatFilter && passesSetFilter,
  }
}

// ---------------------------------------------------------------------------
// Export resolution (mirrors leaderboardPipeline)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Reporting helpers
// ---------------------------------------------------------------------------

function pad(s: string, w: number): string {
  return s.length >= w ? s : s + ' '.repeat(w - s.length)
}

function pct(n: number, d: number): string {
  return d === 0 ? '0.0' : ((n / d) * 100).toFixed(1)
}

function charName(charId: string): string {
  const meta = getGameMetadata().characters[charId as CharacterId]
  return meta?.name ?? charId
}

// ---------------------------------------------------------------------------
// Main analysis
// ---------------------------------------------------------------------------

async function runAnalysis(): Promise<void> {
  const TOP_N = 2000
  const SAFETY_CUTOFF = 100

  console.log('Initializing metadata...')
  Metadata.initialize()

  const exportInput = findLatestServerExport()
  const parsedFiles = exportInput.paths.map((p) => parseExport(p))
  const profiles = parsedFiles.flatMap((p) => p.profiles)
  console.log(`Parsed ${profiles.length} profiles from ${exportInput.paths.length} file(s)\n`)

  console.log(`Running pre-filter (top ${TOP_N} per character)...`)
  const t0 = performance.now()
  const preFilterResult = preFilterProfiles(profiles, TOP_N)
  const survivors = preFilterResult.profiles
  console.log(`Pre-filter complete in ${((performance.now() - t0) / 1000).toFixed(1)}s`)

  // Analyze every survivor
  const partsCache = new Map<CharacterId, PreFilterParts>()
  const allAnalyses: CandidateAnalysis[] = []
  const analysisByKey = new Map<string, CandidateAnalysis>()

  for (const profile of survivors) {
    for (const character of profile.characters) {
      const charId = String(character.unconverted.avatarId) as CharacterId
      const metadata = getGameMetadata().characters[charId]
      if (!metadata?.scoringMetadata) continue

      let validParts = partsCache.get(charId)
      if (!validParts) {
        validParts = buildPreFilterParts(charId)
        partsCache.set(charId, validParts)
      }

      const analysis = analyzeSurvivor(profile.uid, character, validParts)
      allAnalyses.push(analysis)
      analysisByKey.set(`${profile.uid}#${charId}`, analysis)
    }
  }

  const total = allAnalyses.length

  // --- Distribution: wrong main stat counts ---
  const wrongMainDist = [0, 0, 0, 0, 0]
  for (const a of allAnalyses) {
    wrongMainDist[Math.min(a.mainStats.wrongCount, 4)]++
  }

  const failA = allAnalyses.filter((a) => !a.passesMainStatFilter).length
  const failB = allAnalyses.filter((a) => !a.passesSetFilter).length
  const failEither = allAnalyses.filter((a) => !a.passesBothFilters).length

  console.log('\n========================================')
  console.log('  PRE-FILTER ANALYSIS REPORT')
  console.log('========================================\n')
  console.log(`Total candidates: ${total}\n`)

  console.log('--- Filter A: Main Stat Validity ---')
  for (let i = 0; i <= 4; i++) {
    console.log(`  ${i} wrong: ${pad(String(wrongMainDist[i]), 7)} (${pct(wrongMainDist[i], total)}%)`)
  }
  console.log(`  → Would remove: ${failA} candidates (${pct(failA, total)}%)`)

  const noOrn = allAnalyses.filter((a) => !a.sets.has2pOrnament).length
  const noRel = allAnalyses.filter((a) => !a.sets.hasRelicCompletion).length
  console.log('\n--- Filter B: Set Completion ---')
  console.log(`  Missing 2p ornament:         ${pad(String(noOrn), 7)} (${pct(noOrn, total)}%)`)
  console.log(`  Missing relic 4p or 2p+2p:   ${pad(String(noRel), 7)} (${pct(noRel, total)}%)`)
  console.log(`  → Would remove: ${failB} candidates (${pct(failB, total)}%)`)

  console.log('\n--- Combined A+B ---')
  console.log(`  Pass both:  ${total - failEither} (${pct(total - failEither, total)}%)`)
  console.log(`  Fail either: ${failEither} (${pct(failEither, total)}%)`)
  console.log(`  → Sim work reduction: ${pct(failEither, total)}%`)

  // --- Per-character table ---
  const byChar = new Map<string, CandidateAnalysis[]>()
  for (const a of allAnalyses) {
    if (!byChar.has(a.charId)) byChar.set(a.charId, [])
    byChar.get(a.charId)!.push(a)
  }

  console.log('\n--- Per-Character Summary ---')
  const hdr = pad('Character', 24) + pad('Total', 7) + pad('FailA', 7) + pad('FailB', 7) + pad('Fail', 7) + pad('Pass', 7) + 'Cut%'
  console.log(hdr)
  console.log('-'.repeat(hdr.length))

  const sortedChars = [...byChar.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  for (const [charId, analyses] of sortedChars) {
    const n = analyses.length
    const fA = analyses.filter((a) => !a.passesMainStatFilter).length
    const fB = analyses.filter((a) => !a.passesSetFilter).length
    const fAB = analyses.filter((a) => !a.passesBothFilters).length
    const name = charName(charId)
    console.log(
      pad(name, 24)
      + pad(String(n), 7)
      + pad(String(fA), 7)
      + pad(String(fB), 7)
      + pad(String(fAB), 7)
      + pad(String(n - fAB), 7)
      + pct(fAB, n) + '%',
    )
  }

  // --- Safety check against private output ---
  const privateOutputPath = resolvePath(homeDir(), 'leaderboard-cache/private-ranked-output')
  const privateOutput = readPrivateRankedOutput(privateOutputPath)

  if (!privateOutput) {
    console.log(`\n--- Safety Check ---\n  No private output at ${privateOutputPath}; skipping`)
    return
  }

  const expectedSourcePath = resolvePath(exportInput.displayPath)
  const actualSourcePath = resolvePath(privateOutput.sourceExport.path)
  const sourceWarnings: string[] = []
  if (actualSourcePath.toLowerCase() !== expectedSourcePath.toLowerCase()) {
    sourceWarnings.push(`source path differs: private=${actualSourcePath}, current=${expectedSourcePath}`)
  }
  if (privateOutput.sourceExport.profileCount !== profiles.length) {
    sourceWarnings.push(`profile count differs: private=${privateOutput.sourceExport.profileCount}, current=${profiles.length}`)
  }

  if (sourceWarnings.length > 0) {
    console.log('\n--- Ground Truth Warning ---')
    console.log('  Private output was generated from a different export snapshot; accuracy/savings numbers are not authoritative.')
    for (const warning of sourceWarnings) {
      console.log(`  - ${warning}`)
    }
  }

  const SCORE_THRESHOLD = MIN_PUBLIC_SCORE

  const boards = Object.entries(privateOutput.boards)
  console.log(`\n--- Safety Check (vs top ${SAFETY_CUTOFF} per board, score >= ${(SCORE_THRESHOLD * 100).toFixed(0)}%) ---`)
  console.log(`  Private output: ${boards.length} boards\n`)

  let totalChecked = 0
  let totalNotFound = 0
  let failATop = 0
  let failBTop = 0
  let failEitherTop = 0
  type FailureDetail = {
    name: string
    rank: number
    score: number
    board: string
    reasons: string[]
    mismatches: MainStatMismatch[]
  }
  const failures: FailureDetail[] = []

  for (const [boardKey, board] of boards) {
    const topEntries = board.entries.filter((e: PrivateRankedEntry) => e.rank <= SAFETY_CUTOFF && e.score >= SCORE_THRESHOLD)
    for (const entry of topEntries) {
      totalChecked++
      const key = `${entry.uid}#${entry.characterId}`
      const analysis = analysisByKey.get(key)
      if (!analysis) {
        totalNotFound++
        continue
      }

      const reasons: string[] = []
      if (!analysis.passesMainStatFilter) {
        failATop++
        reasons.push(`${analysis.mainStats.wrongCount} wrong mains`)
      }
      if (!analysis.passesSetFilter) {
        failBTop++
        if (!analysis.sets.has2pOrnament) reasons.push('no 2p ornament')
        if (!analysis.sets.hasRelicCompletion) reasons.push('no relic set completion')
      }
      if (reasons.length > 0) {
        failEitherTop++
        failures.push({
          name: charName(entry.characterId),
          rank: entry.rank,
          score: entry.score,
          board: boardKey,
          mismatches: analysis.mainStats.mismatches,
          reasons,
        })
      }
    }
  }

  console.log(`  Entries checked: ${totalChecked}`)
  if (totalNotFound > 0) {
    console.log(`  Not found in current prefilter (stale export?): ${totalNotFound}`)
  }
  console.log(`  Would fail main stat filter: ${failATop} (${pct(failATop, totalChecked)}%)`)
  console.log(`  Would fail set filter:       ${failBTop} (${pct(failBTop, totalChecked)}%)`)
  console.log(`  Would fail either:           ${failEitherTop} (${pct(failEitherTop, totalChecked)}%)`)

  if (failures.length > 0) {
    console.log('\n  Top-100 entries that would be incorrectly filtered:')
    failures.sort((a, b) => a.name.localeCompare(b.name) || a.rank - b.rank)

    let lastChar = ''
    for (const f of failures) {
      if (f.name !== lastChar) {
        lastChar = f.name
        if (f.mismatches.length > 0) {
          const m = f.mismatches[0]
          console.log(`\n    ${f.name} — expected ${m.part}: [${m.expected.join(', ')}]`)
        } else {
          console.log(`\n    ${f.name}`)
        }
      }
      const mismatchDetail = f.mismatches.map((m) => `${m.part}=${m.actual}`).join(', ')
      const setDetail = f.reasons.filter((r) => !r.includes('wrong')).join(', ')
      const detail = [mismatchDetail, setDetail].filter(Boolean).join(' | ')
      console.log(`      rank #${pad(String(f.rank), 4)} score ${f.score.toFixed(1)}%  — ${detail}`)
    }
  } else {
    console.log('\n  ✓ No top-100 entries would be incorrectly filtered')
  }

  // -----------------------------------------------------------------------
  // Iterative batching simulation
  //
  // Heuristic: process candidates in production qualityOrder order.
  // After each batch, check whether it contributed any public-threshold
  // top-100 entries. Once a character/board has already produced public
  // output, an empty public batch means the remaining candidates are skipped.
  // -----------------------------------------------------------------------

  const BATCH_SIZE = 500
  const TOP_K = 100
  const BATCH_SCORE_THRESHOLD = MIN_PUBLIC_SCORE
  const MAX_BATCHES = Math.ceil(TOP_N / BATCH_SIZE)

  console.log(`\n--- Iterative Batching: Empty-Batch-Stops (batch=${BATCH_SIZE}, top-${TOP_K}, >= ${(BATCH_SCORE_THRESHOLD * 100).toFixed(0)}%) ---`)

  // Collect all qualifying entries per character with their current qualityOrder.
  type QualifyingEntry = {
    pfRank: number
    qualityOrder: number
    simRank: number
    score: number
    boardKey: string
    uid: string
    eidolon: number
    buildId: string
    teamStr: string
  }

  const SKIP_BOARD = '1408#dps#1313|1412|1415'

  const qualifyingByChar = new Map<string, QualifyingEntry[]>()
  let totalMissingRank = 0

  for (const [boardKey, board] of boards) {
    if (boardKey === SKIP_BOARD) continue
    const charId = board.characterId
    const topEntries = board.entries.filter((e: PrivateRankedEntry) => e.rank <= TOP_K && e.score >= BATCH_SCORE_THRESHOLD)
    for (const e of topEntries) {
      const currentAnalysis = analysisByKey.get(`${e.uid}#${charId}`)
      if (!currentAnalysis) {
        totalMissingRank++
        continue
      }
      const pfRank = currentAnalysis.preFilterRank
      const qualityOrder = currentAnalysis.qualityOrder
      if (!qualifyingByChar.has(charId)) qualifyingByChar.set(charId, [])

      const uidHash = hashUid(e.uid)
      const buildId = computeBuildId(uidHash, charId, board.configType, board.teamId)
      const teamStr = (e as PrivateRankedEntry).data.team.map((t) =>
        `${charName(t.characterId)} E${t.characterEidolon}`,
      ).join(', ')

      qualifyingByChar.get(charId)!.push({
        pfRank,
        qualityOrder,
        simRank: e.rank,
        score: e.score,
        boardKey,
        uid: e.uid,
        eidolon: (e as PrivateRankedEntry).data.characterEidolon,
        buildId,
        teamStr,
      })
    }
  }

  if (totalMissingRank > 0) {
    console.log(`  ⚠ ${totalMissingRank} qualifying entries not found in current prefilter (stale export?)`)
  }

  // Simulate the heuristic per character. Production should not stop before a
  // character/board has produced public output, so early empty batches before
  // the first qualifying entry process fail-closed instead of converging.
  type BatchStopStrategy = 'board' | 'character'

  type BatchSimResult = {
    charId: string
    name: string
    totalCandidates: number
    totalQualifying: number
    stoppedAfterBatch: number
    candidatesProcessed: number
    candidatesSaved: number
    missedEntries: QualifyingEntry[]
    batchCounts: number[]
  }

  type BatchStrategySummary = {
    strategy: BatchStopStrategy
    totalCandidates: number
    totalProcess: number
    totalSaved: number
    totalMissed: number
    missedChars: string[]
    results: BatchSimResult[]
  }

  function batchNumberFor(entry: QualifyingEntry, batchSize: number): number {
    return Math.floor(entry.qualityOrder / batchSize) + 1
  }

  function firstStoppableEmptyBatch(batchCounts: number[], maxBatches: number): number {
    let hasSeenPublicOutput = false
    for (let batchIndex = 0; batchIndex < maxBatches; batchIndex++) {
      if ((batchCounts[batchIndex] ?? 0) > 0) {
        hasSeenPublicOutput = true
      } else if (hasSeenPublicOutput && batchIndex > 0) {
        return batchIndex + 1
      }
    }
    return maxBatches
  }

  function batchCountsFor(entries: QualifyingEntry[], batchSize: number): number[] {
    const batchCounts: number[] = []
    for (const entry of entries) {
      const batch = batchNumberFor(entry, batchSize)
      while (batchCounts.length < batch) batchCounts.push(0)
      batchCounts[batch - 1]++
    }
    return batchCounts
  }

  function stopAfterForStrategy(
    strategy: BatchStopStrategy,
    entries: QualifyingEntry[],
    batchSize: number,
    maxBatches: number,
  ): number {
    if (strategy === 'character') {
      return firstStoppableEmptyBatch(batchCountsFor(entries, batchSize), maxBatches)
    }

    const byBoard = new Map<string, number[]>()
    for (const entry of entries) {
      const batch = batchNumberFor(entry, batchSize)
      if (!byBoard.has(entry.boardKey)) byBoard.set(entry.boardKey, [])
      const boardBatches = byBoard.get(entry.boardKey)!
      while (boardBatches.length < batch) boardBatches.push(0)
      boardBatches[batch - 1]++
    }

    let stoppedAfterBatch = 1
    for (const [, boardBatches] of byBoard) {
      const boardStop = firstStoppableEmptyBatch(boardBatches, maxBatches)
      stoppedAfterBatch = Math.max(stoppedAfterBatch, boardStop)
    }
    return stoppedAfterBatch
  }

  function simulateBatchStrategy(
    strategy: BatchStopStrategy,
    batchSizeForChar: (charId: string, totalCands: number) => number,
    skipCharId?: string,
  ): BatchStrategySummary {
    const results: BatchSimResult[] = []
    let totalProcess = 0
    let totalCandidates = 0
    let totalMissed = 0
    const missedChars: string[] = []

    for (const [charId, entries] of qualifyingByChar) {
      if (skipCharId && charId.startsWith(skipCharId)) continue
      const candidates = byChar.get(charId)
      const candidateCount = candidates?.length ?? 0
      const batchSize = batchSizeForChar(charId, candidateCount)
      const maxBatches = Math.max(1, Math.ceil(candidateCount / batchSize))
      const stoppedAfterBatch = stopAfterForStrategy(strategy, entries, batchSize, maxBatches)
      const cutoff = stoppedAfterBatch * batchSize

      const candidatesProcessed = Math.min(candidateCount, cutoff)
      const candidatesSaved = candidateCount - candidatesProcessed
      const missedEntries = entries.filter((e) => e.qualityOrder >= cutoff)

      results.push({
        charId,
        name: charName(charId),
        totalCandidates: candidateCount,
        totalQualifying: entries.length,
        stoppedAfterBatch,
        candidatesProcessed,
        candidatesSaved,
        missedEntries,
        batchCounts: batchCountsFor(entries, batchSize),
      })

      totalProcess += candidatesProcessed
      totalCandidates += candidateCount
      totalMissed += missedEntries.length
      if (missedEntries.length > 0) missedChars.push(charName(charId))
    }

    for (const [charId, candidates] of byChar) {
      if (skipCharId && charId.startsWith(skipCharId)) continue
      if (qualifyingByChar.has(charId)) continue
      totalProcess += candidates.length
      totalCandidates += candidates.length
    }

    return {
      strategy,
      totalCandidates,
      totalProcess,
      totalSaved: totalCandidates - totalProcess,
      totalMissed,
      missedChars,
      results,
    }
  }

  function printStrategySummary(summary: BatchStrategySummary): void {
    console.log(
      pad(`  ${summary.strategy}`, 15)
      + pad(String(summary.totalProcess), 10)
      + pad(String(summary.totalSaved), 9)
      + pad(pct(summary.totalSaved, summary.totalCandidates) + '%', 8)
      + pad(String(summary.totalMissed), 7)
      + (summary.missedChars.length > 0 ? summary.missedChars.join(', ') : '-'),
    )
  }

  const fixedBoardSummary = simulateBatchStrategy('board', () => BATCH_SIZE)
  const fixedCharacterSummary = simulateBatchStrategy('character', () => BATCH_SIZE)

  console.log('\n--- Stop Strategy Comparison (fixed batch 500, public-output guard) ---\n')
  console.log(
    pad('  Strategy', 15)
    + pad('Process', 10)
    + pad('Saved', 9)
    + pad('Save%', 8)
    + pad('Miss', 7)
    + 'Missed chars',
  )
  console.log('  ' + '-'.repeat(80))
  printStrategySummary(fixedBoardSummary)
  printStrategySummary(fixedCharacterSummary)
  console.log(
    `\n  Character-stop extra work vs board-stop: ${fixedCharacterSummary.totalProcess - fixedBoardSummary.totalProcess}`
    + ` candidates (${pct(fixedCharacterSummary.totalProcess - fixedBoardSummary.totalProcess, fixedBoardSummary.totalCandidates)}% of candidates)`,
  )

  const boardByChar = new Map(fixedBoardSummary.results.map((r) => [r.charId, r]))
  const changedStops = fixedCharacterSummary.results
    .map((charResult) => ({ charResult, boardResult: boardByChar.get(charResult.charId) }))
    .filter((x): x is { charResult: BatchSimResult, boardResult: BatchSimResult } => x.boardResult != null && x.charResult.stoppedAfterBatch !== x.boardResult.stoppedAfterBatch)
    .sort((a, b) => (b.charResult.candidatesProcessed - b.boardResult.candidatesProcessed) - (a.charResult.candidatesProcessed - a.boardResult.candidatesProcessed))

  if (changedStops.length > 0) {
    console.log('\n  Characters where character-stop runs longer than board-stop:')
    console.log(
      pad('    Character', 26)
      + pad('Board@', 8)
      + pad('Char@', 8)
      + pad('Extra', 8)
      + 'Qualifying batch distribution',
    )
    for (const { charResult, boardResult } of changedStops.slice(0, 20)) {
      const extra = charResult.candidatesProcessed - boardResult.candidatesProcessed
      const batchDist = charResult.batchCounts
        .map((c, i) => `B${i + 1}:${c}`)
        .join(' ')
      console.log(
        pad('    ' + charResult.name, 26)
        + pad(String(boardResult.stoppedAfterBatch), 8)
        + pad(String(charResult.stoppedAfterBatch), 8)
        + pad(String(extra), 8)
        + batchDist,
      )
    }
  }

  fixedCharacterSummary.results.sort((a, b) => b.candidatesSaved - a.candidatesSaved)

  console.log('\n--- Character-Level Empty-Batch Detail (fixed batch 500) ---\n')
  console.log(
    pad('  Character', 26)
    + pad('Cands', 7)
    + pad('Qual', 6)
    + pad('Stop@', 7)
    + pad('Process', 9)
    + pad('Saved', 7)
    + pad('Missed', 8)
    + 'Batch distribution',
  )
  console.log('  ' + '-'.repeat(100))

  for (const r of fixedCharacterSummary.results) {
    const batchDist = r.batchCounts
      .map((c, i) => `B${i + 1}:${c}`)
      .join(' ')
    const missedFlag = r.missedEntries.length > 0 ? ' ⚠' : ''
    console.log(
      pad('  ' + r.name, 26)
      + pad(String(r.totalCandidates), 7)
      + pad(String(r.totalQualifying), 6)
      + pad(String(r.stoppedAfterBatch), 7)
      + pad(String(r.candidatesProcessed), 9)
      + pad(String(r.candidatesSaved), 7)
      + pad(String(r.missedEntries.length), 8)
      + batchDist + missedFlag,
    )
  }

  console.log('')
  console.log(`  Total candidates:    ${fixedCharacterSummary.totalCandidates}`)
  console.log(`  Would process:       ${fixedCharacterSummary.totalProcess}`)
  console.log(`  Candidates saved:    ${fixedCharacterSummary.totalSaved} (${pct(fixedCharacterSummary.totalSaved, fixedCharacterSummary.totalCandidates)}%)`)
  console.log(`  Total missed:        ${fixedCharacterSummary.totalMissed}`)

  // Detail on missed entries
  const withMisses = fixedCharacterSummary.results.filter((r) => r.missedEntries.length > 0)
  if (withMisses.length === 0) {
    console.log('\n  ✓ No entries missed — character-level empty-batch heuristic covers all top-100 150%+ entries')
  } else {
    console.log(`\n  ⚠ ${withMisses.length} characters have missed entries:`)
    for (const r of withMisses) {
      console.log(`\n    ${r.name} (stopped after batch ${r.stoppedAfterBatch}, cutoff ordinal ${r.stoppedAfterBatch * BATCH_SIZE}):`)
      for (const e of r.missedEntries) {
        console.log(`      ordinal=${e.qualityOrder + 1} pfRank=${e.pfRank}  simRank=#${e.simRank}  score=${(e.score * 100).toFixed(1)}%  E${e.eidolon}  buildId=${e.buildId}`)
        console.log(`        board: ${e.boardKey}  team: ${e.teamStr}`)

        // Show substat score breakdown for the missed build
        const missedCharId = e.boardKey.split('#')[0]
        const missedProfile = survivors.find((p) => p.uid === e.uid)
        const missedChar = missedProfile?.characters.find((c) => String(c.unconverted.avatarId) === missedCharId)
        if (missedChar) {
          const charIdStr = String(missedChar.unconverted.avatarId) as CharacterId
          const subs = extractPreFilterSubstats(missedChar.unconverted.relicList!)
          const prep = prepareScoringMetadata(charIdStr)
          const { score: wScore } = computePreFilterSubstatScore(subs, prep.stats)
          console.log(`        substatScore=${wScore.toFixed(1)}`)
          console.log(`        weights: ATK=${prep.stats[Constants.Stats.ATK] ?? 0} ATK%=${prep.stats[Constants.Stats.ATK_P] ?? 0} EHR=${prep.stats[Constants.Stats.EHR] ?? 0} SPD=${prep.stats[Constants.Stats.SPD] ?? 0}`)
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Batch size sweep: find minimum viable batch size
  // Ignores Kafka (benchmark breakpoint issue, not prefilter)
  // -----------------------------------------------------------------------

  const KAFKA_CHAR_ID = '1005'

  // Helper: run production character-stop batching for a given batch size resolver
  function runBatchSim(
    batchSizeForChar: (charId: string, totalCands: number) => number,
    skipCharId?: string,
  ): { totalProcess: number, totalSaved: number, totalMissed: number, missedChars: string[] } {
    const summary = simulateBatchStrategy('character', batchSizeForChar, skipCharId)
    return {
      totalProcess: summary.totalProcess,
      totalSaved: summary.totalSaved,
      totalMissed: summary.totalMissed,
      missedChars: summary.missedChars,
    }
  }

  // Fixed batch size sweep
  const SWEEP_SIZES = [100, 200, 300, 400, 500, 750, 1000, 1500, 2000]
  console.log('\n--- Fixed Batch Size Sweep (character-stop, excluding Kafka) ---\n')
  console.log(pad('  Batch', 8) + pad('Process', 9) + pad('Saved', 9) + pad('Save%', 8) + pad('Missed', 8) + 'Missed chars')
  console.log('  ' + '-'.repeat(70))

  for (const bs of SWEEP_SIZES) {
    const r = runBatchSim(() => bs, KAFKA_CHAR_ID)
    console.log(
      pad('  ' + String(bs), 8)
      + pad(String(r.totalProcess), 9)
      + pad(String(r.totalSaved), 9)
      + pad(pct(r.totalSaved, r.totalSaved + r.totalProcess) + '%', 8)
      + pad(String(r.totalMissed), 8)
      + (r.missedChars.length > 0 ? r.missedChars.join(', ') : '—'),
    )
  }

  // Percentage-based batch size sweep with min and max caps
  // Helper: run batching simulation with safety metrics
  function runBatchSimWithMetrics(
    batchSizeForChar: (charId: string, totalCands: number) => number,
    skipCharId?: string,
  ) {
    const summary = simulateBatchStrategy('character', batchSizeForChar, skipCharId)
    let minHeadroom = Infinity
    let minHeadroomChar = ''
    let maxQualPfRank = 0
    let maxQualPfRankChar = ''
    let charsMultiBatch = 0
    let minLastBatchDensity = Infinity
    let minLastBatchChar = ''

    for (const result of summary.results) {
      const entries2 = qualifyingByChar.get(result.charId) ?? []
      const cutoff = result.stoppedAfterBatch * batchSizeForChar(result.charId, result.totalCandidates)
      const maxPfRank = Math.max(...entries2.map((e) => e.pfRank))
      const maxOrdinal = Math.max(...entries2.map((e) => e.qualityOrder + 1))
      const headroom = cutoff - maxOrdinal
      if (headroom < minHeadroom) {
        minHeadroom = headroom
        minHeadroomChar = result.name
      }
      if (maxPfRank > maxQualPfRank) {
        maxQualPfRank = maxPfRank
        maxQualPfRankChar = result.name
      }
      if (result.stoppedAfterBatch > 1) charsMultiBatch++

      // Last non-empty batch density
      let lastNonEmptyBatch = 0
      for (let b = result.batchCounts.length - 1; b >= 0; b--) {
        if ((result.batchCounts[b] ?? 0) > 0) { lastNonEmptyBatch = b; break }
      }
      const lastDensity = result.batchCounts[lastNonEmptyBatch] ?? 0
      if (lastDensity > 0 && lastDensity < minLastBatchDensity) {
        minLastBatchDensity = lastDensity
        minLastBatchChar = result.name
      }
    }

    return {
      totalProcess: summary.totalProcess,
      totalSaved: summary.totalSaved,
      totalMissed: summary.totalMissed,
      missedChars: summary.missedChars,
      minHeadroom, minHeadroomChar,
      maxQualPfRank, maxQualPfRankChar,
      charsMultiBatch,
      minLastBatchDensity, minLastBatchChar,
    }
  }

  const CONFIGS: { label: string, pctVal: number, minCap: number, maxCap: number }[] = [
    { label: 'Fixed 200', pctVal: 100, minCap: 200, maxCap: 200 },
    { label: 'Fixed 300', pctVal: 100, minCap: 300, maxCap: 300 },
    { label: 'Fixed 400', pctVal: 100, minCap: 400, maxCap: 400 },
    { label: 'Fixed 500', pctVal: 100, minCap: 500, maxCap: 500 },
    { label: 'Fixed 750', pctVal: 100, minCap: 750, maxCap: 750 },
    { label: 'Fixed 1000', pctVal: 100, minCap: 1000, maxCap: 1000 },
    { label: 'Fixed 1500', pctVal: 100, minCap: 1500, maxCap: 1500 },
    { label: 'Fixed 2000', pctVal: 100, minCap: 2000, maxCap: 2000 },
    { label: '10% 100/300', pctVal: 10, minCap: 100, maxCap: 300 },
    { label: '10% 100/500', pctVal: 10, minCap: 100, maxCap: 500 },
    { label: '10% 100/1000', pctVal: 10, minCap: 100, maxCap: 1000 },
    { label: '10% 200/500', pctVal: 10, minCap: 200, maxCap: 500 },
    { label: '10% 200/1000', pctVal: 10, minCap: 200, maxCap: 1000 },
    { label: '10% 200/600', pctVal: 10, minCap: 200, maxCap: 600 },
    { label: '15% 100/400', pctVal: 15, minCap: 100, maxCap: 400 },
    { label: '15% 100/500', pctVal: 15, minCap: 100, maxCap: 500 },
    { label: '15% 100/1000', pctVal: 15, minCap: 100, maxCap: 1000 },
    { label: '15% 200/500', pctVal: 15, minCap: 200, maxCap: 500 },
    { label: '15% 200/600', pctVal: 15, minCap: 200, maxCap: 600 },
    { label: '15% 200/1000', pctVal: 15, minCap: 200, maxCap: 1000 },
    { label: '15% 300/500', pctVal: 15, minCap: 300, maxCap: 500 },
    { label: '15% 300/1000', pctVal: 15, minCap: 300, maxCap: 1000 },
    { label: '20% 100/500', pctVal: 20, minCap: 100, maxCap: 500 },
    { label: '20% 100/1000', pctVal: 20, minCap: 100, maxCap: 1000 },
    { label: '20% 200/500', pctVal: 20, minCap: 200, maxCap: 500 },
    { label: '20% 200/600', pctVal: 20, minCap: 200, maxCap: 600 },
    { label: '20% 200/1000', pctVal: 20, minCap: 200, maxCap: 1000 },
    { label: '25% 300/1000', pctVal: 25, minCap: 300, maxCap: 1000 },
    { label: '25% 500/1500', pctVal: 25, minCap: 500, maxCap: 1500 },
    { label: '30% 500/1500', pctVal: 30, minCap: 500, maxCap: 1500 },
  ]

  console.log('\n--- Batch Config Safety Analysis (character-stop, excluding Kafka + Phainon Sunday board) ---\n')
  console.log(
    pad('  Config', 16)
    + pad('Save%', 7)
    + pad('Miss', 6)
    + pad('Hdroom', 8)
    + pad('Tightest', 16)
    + pad('MaxPF', 7)
    + pad('MaxPF char', 14)
    + pad('Multi', 7)
    + pad('LastD', 7)
    + 'LastD char',
  )
  console.log('  ' + '-'.repeat(100))

  for (const cfg of CONFIGS) {
    const r = runBatchSimWithMetrics((_charId, totalCands) => {
      return Math.min(cfg.maxCap, Math.max(cfg.minCap, Math.ceil(totalCands * cfg.pctVal / 100)))
    }, KAFKA_CHAR_ID)
    const savePct = pct(r.totalSaved, r.totalSaved + r.totalProcess)
    console.log(
      pad('  ' + cfg.label, 16)
      + pad(savePct + '%', 7)
      + pad(String(r.totalMissed), 6)
      + pad(String(r.minHeadroom), 8)
      + pad(r.minHeadroomChar, 16)
      + pad(String(r.maxQualPfRank), 7)
      + pad(r.maxQualPfRankChar, 14)
      + pad(String(r.charsMultiBatch), 7)
      + pad(String(r.minLastBatchDensity), 7)
      + r.minLastBatchChar,
    )
  }

}

if (isMainModule(import.meta.url)) {
  runAnalysis().catch((error) => {
    console.error(error)
    setExitCode(1)
  })
}
