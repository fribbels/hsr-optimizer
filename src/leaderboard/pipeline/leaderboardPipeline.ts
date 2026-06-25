import { LeaderboardBuildScoreCache } from 'leaderboard/cache/leaderboardBuildScoreCache'
import { computeChangelogUpdate } from 'leaderboard/changelog/computeChangelog'
import { deriveChangelogPath, deriveSnapshotPath, writeChangelogArtifacts } from 'leaderboard/changelog/changelogStorage'
import { parseExport } from 'leaderboard/ingest/exportParser'
import { preFilterProfiles } from 'leaderboard/ingest/preFilter'
import {
  buildProfilePayloadIndex,
  diffProfilePayloads,
} from 'leaderboard/ingest/profileDiff'
import {
  assertPrivateOutputPublishable,
  buildPrivateRankedOutput,
  readProfilePayloadIndex,
  writePrivateRankedOutput,
} from 'leaderboard/output/privateOutput'
import {
  buildPublicOutputFromPrivate,
  validateNoUidInPublicOutput,
  writePublicLeaderboardOutput,
} from 'leaderboard/output/publicOutput'
import {
  printLeaderboardResults,
  printRunSummary,
  printTopNCoverageAnalysis,
} from 'leaderboard/pipeline/leaderboardReporting'
import {
  runScoringStage,
  type RunScoringStageResult,
} from 'leaderboard/pipeline/scoringStage'
import type { LeaderboardCliOptions } from 'leaderboard/shared/cliOptions'
import { hashObject } from 'leaderboard/shared/hash'
import {
  fileExists,
  joinPath,
  readTextFile,
  resolvePath,
} from 'leaderboard/shared/nodeFacade'
import type {
  ParsedExport,
  PrivateRankedEntry,
  PrivateRankedOutput,
  ProfilePayloadIndex,
  PublicLeaderboardOutputV3,
} from 'leaderboard/shared/types'
import { readLeaderboardVersions } from 'leaderboard/shared/versioning'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import type { CharacterId } from 'types/character'
import type { ScoringMetadataOverride } from 'types/metadata'

type LeaderboardExportInput = {
  displayPath: string,
  paths: string[],
}

type PublishArtifacts = {
  privateOutput: PrivateRankedOutput,
  publicOutput: PublicLeaderboardOutputV3,
}

function findLatestServerExport(): LeaderboardExportInput {
  const dir = resolvePath('exports')
  const manifestPath = joinPath(dir, 'latest-export.json')

  if (!fileExists(manifestPath)) {
    throw new Error(`No export manifest found at ${manifestPath}. Run the download script first.`)
  }

  const manifest = JSON.parse(readTextFile(manifestPath)) as { exportId: string, exportTime: string, files: string[] }
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error(`Export manifest at ${manifestPath} has no data files`)
  }

  console.log(`Export manifest: ${manifest.files.length} files, exportTime: ${manifest.exportTime}, exportId: ${manifest.exportId}`)

  return {
    displayPath: dir,
    paths: manifest.files.map((f) => joinPath(dir, f)),
  }
}

function parseExportInput(input: LeaderboardExportInput): ParsedExport {
  const parsedFiles = input.paths.map((path) => parseExport(path))
  return {
    profiles: parsedFiles.flatMap((p) => p.profiles),
    summary: {
      exportPath: input.displayPath,
      totalRows: parsedFiles.reduce((n, p) => n + p.summary.totalRows, 0),
      profileRows: parsedFiles.reduce((n, p) => n + p.summary.profileRows, 0),
      malformedRows: parsedFiles.reduce((n, p) => n + p.summary.malformedRows, 0),
      parsedProfiles: parsedFiles.reduce((n, p) => n + p.summary.parsedProfiles, 0),
      characterErrors: parsedFiles.flatMap((p) => p.summary.characterErrors),
    },
  }
}

