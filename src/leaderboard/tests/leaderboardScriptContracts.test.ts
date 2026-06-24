import {
  buildLeaderboardBuildScoreCacheKey,
  LeaderboardBuildScoreCache,
} from 'leaderboard/cache/leaderboardBuildScoreCache'
import { parseExport } from 'leaderboard/ingest/exportParser'
import { isEligibleRaw } from 'leaderboard/ingest/eligibility'
import type { EligibleConverted } from 'leaderboard/ingest/eligibility'
import { extractPreFilterSubstats } from 'leaderboard/ingest/preFilterExtractor'
import { CharacterConverter } from 'lib/importer/characterConverter'
import { substatPotentialUnits } from 'lib/relics/scoring/scoringConstants'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  buildProfilePayloadIndex,
  diffProfilePayloads,
} from 'leaderboard/ingest/profileDiff'
import {
  buildPrivateRankedOutput,
  readProfilePayloadIndex,
} from 'leaderboard/output/privateOutput'
import {
  buildPublicOutputFromPrivate,
  validateNoUidInPublicOutput,
} from 'leaderboard/output/publicOutput'
import {
  countScoringVariants,
  expandScoringVariants,
} from 'leaderboard/scoring/scoringVariants'
import type { EidolonTierValue } from 'leaderboard/shared/eidolonConfig'
import {
  deleteFile,
  ensureDirectory,
  fileExists,
  gunzipBase64Text,
  gzipTextToBase64,
  joinPath,
  openSqliteDatabase,
  resolvePath,
  tmpDir,
  writeGzipTextFile,
  writeTextFile,
} from 'leaderboard/shared/nodeFacade'
import {
  expandProfile,
  type MinifiedCharacter,
  type MinifiedProfile,
} from 'leaderboard/shared/profileCompression'
import {
  type LeaderboardBuildScore,
  type LeaderboardDependencyNamespace,
  type LeaderboardDependencyVersions,
  type LeaderboardEntryData,
  type LeaderboardScoreWorkerRuntimeConfig,
  type LeaderboardScoringCandidate,
  type ParsedProfile,
  type PrivateBoard,
  type PrivateBoardCompleteness,
  type PrivateRankedEntry,
  type PrivateRankedOutput,
  type PublicCharacterData,
} from 'leaderboard/shared/types'
import {
  compressedProfileSampleBase64,
  sampleFetchedAt,
  sampleUid,
} from 'leaderboard/tests/leaderboardProfileSample'
import {
  buildLeaderboardScoreWorkerStateKey,
} from 'leaderboard/workers/profileWorkerContracts'
import {
  buildDependencyNamespace,
  getDependencyVersions,
} from 'leaderboard/shared/versioning'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { TrailblazerHarmonyCaelus } from 'lib/conditionals/character/8000/TrailblazerHarmony'
import { MemoriesOfThePast } from 'lib/conditionals/lightcone/4star/MemoriesOfThePast'
import {
  type MainStats,
  Parts,
  Sets,
  Stats,
  type SubStats,
} from 'lib/constants/constants'
import type { AugmentedStats } from 'lib/relics/relicAugmenter'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import {
  type LeaderboardTeam,
  ScoringConfigType,
  type SimulationMetadata,
} from 'types/metadata'
import type { Relic } from 'types/relic'
import {
  describe,
  expect,
  test,
  vi,
} from 'vitest'

const CHARACTER_ID = '1307b1'
const LIGHT_CONE_ID = '23022'
const TEAMMATE_ID = '1005'
const TEAMMATE_LIGHT_CONE_ID = '23000'
const TEAM_ID = 'default'
const BOARD_KEY = `${CHARACTER_ID}#dps#${TEAM_ID}`
const GLOBAL_VERSION = 1
const CURRENT_DEPENDENCY_DIGEST = 'dependency-current'

const DEPENDENCY_VERSIONS: LeaderboardDependencyVersions = {
  global: GLOBAL_VERSION,
  characterVersions: {
    '1005': 1,
    '1307b1': 1,
  },
  lightConeVersions: {
    '23000': 1,
    '23022': 1,
  },
  primaryCharacterId: CHARACTER_ID,
  primaryLightConeId: LIGHT_CONE_ID,
  teammateCharacterIds: [TEAMMATE_ID],
  teammateLightConeIds: [TEAMMATE_LIGHT_CONE_ID],
}

const DEPENDENCY_NAMESPACE: LeaderboardDependencyNamespace = {
  dependencies: DEPENDENCY_VERSIONS,
  dependencyDigest: CURRENT_DEPENDENCY_DIGEST,
}

const MINIFIED_CHARACTER: MinifiedCharacter = {
  a: 1307,
  e: 1,
  r: 0,
  q: {
    t: 23022,
    r: 1,
  },
  l: [],
}

