import { Metadata } from 'lib/state/metadataInitializer'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { LeaderboardBuildScoreCache } from 'leaderboard/cache/leaderboardBuildScoreCache'
import { parseExport } from 'leaderboard/ingest/exportParser'
import { preFilterProfiles } from 'leaderboard/ingest/preFilter'
import {
  buildProfilePayloadIndex,
  diffProfilePayloads,
} from 'leaderboard/ingest/profileDiff'
import {
  assertPrivateOutputPublishable,
  collectDependencyInvalidations,
  mergePrivateRankedOutput,
  readPrivateRankedOutput,
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
} from 'leaderboard/pipeline/leaderboardReporting'
import {
  runScoringStage,
  type RunScoringStageResult,
} from 'leaderboard/pipeline/scoringStage'
import { estimateScoringRuns } from 'leaderboard/scoring/scorer'
import type { LeaderboardCliOptions } from 'leaderboard/shared/cliOptions'
import { hashObject } from 'leaderboard/shared/hash'
import {
  joinPath,
  listDirectoryWithMtime,
  resolvePath,
} from 'leaderboard/shared/nodeFacade'
import type {
  ParsedExport,
  ParsedProfile,
  PrivateRankedEntry,
  PrivateRankedOutput,
  PublicLeaderboardOutputV3,
} from 'leaderboard/shared/types'
import {
  collectAffectedCharacterIds,
  collectBumpedIds,
  readLeaderboardVersions,
} from 'leaderboard/shared/versioning'
import type { CharacterId } from 'types/character'
import type { ScoringMetadataOverride } from 'types/metadata'

type LeaderboardExportInput = {
  displayPath: string,
  paths: string[],
}

type PublishArtifacts = {
  privateOutput: PrivateRankedOutput,
  publicOutput: PublicLeaderboardOutputV3,
  dependencyInvalidatedUids: Set<string>,
}

