// @vitest-environment jsdom
import { writeFileSync } from 'fs'
import { performance } from 'perf_hooks'
import { Parts, Stats } from 'lib/constants/constants'
import type { SetsOrnaments, SetsRelics } from 'lib/sets/setConfigRegistry'
import { runDpsScoreBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { generateTestSingleRelicsByPart, testStatSpread } from 'lib/simulations/tests/simTestUtils'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { clone } from 'lib/utils/objectUtils'
import type { Character, CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { MainStats } from 'lib/constants/constants'
import type { SimulationMetadata } from 'types/metadata'
import { describe, test } from 'vitest'

Metadata.initialize()

// ─── Types ───────────────────────────────────────────────────────────────────

interface DpsScoreGoldenEntry {
  characterId: CharacterId
  lightConeId: LightConeId
  characterName: string
  eidolon: number
  superimposition: number
  relicSet1: SetsRelics
  relicSet2: SetsRelics
  ornamentSet: SetsOrnaments
  mains: {
    simBody: MainStats
    simFeet: MainStats
    simPlanarSphere: MainStats
    simLinkRope: MainStats
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

const INCLUDED_TRAILBLAZERS = new Set(['8001', '8003', '8005', '8007'])
const DEFAULT_STATS = testStatSpread(10)

// ─── Character → Light Cone mapping (same as generateSimBuildGoldenData) ─────

const LC_MAP: Record<string, LightConeId> = Object.fromEntries([
  ['1003', '23000'], ['1004', '23004'], ['1005', '23006'], ['1006', '23007'],
  ['1101', '23003'], ['1102', '23001'], ['1104', '23005'], ['1107', '23002'],
  ['1112', '23016'], ['1203', '23008'], ['1204', '23010'], ['1205', '23009'],
  ['1208', '23011'], ['1209', '23012'], ['1211', '23013'], ['1212', '23014'],
  ['1213', '23015'], ['1217', '23017'], ['1218', '23029'], ['1220', '23031'],
  ['1221', '23030'], ['1222', '23032'], ['1225', '23035'], ['1302', '23018'],
  ['1303', '23019'], ['1304', '23023'], ['1305', '23020'], ['1306', '23021'],
  ['1307', '23022'], ['1308', '23024'], ['1309', '23026'], ['1310', '23025'],
  ['1313', '23034'], ['1314', '23028'], ['1315', '23027'], ['1317', '23033'],
  ['1401', '23037'], ['1402', '23036'], ['1403', '23038'], ['1404', '23039'],
  ['1405', '23041'], ['1407', '23040'],
  ['1406', '23043'], ['1408', '23044'], ['1409', '23042'],
  ['1410', '23047'], ['1412', '23048'], ['1413', '23049'],
  ['1414', '23051'], ['1415', '23052'],
].map(([k, v]) => [k, v as LightConeId]))

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLightConeForCharacter(characterId: CharacterId): LightConeId {
  if (LC_MAP[characterId]) return LC_MAP[characterId]

  const dbMetadata = getGameMetadata()
  const characterPath = dbMetadata.characters[characterId]?.path
  if (characterPath) {
    for (const lc of Object.values(dbMetadata.lightCones)) {
      if (lc.path === characterPath && lc.rarity === 5) return lc.id
    }
  }
  return '23001' as LightConeId
}

function getCharactersWithSimConfigs(): { characterId: CharacterId; simulation: SimulationMetadata }[] {
  const dbMetadata = getGameMetadata()
  const results: { characterId: CharacterId; simulation: SimulationMetadata }[] = []

  for (const [id, meta] of Object.entries(dbMetadata.characters)) {
    if (meta.unreleased) continue
    if (id.startsWith('8') && !INCLUDED_TRAILBLAZERS.has(id)) continue
    if (!meta.scoringMetadata?.simulation) continue

    results.push({
      characterId: id as CharacterId,
      simulation: meta.scoringMetadata.simulation,
    })
  }

  return results
}

function pickFirstMains(simulation: SimulationMetadata): {
  simBody: MainStats
  simFeet: MainStats
  simPlanarSphere: MainStats
  simLinkRope: MainStats
} {
  return {
    simBody: (simulation.parts[Parts.Body]?.[0] ?? Stats.CR) as MainStats,
    simFeet: (simulation.parts[Parts.Feet]?.[0] ?? Stats.SPD) as MainStats,
    simPlanarSphere: (simulation.parts[Parts.PlanarSphere]?.[0] ?? Stats.ATK_P) as MainStats,
    simLinkRope: (simulation.parts[Parts.LinkRope]?.[0] ?? Stats.ATK_P) as MainStats,
  }
}

// ─── Generator ───────────────────────────────────────────────────────────────

describe('generate DPS score golden data', () => {
  test('generate golden data: all characters with sim configs', async () => {
    globalThis.SEQUENTIAL_BENCHMARKS = true

    const totalStart = performance.now()
    const characters = getCharactersWithSimConfigs()
    const dbMetadata = getGameMetadata()

    const goldenData: DpsScoreGoldenData = {
      meta: {
        generatedAt: new Date().toISOString(),
        characterCount: 0,
        version: '1.0.0',
        totalDurationMs: 0,
      },
      entries: [],
    }

    let successCount = 0
    let errorCount = 0

    for (const { characterId, simulation } of characters) {
      const characterName = dbMetadata.characters[characterId]?.name ?? characterId
      const lightConeId = getLightConeForCharacter(characterId)

      // Use first recommended relic set and ornament set from sim metadata
      const relicSetCombo = simulation.relicSets[0]
      const relicSet1 = relicSetCombo?.[0]
      const relicSet2 = relicSetCombo?.[1] ?? relicSet1
      const ornamentSet = simulation.ornamentSets[0]

      if (!relicSet1 || !relicSet2 || !ornamentSet) {
        console.warn(`Skipping ${characterId} (${characterName}): missing relic/ornament sets`)
        continue
      }

      const mains = pickFirstMains(simulation)

      try {
        const entryStart = performance.now()

        // Build character form with default team from sim metadata
        const simMetadata = clone(simulation)
        const character = {
          form: {
            characterId: characterId,
            lightCone: lightConeId,
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
        } as Character

        const singleRelicByPart = generateTestSingleRelicsByPart(
          { simRelicSet1: relicSet1, simRelicSet2: relicSet2, simOrnamentSet: ornamentSet },
          mains,
          DEFAULT_STATS,
        )

        const orchestrator = await runDpsScoreBenchmarkOrchestrator(
          character,
          simMetadata,
          singleRelicByPart,
          {},
        )

        const simScore = orchestrator.simulationScore!
        const durationMs = performance.now() - entryStart

        goldenData.entries.push({
          characterId,
          lightConeId,
          characterName,
          eidolon: 6,
          superimposition: 5,
          relicSet1,
          relicSet2,
          ornamentSet,
          mains,
          expected: {
            percent: simScore.percent,
            originalSimScore: simScore.originalSimScore,
            benchmarkSimScore: simScore.benchmarkSimScore,
            perfectionSimScore: simScore.maximumSimScore,
            baselineSimScore: simScore.baselineSimScore,
          },
          durationMs,
        })

        successCount++
        console.log(`[${successCount}/${characters.length}] ${characterName} (${characterId}): ${simScore.percent.toFixed(4)} — ${durationMs.toFixed(0)}ms`)
      } catch (error) {
        errorCount++
        console.error(`FAILED: ${characterName} (${characterId}):`, error)
      }
    }

    const totalDurationMs = performance.now() - totalStart
    goldenData.meta.characterCount = successCount
    goldenData.meta.totalDurationMs = totalDurationMs

    const outputPath = 'src/lib/simulations/tests/goldenData/goldenDpsScoreResults.json'
    writeFileSync(outputPath, JSON.stringify(goldenData))

    console.log('================================================================================')
    console.log('DPS SCORE GOLDEN DATA GENERATION')
    console.log('================================================================================')
    console.log(`Characters:  ${successCount} succeeded, ${errorCount} failed`)
    console.log(`Total time:  ${(totalDurationMs / 1000).toFixed(1)}s`)
    console.log(`Avg per char: ${(totalDurationMs / successCount / 1000).toFixed(2)}s`)
    console.log(`Output:      ${outputPath}`)
    console.log('================================================================================')
  }, 600_000) // 10 minute timeout
})
