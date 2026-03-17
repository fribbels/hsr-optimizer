/**
 * Golden Test Data Generator for Relic Scoring Pipeline
 *
 * Run once to capture baseline scoring outputs before a refactor:
 *   npm run vitest:fast -- --testPathPattern=generateGoldenData
 *
 * Produces two files in this directory:
 *   - testRelics.json    — 2560 relics from save file (inputs)
 *   - goldenResults.json — scoring outputs for every relic × every character
 *
 * The verification test (verifyGoldenData.test.ts) compares the current scorer
 * output against goldenResults.json to detect any numerical regressions.
 */

// @vitest-environment jsdom
import fs from 'fs'
import path from 'path'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { Metadata } from 'lib/state/metadataInitializer'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { AugmentedStats } from 'lib/relics/relicAugmenter'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'
import { test } from 'vitest'

Metadata.initialize()

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1')
const SAVE_FILE = String.raw`C:\Users\fribbels\Documents\actual-save.json`

// Field indices for the compact results arrays
// [0]  scoreNumber        — from scoreCurrentRelic
// [1]  mainStatScore      — from scoreCurrentRelic
// [2]  fCurrent           — from scoreFutureRelic
// [3]  fBest              — from scoreFutureRelic
// [4]  fAverage           — from scoreFutureRelic
// [5]  fWorst             — from scoreFutureRelic
// [6]  fRerollAvg         — from scoreFutureRelic
// [7]  fBlockerAvg        — from scoreFutureRelic
// [8]  pCurrentPct        — from scoreRelicPotential
// [9]  pBestPct           — from scoreRelicPotential
// [10] pAveragePct        — from scoreRelicPotential
// [11] pWorstPct          — from scoreRelicPotential
// [12] pRerollAvgPct      — from scoreRelicPotential
// [13] pBlockedRerollAvgPct — from scoreRelicPotential

export type GoldenResults = {
  meta: {
    relicCount: number
    characterCount: number
    characterIds: string[]
    generatedAt: string
    fields: string[]
  }
  results: Record<string, number[][]>
}

/** Round to 6 decimal places to normalize floating point representation */
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

test('generate golden scoring data', { timeout: 300_000 }, () => {
  // Load relics from save file
  const saveData = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'))
  const relics: Relic[] = saveData.relics.map(hydrateRelic)

  // Get all character IDs from game metadata (not just owned — ALL characters with default weights)
  const characterIds = Object.keys(getGameMetadata().characters).sort() as CharacterId[]

  console.log(`Scoring ${relics.length} relics × ${characterIds.length} characters = ${relics.length * characterIds.length} pairs`)
  const startTime = Date.now()

  const results: Record<string, number[][]> = {}

  for (const charId of characterIds) {
    // One RelicScorer instance per character = metadata + optimal scores cached across all relics
    const scorer = new RelicScorer()
    const charResults: number[][] = []

    for (const relic of relics) {
      const current = scorer.getCurrentRelicScore(relic, charId)
      const future = scorer.getFutureRelicScore(relic, charId)
      const potential = scorer.scoreRelicPotential(relic, charId)

      charResults.push([
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
      ])
    }

    results[charId] = charResults
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`Scoring complete in ${elapsed}s`)

  // Write relics fixture
  const relicsPath = path.join(__dirname, 'testRelics.json')
  fs.writeFileSync(relicsPath, JSON.stringify(saveData.relics))
  const relicsSizeMB = (fs.statSync(relicsPath).size / 1024 / 1024).toFixed(1)

  // Write golden results
  const goldenOutput: GoldenResults = {
    meta: {
      relicCount: relics.length,
      characterCount: characterIds.length,
      characterIds,
      generatedAt: new Date().toISOString(),
      fields: [
        'scoreNumber', 'mainStatScore',
        'fCurrent', 'fBest', 'fAverage', 'fWorst', 'fRerollAvg', 'fBlockerAvg',
        'pCurrentPct', 'pBestPct', 'pAveragePct', 'pWorstPct', 'pRerollAvgPct', 'pBlockedRerollAvgPct',
      ],
    },
    results,
  }

  const resultsPath = path.join(__dirname, 'goldenResults.json')
  fs.writeFileSync(resultsPath, JSON.stringify(goldenOutput))
  const resultsSizeMB = (fs.statSync(resultsPath).size / 1024 / 1024).toFixed(1)

  console.log(`Written: testRelics.json (${relicsSizeMB} MB), goldenResults.json (${resultsSizeMB} MB)`)
  console.log(`Coverage: ${characterIds.length} characters × ${relics.length} relics = ${characterIds.length * relics.length} scoring pairs`)
})