function findLatestServerExport(): LeaderboardExportInput {
  const dir = resolvePath('exports')
  const files = listDirectoryWithMtime(dir)
    .filter((f) => f.name.endsWith('.json.gz'))
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
  if (!files.length) throw new Error(`No .json.gz export files found in ${dir}`)

  const newestMtime = files[0].mtimeMs
  const newestFiles = files.filter((f) => f.mtimeMs === newestMtime)
  return {
    displayPath: dir,
    paths: newestFiles.map((f) => joinPath(dir, f.name)),
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
    const parsed = parseExportInput(exportInput)
    const parseElapsedMs = performance.now() - parseStartMs
    console.log(
      `Parsed ${parsed.profiles.length} profiles from ${exportInput.paths.length} file(s) (${parsed.summary.malformedRows} malformed, ${parsed.summary.characterErrors.length} character errors) in ${
        (parseElapsedMs / 1000).toFixed(1)
      }s`,
    )
    if (parsed.profiles.length === 0) {
      throw new Error('Parsed export contained no profiles; refusing to publish empty leaderboard')
    }

    const previousPrivate = options.freshRun
      ? null
      : readPrivateRankedOutput(privateOutputPath)
    const previousIndex = previousPrivate?.payloadIndex ?? null
    const diff = diffProfilePayloads({ previous: previousIndex, currentProfiles: parsed.profiles })
    console.log(`Diff: ${diff.newUids.size} new, ${diff.changedUids.size} changed, ${diff.unchangedUids.size} unchanged, ${diff.missingUids.size} missing`)

    const globalVersionChanged = previousPrivate == null || previousPrivate.versions.global !== globalVersion
    const dependencyInvalidations = collectDependencyInvalidations({
      previous: previousPrivate,
      versions,
      globalVersion,
    })

    const versionBumpUids = collectVersionBumpUids({
      profiles: parsed.profiles,
      previousVersions: previousPrivate?.versions,
      versions,
    })

    const needsScoringUids = buildNeedsScoringUids({
      profiles: parsed.profiles,
      scoreAll: options.freshRun || globalVersionChanged,
      changedUids: diff.changedUids,
      newUids: diff.newUids,
      dependencyInvalidatedUids: new Set([...dependencyInvalidations.invalidatedUids, ...versionBumpUids]),
    })
    console.log(
      `Scoring queue: ${needsScoringUids.size} UIDs (${dependencyInvalidations.invalidatedUids.size} dependency invalidated, ${versionBumpUids.size} version bumped)`,
    )

    console.log(`Pre-filtering to top ${topN} per character...`)
    const prefilterStartMs = performance.now()
    const preFilterResult = preFilterProfiles(parsed.profiles, topN)
    const totalCounts = preFilterResult.totalCounts
    const profiles = preFilterResult.profiles
      .filter((p) => needsScoringUids.has(p.uid))
      .filter((p) => p.characters.length > 0)
    const prefilterElapsedMs = performance.now() - prefilterStartMs

    const totalCandidates = profiles.reduce((n, p) => n + p.characters.length, 0)
    const prefilterTotalKept = preFilterResult.profiles.reduce((n, p) => n + p.characters.length, 0)
    console.log(`Pre-filter: kept ${prefilterTotalKept} candidates across ${profiles.length} profiles in ${(prefilterElapsedMs / 1000).toFixed(1)}s`)
    const estimatedRuns = estimateScoringRuns(profiles)
    console.log(`Scoring ${totalCandidates} candidates across ${profiles.length} profiles (${estimatedRuns} scoring runs)`)
    if (globalVersionChanged && totalCandidates === 0) {
      throw new Error('Full leaderboard run has no candidates after filtering; refusing to publish empty leaderboard')
    }

    const scoring = await runScoringStage({
      profiles,
      versions,
      globalVersion,
      estimatedRuns,
      workerCount: options.workerThreads,
      runtimeConfig,
      workerScriptUrl,
    })

    printFailures(scoring)

    const artifacts = buildPublishArtifacts({
      previousPrivate,
      entries: scoring.entries,
      changedUids: diff.changedUids,
      missingUids: diff.missingUids,
      invalidatedDependencyDigests: dependencyInvalidations.invalidatedDependencyDigests,
      versions,
      globalVersion,
      topN,
      topNPublic,
      parsed,
      exportInput,
      totalCounts,
    })

    if (artifacts.dependencyInvalidatedUids.size > 0) {
      console.log(`Dependency invalidated UIDs: ${artifacts.dependencyInvalidatedUids.size}`)
    }

    writePublishArtifacts({
      privateOutputPath,
      publicOutputPath,
      artifacts,
    })

    printLeaderboardResults(artifacts.privateOutput, topNPublic)
    printRunSummary({
      entries: scoring.entries,
      failures: scoring.failures,
      buildScoreCacheStats: scoring.buildScoreCacheStats,
      parsed,
      profiles,
      totalCandidates,
      prefilterTotalKept,
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

function collectVersionBumpUids(input: {
  profiles: ParsedProfile[],
  previousVersions: PrivateRankedOutput['versions'] | undefined,
  versions: PrivateRankedOutput['versions'],
}): Set<string> {
  const bumped = collectBumpedIds(input.previousVersions, input.versions)
  const affectedCharacterIds = collectAffectedCharacterIds(bumped.characterIds, bumped.lightConeIds)
  const versionBumpUids = new Set<string>()
  if (affectedCharacterIds.size === 0) return versionBumpUids

  for (const profile of input.profiles) {
    for (const character of profile.characters) {
      if (affectedCharacterIds.has(String(character.unconverted.avatarId))) {
        versionBumpUids.add(profile.uid)
        break
      }
    }
  }
  console.log(
    `Version bump: ${bumped.characterIds.size} characters, ${bumped.lightConeIds.size} light cones -> ${affectedCharacterIds.size} affected characters -> ${versionBumpUids.size} UIDs queued`,
  )
  return versionBumpUids
}

function buildNeedsScoringUids(input: {
  profiles: ParsedProfile[],
  scoreAll: boolean,
  changedUids: Set<string>,
  newUids: Set<string>,
  dependencyInvalidatedUids: Set<string>,
}): Set<string> {
  const { profiles, scoreAll, changedUids, newUids, dependencyInvalidatedUids } = input
  if (scoreAll) {
    return new Set(profiles.map((profile) => profile.uid))
  }

  return new Set([
    ...changedUids,
    ...newUids,
    ...dependencyInvalidatedUids,
  ])
}

function printFailures(scoring: Pick<RunScoringStageResult, 'failures'>): void {
  if (scoring.failures.length === 0) return

  console.log(`${scoring.failures.length} failures:`)
  for (const f of scoring.failures) {
    console.log(`  ${f.uid} / ${f.characterId}${f.configType ? ` / ${f.configType}` : ''}: ${f.error}`)
  }
}

function buildPublishArtifacts(input: {
  previousPrivate: PrivateRankedOutput | null,
  entries: PrivateRankedEntry[],
  changedUids: Set<string>,
  missingUids: Set<string>,
  invalidatedDependencyDigests: Set<string>,
  versions: PrivateRankedOutput['versions'],
  globalVersion: number,
  topN: number,
  topNPublic: number,
  parsed: ParsedExport,
  exportInput: LeaderboardExportInput,
  totalCounts: Map<string, number>,
}): PublishArtifacts {
  const { output: privateOutput, dependencyInvalidatedUids } = mergePrivateRankedOutput({
    previous: input.previousPrivate,
    newEntries: input.entries,
    changedUids: input.changedUids,
    missingUids: input.missingUids,
    invalidatedDependencyDigests: input.invalidatedDependencyDigests,
    globalVersion: input.globalVersion,
    topN: input.topN,
    topNPublic: input.topNPublic,
  })

  privateOutput.payloadIndex = buildProfilePayloadIndex({ profiles: input.parsed.profiles })
  privateOutput.versions = input.versions
  privateOutput.sourceExport = {
    path: input.exportInput.displayPath,
    profileCount: input.parsed.profiles.length,
  }
  privateOutput.generatedAt = new Date().toISOString()
  assertPrivateOutputPublishable(privateOutput)

  const publicOutput = buildPublicOutputFromPrivate({
    privateOutput,
    topNPublic: input.topNPublic,
    totalCounts: input.totalCounts,
  })
  validateNoUidInPublicOutput(publicOutput)

  return {
    privateOutput,
    publicOutput,
    dependencyInvalidatedUids,
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