const SIMULATION_METADATA: SimulationMetadata = {
  parts: {
    Body: [Stats.CR],
    Feet: [Stats.SPD],
    PlanarSphere: [Stats.Quantum_DMG],
    LinkRope: [Stats.ATK_P],
  },
  substats: [
    Stats.CR,
    Stats.CD,
    Stats.ATK_P,
    Stats.SPD,
    Stats.HP,
  ],
  comboTurnAbilities: [],
  relicSets: [],
  ornamentSets: [],
  teammates: [],
}

function sortedValues(values: Set<string>): string[] {
  return Array.from(values).sort()
}

function tempGzipPath(prefix: string): string {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return resolvePath(tmpDir(), `${prefix}-${uniqueId}.json.gz`)
}

function tempSqlitePath(prefix: string): string {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return resolvePath(tmpDir(), `${prefix}-${uniqueId}.sqlite`)
}

function tempPrivateOutputPath(prefix: string): string {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return resolvePath(tmpDir(), `${prefix}-${uniqueId}`)
}

function insertBuildScoreCacheRow(input: {
  dbPath: string,
  key: string,
  leaderboardVersionsHash: string,
  valueJson: string,
  createdAt?: string,
}): void {
  const db = openSqliteDatabase(input.dbPath)
  db.prepare(`
    INSERT OR REPLACE INTO leaderboard_build_score_cache
      (key, leaderboard_versions_hash, value, created_at)
    VALUES (?, ?, ?, ?)
  `).run(
    input.key,
    input.leaderboardVersionsHash,
    input.valueJson,
    input.createdAt ?? new Date().toISOString(),
  )
}

function readBuildScoreCacheRow(dbPath: string, key: string): { value: string } | undefined {
  const db = openSqliteDatabase(dbPath)
  return db.prepare<{ value: string }>(`
    SELECT value FROM leaderboard_build_score_cache WHERE key = ?
  `).get(key)
}

function parsedProfile(uid: string, payloadHash: string, fetchedAt = 1): ParsedProfile {
  return {
    uid,
    fetchedAt,
    payloadHash,
    characters: [],
  }
}

function makeEntryData(score: number): LeaderboardEntryData {
  return {
    character: MINIFIED_CHARACTER,
    team: [{
      characterId: TEAMMATE_ID,
      lightCone: TEAMMATE_LIGHT_CONE_ID,
      characterEidolon: 6,
      lightConeSuperimposition: 5,
    }],
    teamEidolon: 0,
    characterEidolon: 0,
    teamId: TEAM_ID,
    baselineSimScore: score - 1,
    benchmarkSimScore: score,
    maximumSimScore: score + 1,
    fetchedAt: 1_710_000_000,
  }
}

function makeCompleteness(overrides: Partial<PrivateBoardCompleteness> = {}): PrivateBoardCompleteness {
  return {
    scoredCandidateCount: 0,
    totalScoredEntries: 0,
    privateCutoffScore: null,
    publicCutoffScore: null,
    topN: 10,
    topNPublic: 2,
    canRefillPublicTopN: false,
    ...overrides,
  }
}

function makeEntry(
  uid: string,
  score: number,
  overrides: Partial<PrivateRankedEntry> = {},
): PrivateRankedEntry {
  return {
    rank: 0,
    uid,
    uidHash: `hash-${uid}`,
    payloadHash: `payload-${uid}`,
    score,
    configType: ScoringConfigType.DPS,
    characterId: CHARACTER_ID,
    teamId: TEAM_ID,
    teamTier: 'e0' as const,
    data: makeEntryData(score),
    dependencyVersions: DEPENDENCY_VERSIONS,
    dependencyDigest: CURRENT_DEPENDENCY_DIGEST,
    preFilterRank: 1,
    ...overrides,
  }
}

function privateOutput(entries: PrivateRankedEntry[]): PrivateRankedOutput {
  const board: PrivateBoard = {
    characterId: CHARACTER_ID,
    configType: 'dps',
    teamId: TEAM_ID,
    entries,
    completeness: makeCompleteness({
      totalScoredEntries: entries.length,
      scoredCandidateCount: entries.length,
    }),
  }

  return {
    generatedAt: '2026-06-06T00:00:00.000Z',
    versions: { global: GLOBAL_VERSION, characters: {}, lightCones: {} },
    sourceExport: {
      path: 'export.json.gz',
      profileCount: entries.length,
    },
    boards: {
      [BOARD_KEY]: board,
    },
    payloadIndex: {
      exportId: 'test-export',
      profiles: {},
    },
  }
}

function makeRelic(id: string, substatValue = 6.48): Relic {
  return {
    enhance: 15,
    equippedBy: undefined,
    grade: 5,
    id,
    main: {
      stat: Stats.HP as MainStats,
      value: 705.6,
    },
    part: Parts.Head,
    set: Sets.MusketeerOfWildWheat,
    substats: [{
      stat: Stats.CR as SubStats,
      value: substatValue,
    }],
    previewSubstats: [],
    initialRolls: 4,
    augmentedStats: {} as AugmentedStats,
    weightScore: 0,
  }
}