export async function runLeaderboardPipeline(options: LeaderboardCliOptions, workerScriptUrl: URL): Promise<void> {
  const runStartMs = performance.now()
  console.log('Initializing metadata...')
  Metadata.initialize()
  console.log('Metadata initialized')

  await withSequentialBenchmarks(async () => {
    const exportInput = options.exportPath
      ? { displayPath: options.exportPath, paths: [options.exportPath] }
      : findLatestServerExport()
    const privateOutputPath = options.privateOutputPath
    const publicOutputPath = options.publicOutputPath
    const topN = options.topN
    const topNPublic = options.topNPublic

    const versions = readLeaderboardVersions()
    const leaderboardVersionsHash = hashObject(versions)
    const globalVersion = versions.global
    assertScoringStoreClean(useScoringStore.getState().scoringMetadataOverrides)

    const runtimeConfig = {
      buildScoreCacheDbPath: options.buildScoreCacheDbPath,
      leaderboardVersionsHash,
    }

    runBuildScoreCacheMaintenance({
      options,
      leaderboardVersionsHash,
    })

    const parseStartMs = performance.now()
    let parsed: ParsedExport | undefined = parseExportInput(exportInput)
    const parseElapsedMs = performance.now() - parseStartMs
    const exportProfileCount = parsed.profiles.length
    const parseSummary = parsed.summary
    console.log(
      `Parsed ${exportProfileCount} profiles from ${exportInput.paths.length} file(s) (${parseSummary.malformedRows} malformed, ${parseSummary.characterErrors.length} character errors) in ${
        (parseElapsedMs / 1000).toFixed(1)
      }s`,
    )
    if (exportProfileCount === 0) {
      throw new Error('Parsed export contained no profiles; refusing to publish empty leaderboard')
    }

    const previousPayloadIndex = options.freshRun
      ? null
      : readProfilePayloadIndex(privateOutputPath)
    const diff = diffProfilePayloads({ previous: previousPayloadIndex, currentProfiles: parsed.profiles })
    console.log(`Diff: ${diff.newUids.size} new, ${diff.changedUids.size} changed, ${diff.unchangedUids.size} unchanged, ${diff.missingUids.size} missing`)

    console.log(`Pre-filtering to top ${topN} per character...`)
    const prefilterStartMs = performance.now()
    const preFilterResult = preFilterProfiles(parsed.profiles, topN)
    const totalCounts = preFilterResult.totalCounts
    const profiles = preFilterResult.profiles.filter((p) => p.characters.length > 0)
    const prefilterElapsedMs = performance.now() - prefilterStartMs

    const payloadIndex = buildProfilePayloadIndex({ profiles: parsed.profiles })
    parsed = undefined

    const totalCandidates = profiles.reduce((n, p) => n + p.characters.length, 0)
    console.log(`Pre-filter: kept ${totalCandidates} candidates across ${profiles.length} profiles in ${(prefilterElapsedMs / 1000).toFixed(1)}s`)
    console.log(`Scoring ${totalCandidates} candidates across ${profiles.length} profiles`)

    const scoring = await runScoringStage({
      profiles,
      versions,
      globalVersion,
      workerCount: options.workerThreads,
      runtimeConfig,
      workerScriptUrl,
    })

    printFailures(scoring)

    const generatedAt = new Date().toISOString()

    const artifacts = buildPublishArtifacts({
      entries: scoring.entries,
      versions,
      topN,
      topNPublic,
      payloadIndex,
      profileCount: exportProfileCount,
      exportInput,
      totalCounts,
      generatedAt,
    })

    const changelogResult = options.skipChangelog
      ? null
      : computeChangelogUpdate({
        privateOutput: artifacts.privateOutput,
        totalCounts,
        generatedAt,
        snapshotPath: deriveSnapshotPath(options.buildScoreCacheDbPath),
        changelogPath: deriveChangelogPath(publicOutputPath),
        allowedCharacterIds: new Set(
          Object.values(getGameMetadata().characters)
            .filter((c) => c.rarity === 5)
            .map((c) => c.id),
        ),
      })

    writePublishArtifacts({
      privateOutputPath,
      publicOutputPath,
      artifacts,
    })

    if (changelogResult) {
      writeChangelogArtifacts(changelogResult)
      console.log(`Changelog: ${changelogResult.changelog.events.length} events, written to ${changelogResult.changelogPath}`)
    }

    printLeaderboardResults(artifacts.privateOutput, topNPublic)
    printTopNCoverageAnalysis(artifacts.privateOutput, topNPublic)
    printRunSummary({
      entries: scoring.entries,
      failures: scoring.failures,
      buildScoreCacheStats: scoring.buildScoreCacheStats,
      exportProfileCount,
      parseSummary,
      profiles,
      totalCandidates,
      metrics: scoring.metrics,
      workerCount: options.workerThreads,
      buildScoreCacheDbPath: options.buildScoreCacheDbPath,
      freshRun: options.freshRun,
      pruneBuildScoreCache: options.pruneBuildScoreCache,
      topN,
      topNPublic,
      parseElapsedMs,
      prefilterElapsedMs,
      scoringElapsedMs: scoring.elapsedMs,
      runElapsedMs: performance.now() - runStartMs,
    })
  })
}

