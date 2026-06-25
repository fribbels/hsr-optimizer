import {
  LeaderboardCliOptionsError,
  leaderboardCliUsage,
  parseLeaderboardCliOptions,
} from 'leaderboard/shared/cliOptions'
import {
  homeDir,
  resolvePath,
} from 'leaderboard/shared/nodeFacade'
import {
  describe,
  expect,
  test,
} from 'vitest'

describe('leaderboard CLI options', () => {
  test('resolves defaults', () => {
    const options = parseLeaderboardCliOptions([])

    expect(options).toEqual({
      privateOutputPath: resolvePath(homeDir(), 'leaderboard-cache/private-ranked-output'),
      publicOutputPath: './public/leaderboard/leaderboard.json',
      topN: 100,
      topNPublic: 100,
      workerThreads: 12,
      buildScoreCacheDbPath: resolvePath(homeDir(), 'leaderboard-cache/leaderboard-build-score-cache.sqlite'),
      pruneBuildScoreCache: false,
      freshRun: false,
      printConfig: false,
      help: false,
      skipChangelog: false,
    })
  })

  test('parses valid path, count, and boolean flags', () => {
    const options = parseLeaderboardCliOptions([
      '--export-path',
      './exports/export.json.gz',
      '--private-output-path',
      './scratch/private.json',
      '--public-output-path',
      './scratch/public.json',
      '--top-n',
      '25',
      '--top-n-public',
      '10',
      '--worker-threads',
      '8',
      '--build-score-cache-db-path',
      './scratch/cache.sqlite',
      '--prune-build-score-cache',
      '--print-config',
      '--help',
      '--skip-changelog',
    ])

    expect(options).toMatchObject({
      exportPath: './exports/export.json.gz',
      privateOutputPath: './scratch/private.json',
      publicOutputPath: './scratch/public.json',
      topN: 25,
      topNPublic: 10,
      workerThreads: 8,
      buildScoreCacheDbPath: './scratch/cache.sqlite',
      pruneBuildScoreCache: true,
      freshRun: false,
      printConfig: true,
      help: true,
      skipChangelog: true,
    })
  })

  test('caps public top n at top n', () => {
    expect(
      parseLeaderboardCliOptions([
        '--top-n',
        '10',
        '--top-n-public',
        '50',
      ]).topNPublic,
    ).toBe(10)

    expect(
      parseLeaderboardCliOptions([
        '--top-n',
        '7',
      ]).topNPublic,
    ).toBe(7)
  })

  test('rejects unknown options', () => {
    expect(() => parseLeaderboardCliOptions(['--unknown'])).toThrow(LeaderboardCliOptionsError)
    expect(() => parseLeaderboardCliOptions(['input.json.gz'])).toThrow('Unknown leaderboard option')
  })

  test('rejects missing option values', () => {
    expect(() => parseLeaderboardCliOptions(['--export-path'])).toThrow('Missing value')
    expect(() => parseLeaderboardCliOptions(['--worker-threads'])).toThrow('Missing value')
  })

  test('parses positive integers and rejects invalid integers', () => {
    expect(parseLeaderboardCliOptions([
      '--top-n',
      '2',
      '--top-n-public',
      '3',
      '--worker-threads',
      '4',
    ])).toMatchObject({
      topN: 2,
      topNPublic: 2,
      workerThreads: 4,
    })

    expect(() => parseLeaderboardCliOptions(['--worker-threads', '0'])).toThrow('Invalid positive integer')
    expect(() => parseLeaderboardCliOptions(['--top-n', '-1'])).toThrow('Invalid positive integer')
    expect(() => parseLeaderboardCliOptions(['--top-n-public', 'abc'])).toThrow('Invalid positive integer')
    expect(() => parseLeaderboardCliOptions(['--worker-threads', String(Number.MAX_SAFE_INTEGER + 1)])).toThrow('Invalid safe positive integer')
  })

  test('rejects fresh run with prune cache', () => {
    expect(() =>
      parseLeaderboardCliOptions([
        '--fresh-run',
        '--prune-build-score-cache',
      ])
    ).toThrow('--fresh-run and --prune-build-score-cache cannot be used together')
  })

  test('exports usage text for help output', () => {
    expect(leaderboardCliUsage()).toContain('--worker-threads <n>')
    expect(leaderboardCliUsage()).toContain('--fresh-run')
    expect(leaderboardCliUsage()).toContain('--skip-changelog')
  })
})