function makePreviewRelics(relicId: string, substatValue = 6.48): PreviewRelics {
  return {
    Head: makeRelic(relicId, substatValue),
    Hands: null,
    Body: null,
    Feet: null,
    PlanarSphere: null,
    LinkRope: null,
  } as PreviewRelics
}

function makeLeaderboardBuildScore(overrides: Partial<LeaderboardBuildScore> = {}): LeaderboardBuildScore {
  return {
    percent: 1.23,
    originalSimScore: 100,
    baselineSimScore: 90,
    benchmarkSimScore: 110,
    maximumSimScore: 120,
    originalSpd: 134,
    spdBenchmark: undefined,
    simulationFlags: {
      overcapCritRate: false,
      simPoetActive: false,
      characterPoetActive: false,
      forceErrRope: false,
      benchmarkBasicSpdTarget: 0,
      benchmarkBasicResTarget: 0,
    },
    ...overrides,
  }
}

function makeScoringVariantCandidate(): LeaderboardScoringCandidate {
  return {
    uid: sampleUid,
    uidHash: 'uid-hash',
    payloadHash: 'payload-hash',
    fetchedAt: sampleFetchedAt,
    character: {
      unconverted: {} as LeaderboardScoringCandidate['character']['unconverted'],
      minified: MINIFIED_CHARACTER,
      preFilterRank: 1,
    },
    characterId: CHARACTER_ID,
  }
}