async function withSequentialBenchmarks<T>(run: () => Promise<T>): Promise<T> {
  const previousSequentialBenchmarks = globalThis.SEQUENTIAL_BENCHMARKS
  globalThis.SEQUENTIAL_BENCHMARKS = true
  try {
    return await run()
  } finally {
    globalThis.SEQUENTIAL_BENCHMARKS = previousSequentialBenchmarks
  }
}

function runBuildScoreCacheMaintenance(input: {
  options: LeaderboardCliOptions,
  leaderboardVersionsHash: string,
}): void {
  const { options, leaderboardVersionsHash } = input
  if (!options.freshRun && !options.pruneBuildScoreCache) return

  const cache = new LeaderboardBuildScoreCache({
    dbPath: options.buildScoreCacheDbPath,
    leaderboardVersionsHash,
  })

  if (options.freshRun) {
    const result = cache.clear()
    console.log(`Fresh run: cleared Leaderboard Build Score Cache rows: ${result.deletedRows}`)
    return
  }

  const result = cache.prune({
    leaderboardVersionsHash,
  })
  console.log(`Pruned Leaderboard Build Score Cache rows: ${result.deletedRows}`)
}

function printFailures(scoring: Pick<RunScoringStageResult, 'failures'>): void {
  if (scoring.failures.length === 0) return

  console.log(`${scoring.failures.length} failures:`)
  for (const f of scoring.failures) {
    console.log(`  ${f.uid} / ${f.characterId}${f.configType ? ` / ${f.configType}` : ''}: ${f.error}`)
  }
}

function buildPublishArtifacts(input: {
  entries: PrivateRankedEntry[],
  versions: PrivateRankedOutput['versions'],
  topN: number,
  topNPublic: number,
  payloadIndex: ProfilePayloadIndex,
  profileCount: number,
  exportInput: LeaderboardExportInput,
  totalCounts: Map<string, number>,
  generatedAt: string,
}): PublishArtifacts {
  const privateOutput = buildPrivateRankedOutput({
    entries: input.entries,
    versions: input.versions,
    sourceExport: {
      path: input.exportInput.displayPath,
      profileCount: input.profileCount,
    },
    payloadIndex: input.payloadIndex,
    generatedAt: input.generatedAt,
    topN: input.topN,
    topNPublic: input.topNPublic,
  })

  assertPrivateOutputPublishable(privateOutput)

  const publicOutput = buildPublicOutputFromPrivate({
    privateOutput,
    topNPublic: input.topNPublic,
    totalCounts: input.totalCounts,
    generatedAt: input.generatedAt,
  })
  validateNoUidInPublicOutput(publicOutput)

  return {
    privateOutput,
    publicOutput,
  }
}

function writePublishArtifacts(input: {
  privateOutputPath: string,
  publicOutputPath: string,
  artifacts: PublishArtifacts,
}): void {
  writePrivateRankedOutput(input.privateOutputPath, input.artifacts.privateOutput)
  writePublicLeaderboardOutput(input.publicOutputPath, input.artifacts.publicOutput)
}

function assertScoringStoreClean(overrides: Partial<Record<CharacterId, ScoringMetadataOverride>>): void {
  const overrideIds = Object.keys(overrides)
  if (overrideIds.length > 0) {
    throw new Error(`Leaderboard scoring store has overrides for ${overrideIds.join(', ')}; refusing non-canonical run`)
  }
}