describe('leaderboard script contracts', () => {
  test('parseExport reads Dynamo gzip rows and skips non-profile or malformed rows', () => {
    const exportPath = tempGzipPath('leaderboard-export')
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    try {
      const validRow = JSON.stringify({
        Item: {
          pk: { S: sampleUid },
          sk: { S: 'U' },
          t: { N: String(sampleFetchedAt) },
          d: { B: compressedProfileSampleBase64 },
        },
      })
      const skippedRow = JSON.stringify({
        Item: {
          pk: { S: 'ignored' },
          sk: { S: 'PROFILE' },
          t: { N: String(sampleFetchedAt) },
          d: { B: compressedProfileSampleBase64 },
        },
      })

      writeGzipTextFile(exportPath, [validRow, skippedRow, '{not-json'].join('\n'))

      const parsed = parseExport(exportPath)
      const profile = parsed.profiles[0]

      expect(parsed.summary).toMatchObject({
        exportPath,
        totalRows: 3,
        profileRows: 1,
        malformedRows: 1,
        parsedProfiles: 1,
      })
      expect(profile.uid).toBe(sampleUid)
      expect(profile.fetchedAt).toBe(sampleFetchedAt)
      expect(profile).not.toHaveProperty('payloadBase64')
      expect(profile.payloadHash.length).toBe(64)
      expect(profile.characters).toHaveLength(8)
      expect(profile.characters.map((character) => character.unconverted.avatarId)).toContain(CHARACTER_ID)
    } finally {
      logSpy.mockRestore()
      warnSpy.mockRestore()
      if (fileExists(exportPath)) {
        deleteFile(exportPath)
      }
    }
  })

  test('payload index diff separates unchanged, changed, new, and missing profiles', () => {
    const previous = buildProfilePayloadIndex({
      exportId: 'previous-export',
      profiles: [
        parsedProfile('same', 'hash-same', 1),
        parsedProfile('changed', 'hash-old', 2),
        parsedProfile('missing', 'hash-missing', 3),
      ],
    })
    const currentProfiles = [
      parsedProfile('same', 'hash-same', 4),
      parsedProfile('changed', 'hash-new', 5),
      parsedProfile('new', 'hash-brand-new', 6),
    ]

    const diff = diffProfilePayloads({
      previous,
      currentProfiles,
    })
    const currentIndex = buildProfilePayloadIndex({
      exportId: 'current-export',
      profiles: currentProfiles,
    })

    expect(sortedValues(diff.unchangedUids)).toEqual(['same'])
    expect(sortedValues(diff.changedUids)).toEqual(['changed'])
    expect(sortedValues(diff.newUids)).toEqual(['new'])
    expect(sortedValues(diff.missingUids)).toEqual(['missing'])
    expect(currentIndex).toMatchObject({
      exportId: 'current-export',
    })
    expect(currentIndex.profiles.same).toMatchObject({
      uid: 'same',
      fetchedAt: 4,
      payloadHash: 'hash-same',
    })
  })

  test('private ranked output builder groups, dedupes, slices, ranks, and computes completeness', () => {
    const otherTeamEntry = makeEntry('uid-other-team', 700, {
      teamId: 'team-2',
      data: {
        ...makeEntryData(700),
        teamId: 'team-2',
      },
    })

    const output = buildPrivateRankedOutput({
      entries: [
        makeEntry('uid-low', 100),
        makeEntry('uid-top', 500),
        makeEntry('uid-tier-duplicate', 240, { teamTier: 'e0' }),
        makeEntry('uid-tier-duplicate', 250, { teamTier: 'e2', data: { ...makeEntryData(250), teamEidolon: 2 } }),
        otherTeamEntry,
      ],
      versions: { global: GLOBAL_VERSION, characters: {}, lightCones: {} },
      sourceExport: {
        path: 'export.json.gz',
        profileCount: 5,
      },
      payloadIndex: {
        exportId: 'test-export',
        profiles: {},
      },
      generatedAt: '2026-06-06T00:00:00.000Z',
      topN: 10,
      topNPublic: 2,
    })
    const board = output.boards[BOARD_KEY]
    const otherBoard = output.boards[`${CHARACTER_ID}#dps#team-2`]

    expect(board.entries.map((entry) => `${entry.rank}:${entry.uid}:${entry.score}`)).toEqual([
      '1:uid-top:500',
      '2:uid-tier-duplicate:250',
      '3:uid-low:100',
    ])
    expect(board.entries[1].teamTier).toBe('e2')
    expect(board.completeness).toMatchObject({
      scoredCandidateCount: 4,
      totalScoredEntries: 3,
      privateCutoffScore: 100,
      publicCutoffScore: 250,
      canRefillPublicTopN: true,
    })
    expect(otherBoard.entries.map((entry) => `${entry.rank}:${entry.uid}:${entry.score}`)).toEqual([
      '1:uid-other-team:700',
    ])
    expect(output).toMatchObject({
      generatedAt: '2026-06-06T00:00:00.000Z',
      sourceExport: {
        path: 'export.json.gz',
        profileCount: 5,
      },
    })
  })

  test('private output payload index can be read without loading boards', () => {
    const outputPath = tempPrivateOutputPath('leaderboard-private-output')
    const payloadIndex = {
      exportId: 'test-export',
      profiles: {
        'uid-indexed': {
          uid: 'uid-indexed',
          fetchedAt: 123,
          payloadHash: 'payload-uid-indexed',
        },
      },
    }

    ensureDirectory(outputPath)
    ensureDirectory(joinPath(outputPath, 'boards'))
    writeTextFile(joinPath(outputPath, 'payloadIndex.json'), JSON.stringify(payloadIndex))
    writeTextFile(joinPath(outputPath, 'boards', 'malformed-board.json'), '{not-json')

    expect(readProfilePayloadIndex(outputPath)).toEqual(payloadIndex)
  })

  test('public output publishes only compressed public fields and preserves total eligible counts', () => {
    const output = buildPublicOutputFromPrivate({
      privateOutput: privateOutput([
        makeEntry('uid-first', 900, { rank: 1 }),
        makeEntry('uid-second', 800, { rank: 2 }),
      ]),
      topNPublic: 1,
      totalCounts: new Map([[CHARACTER_ID, 42]]),
    })

    validateNoUidInPublicOutput(output)

    const compressedData = Object.values(output.characters)[0]
    const charData = JSON.parse(gunzipBase64Text(compressedData)) as PublicCharacterData
    const boardData = charData.configs.dps?.teamsById[TEAM_ID]

    expect(charData.configs.dps?.totalEntries).toBe(42)
    expect(boardData?.entries).toHaveLength(1)
    const publicEntry = boardData!.entries[0]
    expect(publicEntry).toMatchObject({
      rank: 1,
      score: 900,
      data: {
        character: MINIFIED_CHARACTER,
      },
    })
    expect(publicEntry.buildId).toHaveLength(12)
    expect(publicEntry.candidateId).toHaveLength(12)
    expect(publicEntry).not.toHaveProperty('uid')
    expect(publicEntry).not.toHaveProperty('uidHash')
  })

  test('public output validator rejects forbidden identity fields in compressed entries', () => {
    const badEntry = {
      rank: 1,
      buildId: 'aabbccddeeff',
      candidateId: '112233445566',
      data: makeEntryData(100),
      score: 100,
      uid: sampleUid,
    }
    const charData: PublicCharacterData = {
      configs: {
        dps: {
          teams: [],
          teamsById: {
            [TEAM_ID]: { entries: [badEntry as never], totalEntries: 1 },
          },
          totalEntries: 1,
        },
      },
    }
    const output = {
      generatedAt: '2026-06-06T00:00:00.000Z',
      characters: {
        [CHARACTER_ID]: gzipTextToBase64(JSON.stringify(charData)),
      },
    }

    expect(() => validateNoUidInPublicOutput(output)).toThrow('forbidden field "uid"')
  })

  test('public output validator rejects nested forbidden identity fields', () => {
    const badEntry = {
      rank: 1,
      buildId: 'aabbccddeeff',
      candidateId: '112233445566',
      data: {
        ...makeEntryData(100),
        hiddenIdentity: {
          uidHash: 'leaked-hash',
        },
      },
      score: 100,
    }
    const charData: PublicCharacterData = {
      configs: {
        dps: {
          teams: [],
          teamsById: {
            [TEAM_ID]: { entries: [badEntry as never], totalEntries: 1 },
          },
          totalEntries: 1,
        },
      },
    }
    const output = {
      generatedAt: '2026-06-06T00:00:00.000Z',
      characters: {
        [CHARACTER_ID]: gzipTextToBase64(JSON.stringify(charData)),
      },
    }

    expect(() => validateNoUidInPublicOutput(output)).toThrow('forbidden field "uidHash"')
  })

  test('leaderboard build score cache key ignores relic ids but includes cache inputs', () => {
    const baseInput = {
      globalVersion: GLOBAL_VERSION,
      dependencyDigest: DEPENDENCY_NAMESPACE.dependencyDigest,
      configType: ScoringConfigType.DPS,
      simulationMetadata: SIMULATION_METADATA,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
      singleRelicByPart: makePreviewRelics('relic-a'),
      spdBenchmark: 134,
    }

    const baseKey = buildLeaderboardBuildScoreCacheKey(baseInput)
    const sameWithDifferentRelicIds = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      singleRelicByPart: makePreviewRelics('relic-b'),
    })
    const changedRelicStatsKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      singleRelicByPart: makePreviewRelics('relic-a', 9.72),
    })
    const changedGlobalVersionKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      globalVersion: GLOBAL_VERSION + 1,
    })
    const changedDependencyKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      dependencyDigest: 'other-dependency',
    })
    const changedConfigTypeKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      configType: ScoringConfigType.BUFFER,
    })
    const changedMetadataKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      simulationMetadata: { ...SIMULATION_METADATA, deprioritizeBuffs: true },
    })
    const changedTeamMetadataKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      simulationMetadata: {
        ...SIMULATION_METADATA,
        teammates: [{
          characterId: TEAMMATE_ID as CharacterId,
          lightCone: TEAMMATE_LIGHT_CONE_ID as LightConeId,
          characterEidolon: 6,
          lightConeSuperimposition: 5,
        }],
      },
    })
    const changedSpdBenchmarkKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      spdBenchmark: 135,
    })
    const changedEidolonKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      characterEidolon: 6,
    })
    const changedSuperimpositionKey = buildLeaderboardBuildScoreCacheKey({
      ...baseInput,
      lightConeSuperimposition: 5,
    })

    expect(sameWithDifferentRelicIds).toBe(baseKey)
    expect(changedRelicStatsKey).not.toBe(baseKey)
    expect(changedGlobalVersionKey).not.toBe(baseKey)
    expect(changedDependencyKey).not.toBe(baseKey)
    expect(changedConfigTypeKey).not.toBe(baseKey)
    expect(changedMetadataKey).not.toBe(baseKey)
    expect(changedTeamMetadataKey).not.toBe(baseKey)
    expect(changedSpdBenchmarkKey).not.toBe(baseKey)
    expect(changedEidolonKey).not.toBe(baseKey)
    expect(changedSuperimpositionKey).not.toBe(baseKey)
  })

  test('dependency version bumps change the dependency digest used by the build score cache key', () => {
    const baseVersions = {
      global: GLOBAL_VERSION,
      characters: {
        [CHARACTER_ID]: 1,
        [TEAMMATE_ID]: 1,
      },
      lightCones: {
        [LIGHT_CONE_ID]: 1,
        [TEAMMATE_LIGHT_CONE_ID]: 1,
      },
    }
    const bumpedVersions = {
      ...baseVersions,
      characters: {
        ...baseVersions.characters,
        [TEAMMATE_ID]: 2,
      },
    }
    const team = makeEntryData(100).team
    const baseDependencyNamespace = buildDependencyNamespace({
      dependencyVersions: getDependencyVersions({
        versions: baseVersions,
        primaryCharacterId: CHARACTER_ID,
        primaryLightConeId: LIGHT_CONE_ID,
        teammates: team,
      }),
    })
    const bumpedDependencyNamespace = buildDependencyNamespace({
      dependencyVersions: getDependencyVersions({
        versions: bumpedVersions,
        primaryCharacterId: CHARACTER_ID,
        primaryLightConeId: LIGHT_CONE_ID,
        teammates: team,
      }),
    })

    const baseKey = buildLeaderboardBuildScoreCacheKey({
      globalVersion: GLOBAL_VERSION,
      dependencyDigest: baseDependencyNamespace.dependencyDigest,
      configType: ScoringConfigType.DPS,
      simulationMetadata: SIMULATION_METADATA,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
      singleRelicByPart: makePreviewRelics('relic-a'),
      spdBenchmark: 134,
    })
    const bumpedKey = buildLeaderboardBuildScoreCacheKey({
      globalVersion: GLOBAL_VERSION,
      dependencyDigest: bumpedDependencyNamespace.dependencyDigest,
      configType: ScoringConfigType.DPS,
      simulationMetadata: SIMULATION_METADATA,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
      singleRelicByPart: makePreviewRelics('relic-a'),
      spdBenchmark: 134,
    })

    expect(bumpedDependencyNamespace.dependencyDigest).not.toBe(baseDependencyNamespace.dependencyDigest)
    expect(bumpedKey).not.toBe(baseKey)
  })

  test('leaderboard build score cache persists SQLite values and deletes corrupt rows', () => {
    const dbPath = tempSqlitePath('leaderboard-build-score-cache')
    const score = makeLeaderboardBuildScore()

    const cache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    cache.set('build-score-key', score)
    cache.flush()

    const secondCache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    expect(secondCache.get('build-score-key')).toEqual(score)
    expect(secondCache.stats()).toMatchObject({
      l1Hits: 0,
      sqliteHits: 1,
      misses: 0,
      writes: 0,
      corruptRowsDeleted: 0,
    })

    insertBuildScoreCacheRow({
      dbPath,
      key: 'corrupt-key',
      leaderboardVersionsHash: 'versions-hash',
      valueJson: '{not-json',
    })

    const corruptCache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    expect(corruptCache.get('corrupt-key')).toBeNull()
    expect(corruptCache.stats().corruptRowsDeleted).toBe(1)
    expect(readBuildScoreCacheRow(dbPath, 'corrupt-key')).toBeUndefined()

    insertBuildScoreCacheRow({
      dbPath,
      key: 'null-key',
      leaderboardVersionsHash: 'versions-hash',
      valueJson: 'null',
    })

    const nullCorruptCache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    expect(nullCorruptCache.get('null-key')).toBeNull()
    expect(nullCorruptCache.stats().corruptRowsDeleted).toBe(1)
    expect(readBuildScoreCacheRow(dbPath, 'null-key')).toBeUndefined()

    insertBuildScoreCacheRow({
      dbPath,
      key: 'wrong-key',
      leaderboardVersionsHash: 'versions-hash',
      valueJson: JSON.stringify({
        key: 'other-key',
        createdAt: new Date().toISOString(),
        score,
      }),
    })

    const wrongKeyCorruptCache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    expect(wrongKeyCorruptCache.get('wrong-key')).toBeNull()
    expect(wrongKeyCorruptCache.stats().corruptRowsDeleted).toBe(1)
    expect(readBuildScoreCacheRow(dbPath, 'wrong-key')).toBeUndefined()

    insertBuildScoreCacheRow({
      dbPath,
      key: 'invalid-score',
      leaderboardVersionsHash: 'versions-hash',
      valueJson: JSON.stringify({
        key: 'invalid-score',
        createdAt: new Date().toISOString(),
        score: {
          ...score,
          percent: Number.POSITIVE_INFINITY,
        },
      }),
    })

    const invalidScoreCorruptCache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    expect(invalidScoreCorruptCache.get('invalid-score')).toBeNull()
    expect(invalidScoreCorruptCache.stats().corruptRowsDeleted).toBe(1)
    expect(readBuildScoreCacheRow(dbPath, 'invalid-score')).toBeUndefined()
  })

  test('leaderboard build score cache auto-flushes at the configured interval', () => {
    const dbPath = tempSqlitePath('leaderboard-build-score-cache-autoflush')
    const score = makeLeaderboardBuildScore()

    const cache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
      flushInterval: 1,
    })
    cache.set('auto-flush-key', score)

    expect(cache.stats().writes).toBe(1)
    expect(readBuildScoreCacheRow(dbPath, 'auto-flush-key')).toBeDefined()

    const secondCache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    expect(secondCache.get('auto-flush-key')).toEqual(score)
  })

  test('leaderboard build score cache de-dupes concurrent compute requests', async () => {
    const dbPath = tempSqlitePath('leaderboard-build-score-cache-pending')
    const score = makeLeaderboardBuildScore()
    const cache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })

    let resolveScore: (score: LeaderboardBuildScore | null) => void = () => undefined
    const scorePromise = new Promise<LeaderboardBuildScore | null>((resolve) => {
      resolveScore = resolve
    })
    const compute = vi.fn(() => scorePromise)

    const first = cache.getOrCompute('pending-key', compute)
    const second = cache.getOrCompute('pending-key', compute)
    await Promise.resolve()

    expect(compute).toHaveBeenCalledTimes(1)
    expect(cache.stats()).toMatchObject({
      l1Hits: 0,
      sqliteHits: 0,
      misses: 1,
      writes: 0,
    })

    resolveScore(score)
    await expect(Promise.all([first, second])).resolves.toEqual([score, score])
    expect(cache.stats()).toMatchObject({
      l1Hits: 0,
      sqliteHits: 0,
      misses: 1,
      writes: 1,
    })
    cache.flush()
    expect(readBuildScoreCacheRow(dbPath, 'pending-key')).toBeDefined()
  })

  test('leaderboard build score cache clears pending entries after rejected compute', async () => {
    const dbPath = tempSqlitePath('leaderboard-build-score-cache-reject')
    const score = makeLeaderboardBuildScore()
    const cache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    let attempts = 0
    const compute = vi.fn(() => {
      attempts++
      if (attempts === 1) {
        return Promise.reject(new Error('compute failed'))
      }
      return Promise.resolve(score)
    })

    await expect(cache.getOrCompute('reject-key', compute)).rejects.toThrow('compute failed')
    await expect(cache.getOrCompute('reject-key', compute)).resolves.toEqual(score)

    expect(compute).toHaveBeenCalledTimes(2)
    expect(cache.stats()).toMatchObject({
      misses: 2,
      writes: 1,
    })
  })

  test('leaderboard build score cache prune flushes buffered current rows and deletes stale version rows', () => {
    const dbPath = tempSqlitePath('leaderboard-build-score-cache-prune')
    const score = makeLeaderboardBuildScore()
    const cache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'current-versions',
    })
    cache.set('current-key', score)

    insertBuildScoreCacheRow({
      dbPath,
      key: 'stale-versions',
      leaderboardVersionsHash: 'old-versions',
      valueJson: JSON.stringify({ key: 'stale-versions', createdAt: new Date().toISOString(), score }),
    })

    const result = cache.prune({
      leaderboardVersionsHash: 'current-versions',
    })

    expect(result.deletedRows).toBe(1)
    expect(cache.get('current-key')).toEqual(score)
    expect(cache.get('stale-versions')).toBeNull()

    const secondCache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'current-versions',
    })
    expect(secondCache.get('current-key')).toEqual(score)
    expect(secondCache.get('stale-versions')).toBeNull()
  })

  test('leaderboard build score cache clear drops buffered and persisted rows', () => {
    const dbPath = tempSqlitePath('leaderboard-build-score-cache-clear')
    const score = makeLeaderboardBuildScore()
    const cache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    cache.set('persisted-key', score)
    cache.flush()
    cache.set('buffered-key', score)

    const result = cache.clear()

    expect(result.deletedRows).toBe(1)
    expect(cache.get('persisted-key')).toBeNull()
    expect(cache.get('buffered-key')).toBeNull()

    const secondCache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })
    expect(secondCache.get('persisted-key')).toBeNull()
    expect(secondCache.get('buffered-key')).toBeNull()
  })

  test('leaderboard build score cache stats returns a snapshot copy', () => {
    const dbPath = tempSqlitePath('leaderboard-build-score-cache-stats')
    const cache = new LeaderboardBuildScoreCache({
      dbPath,
      leaderboardVersionsHash: 'versions-hash',
    })

    const snapshot = cache.stats()
    snapshot.misses = 99
    snapshot.writes = 99

    expect(cache.stats()).toMatchObject({
      misses: 0,
      writes: 0,
    })
  })

  test('worker state key changes when runtime config or versions change', () => {
    const runtimeConfig: LeaderboardScoreWorkerRuntimeConfig = {
      buildScoreCacheDbPath: './cache.sqlite',
      leaderboardVersionsHash: 'versions-hash',
    }
    const versions = { global: 1, characters: { [CHARACTER_ID]: 1 }, lightCones: { [LIGHT_CONE_ID]: 1 } }

    const baseKey = buildLeaderboardScoreWorkerStateKey({
      versions,
      globalVersion: GLOBAL_VERSION,
      runtimeConfig,
    })
    expect(buildLeaderboardScoreWorkerStateKey({
      versions,
      globalVersion: GLOBAL_VERSION,
      runtimeConfig: { ...runtimeConfig, buildScoreCacheDbPath: './other-cache.sqlite' },
    })).not.toBe(baseKey)
    expect(buildLeaderboardScoreWorkerStateKey({
      versions,
      globalVersion: GLOBAL_VERSION,
      runtimeConfig: { ...runtimeConfig, leaderboardVersionsHash: 'other-versions-hash' },
    })).not.toBe(baseKey)
    expect(buildLeaderboardScoreWorkerStateKey({
      versions: { ...versions, global: 2 },
      globalVersion: GLOBAL_VERSION,
      runtimeConfig,
    })).not.toBe(baseKey)
    expect(buildLeaderboardScoreWorkerStateKey({
      versions,
      globalVersion: GLOBAL_VERSION + 1,
      runtimeConfig,
    })).not.toBe(baseKey)
  })

  test('scoring variant expansion matches count and preserves team identity across tiers', () => {
    const candidate = makeScoringVariantCandidate()
    const team: LeaderboardTeam = {
      teammates: [
        { characterId: '1007' as CharacterId, lightCones: ['23004', '23005'] as LightConeId[] },
        { characterId: TEAMMATE_ID as CharacterId, lightCones: [TEAMMATE_LIGHT_CONE_ID as LightConeId] },
        { characterId: '1006' as CharacterId, lightCones: ['23002', '23003'] as LightConeId[] },
      ],
    }

    const input = {
      candidate,
      configType: ScoringConfigType.DPS,
      baseMetadata: SIMULATION_METADATA,
      leaderboardTeams: [team],
      eligibleTiers: [0, 2] as EidolonTierValue[],
    }
    const variants = expandScoringVariants(input)

    expect(countScoringVariants(input)).toBe(8)
    expect(variants).toHaveLength(8)
    expect([...new Set(variants.map((variant) => variant.teamId))]).toEqual(['1005|1006|1007'])
    expect(variants.map((variant) => `${variant.teamTier}:${variant.teamEidolon}`)).toEqual([
      'e0:0',
      'e0:0',
      'e0:0',
      'e0:0',
      'e2:2',
      'e2:2',
      'e2:2',
      'e2:2',
    ])
    expect(variants[0].simulationMetadata.leaderboardTeams).toBeUndefined()
    expect(variants[0].simulationMetadata.teammates.map((teammate) => teammate.lightCone)).toEqual([
      '23004',
      TEAMMATE_LIGHT_CONE_ID,
      '23002',
    ])
    expect(variants[7].simulationMetadata.teammates.map((teammate) => teammate.lightCone)).toEqual([
      '23005',
      TEAMMATE_LIGHT_CONE_ID,
      '23003',
    ])
  })

  test('scoring variant expansion applies teammate overrides, caps, and deprioritize support', () => {
    const team: LeaderboardTeam = {
      deprioritizeBuffs: true,
      teammates: [
        { characterId: Sunday.id, lightCones: [TEAMMATE_LIGHT_CONE_ID as LightConeId] },
        { characterId: TrailblazerHarmonyCaelus.id, lightCones: [MemoriesOfThePast.id] },
        { characterId: '1006' as CharacterId, lightCones: ['23002' as LightConeId] },
      ],
    }
    const input = {
      candidate: makeScoringVariantCandidate(),
      configType: ScoringConfigType.DPS,
      baseMetadata: SIMULATION_METADATA,
      leaderboardTeams: [team],
      eligibleTiers: [6] as EidolonTierValue[],
    }

    const [variant] = expandScoringVariants(input)
    const [sunday, trailblazer, uncapped] = variant.simulationMetadata.teammates

    expect(variant.simulationMetadata.deprioritizeBuffs).toBe(true)
    expect(sunday).toMatchObject({
      characterId: Sunday.id,
      characterEidolon: 5,
      lightConeSuperimposition: 1,
    })
    expect(trailblazer).toMatchObject({
      characterId: TrailblazerHarmonyCaelus.id,
      characterEidolon: 6,
      lightCone: MemoriesOfThePast.id,
      lightConeSuperimposition: 5,
    })
    expect(uncapped).toMatchObject({
      characterId: '1006',
      characterEidolon: 6,
      lightConeSuperimposition: 1,
    })

    const [unsupportedVariant] = expandScoringVariants({
      ...input,
      configType: ScoringConfigType.BUFFER,
    })
    expect(unsupportedVariant.simulationMetadata.deprioritizeBuffs).toBeUndefined()
  })

  describe('preFilter mini-convert contract', () => {
    Metadata.initialize()

    function decompressSampleProfile() {
      const minified: MinifiedProfile = JSON.parse(gunzipBase64Text(compressedProfileSampleBase64))
      return expandProfile(minified)
    }

    test('extractPreFilterSubstats produces identical stat/value pairs as full CharacterConverter.convert', () => {
      const characters = decompressSampleProfile()
      const eligible = characters.filter((c) => isEligibleRaw(c))
      expect(eligible.length).toBeGreaterThan(0)

      for (const unconverted of eligible) {
        const converted = CharacterConverter.convert(unconverted) as EligibleConverted
        const fullSubstats = Object.values(converted.equipped)
          .filter(Boolean)
          .flatMap((relic) => relic!.substats.map((s) => ({ stat: s.stat, value: s.value })))

        const miniSubstats = extractPreFilterSubstats(unconverted.relicList!)

        expect(miniSubstats).toEqual(fullSubstats)
      }
    })

    test('prefilter substat scoring is identical between mini-convert and full convert', () => {
      const characters = decompressSampleProfile()
      const eligible = characters.filter((c) => isEligibleRaw(c))

      for (const unconverted of eligible) {
        const converted = CharacterConverter.convert(unconverted) as EligibleConverted

        let fullScore = 0
        for (const relic of Object.values(converted.equipped)) {
          if (!relic) continue
          for (const sub of relic.substats) {
            fullScore += substatPotentialUnits(sub.stat, sub.value)
          }
        }

        let miniScore = 0
        const miniSubstats = extractPreFilterSubstats(unconverted.relicList!)
        for (const sub of miniSubstats) {
          miniScore += substatPotentialUnits(sub.stat, sub.value)
        }

        expect(miniScore).toBe(fullScore)
      }
    })
  })
})
