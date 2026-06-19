import {
  commandLineArgs,
  homeDir,
  resolvePath,
} from 'scripts/leaderboard/shared/nodeFacade'

const FLAG_EXPORT_PATH = '--export-path'
const FLAG_PRIVATE_OUTPUT_PATH = '--private-output-path'
const FLAG_PUBLIC_OUTPUT_PATH = '--public-output-path'
const FLAG_TOP_N = '--top-n'
const FLAG_TOP_N_PUBLIC = '--top-n-public'
const FLAG_WORKER_THREADS = '--worker-threads'
const FLAG_BUILD_SCORE_CACHE_DB_PATH = '--build-score-cache-db-path'
const FLAG_PRUNE_BUILD_SCORE_CACHE = '--prune-build-score-cache'
const FLAG_FRESH_RUN = '--fresh-run'
const FLAG_PRINT_CONFIG = '--print-config'
const FLAG_HELP = '--help'

export type LeaderboardCliOptions = Readonly<{
  exportPath?: string,
  privateOutputPath: string,
  publicOutputPath: string,
  topN: number,
  topNPublic: number,
  workerThreads: number,
  buildScoreCacheDbPath: string,
  pruneBuildScoreCache: boolean,
  freshRun: boolean,
  printConfig: boolean,
  help: boolean,
}>

export class LeaderboardCliOptionsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LeaderboardCliOptionsError'
  }
}

type MutableLeaderboardCliOptions = {
  exportPath?: string,
  privateOutputPath: string,
  publicOutputPath: string,
  topN: number,
  topNPublic: number,
  workerThreads: number,
  buildScoreCacheDbPath: string,
  pruneBuildScoreCache: boolean,
  freshRun: boolean,
  printConfig: boolean,
  help: boolean,
}

function defaultLeaderboardCliOptions(): MutableLeaderboardCliOptions {
  return {
    privateOutputPath: resolvePath(homeDir(), 'leaderboard-cache/private-ranked-output.json'),
    publicOutputPath: './public/leaderboard/leaderboard.json',
    topN: 100,
    topNPublic: 100,
    workerThreads: 12,
    buildScoreCacheDbPath: resolvePath(homeDir(), 'leaderboard-cache/leaderboard-build-score-cache.sqlite'),
    pruneBuildScoreCache: false,
    freshRun: false,
    printConfig: false,
    help: false,
  }
}

export function parseLeaderboardCliOptions(args: readonly string[]): LeaderboardCliOptions {
  const options = defaultLeaderboardCliOptions()

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case FLAG_EXPORT_PATH:
        options.exportPath = readOptionValue(args, i)
        i++
        break
      case FLAG_PRIVATE_OUTPUT_PATH:
        options.privateOutputPath = readOptionValue(args, i)
        i++
        break
      case FLAG_PUBLIC_OUTPUT_PATH:
        options.publicOutputPath = readOptionValue(args, i)
        i++
        break
      case FLAG_TOP_N:
        options.topN = parsePositiveInteger(readOptionValue(args, i), FLAG_TOP_N)
        i++
        break
      case FLAG_TOP_N_PUBLIC:
        options.topNPublic = parsePositiveInteger(readOptionValue(args, i), FLAG_TOP_N_PUBLIC)
        i++
        break
      case FLAG_WORKER_THREADS:
        options.workerThreads = parsePositiveInteger(readOptionValue(args, i), FLAG_WORKER_THREADS)
        i++
        break
      case FLAG_BUILD_SCORE_CACHE_DB_PATH:
        options.buildScoreCacheDbPath = readOptionValue(args, i)
        i++
        break
      case FLAG_PRUNE_BUILD_SCORE_CACHE:
        options.pruneBuildScoreCache = true
        break
      case FLAG_FRESH_RUN:
        options.freshRun = true
        break
      case FLAG_PRINT_CONFIG:
        options.printConfig = true
        break
      case FLAG_HELP:
        options.help = true
        break
      default:
        throw new LeaderboardCliOptionsError(`Unknown leaderboard option: ${arg}`)
    }
  }

  if (options.freshRun && options.pruneBuildScoreCache) {
    throw new LeaderboardCliOptionsError(
      `${FLAG_FRESH_RUN} and ${FLAG_PRUNE_BUILD_SCORE_CACHE} cannot be used together`,
    )
  }

  options.topNPublic = Math.min(options.topNPublic, options.topN)
  return Object.freeze({ ...options })
}

export function readLeaderboardCliOptions(): LeaderboardCliOptions {
  return parseLeaderboardCliOptions(commandLineArgs())
}

export function leaderboardCliUsage(command = 'npm run leaderboard --'): string {
  return [
    `Usage: ${command} [options]`,
    '',
    'Options:',
    `  ${FLAG_EXPORT_PATH} <path>`,
    `  ${FLAG_PRIVATE_OUTPUT_PATH} <path>`,
    `  ${FLAG_PUBLIC_OUTPUT_PATH} <path>`,
    `  ${FLAG_TOP_N} <n>`,
    `  ${FLAG_TOP_N_PUBLIC} <n>`,
    `  ${FLAG_WORKER_THREADS} <n>`,
    `  ${FLAG_BUILD_SCORE_CACHE_DB_PATH} <path>`,
    `  ${FLAG_PRUNE_BUILD_SCORE_CACHE}`,
    `  ${FLAG_FRESH_RUN}`,
    `  ${FLAG_PRINT_CONFIG}`,
    `  ${FLAG_HELP}`,
  ].join('\n')
}

function readOptionValue(args: readonly string[], optionIndex: number): string {
  const option = args[optionIndex]
  const value = args[optionIndex + 1]

  if (!value || value.startsWith('--')) {
    throw new LeaderboardCliOptionsError(`Missing value for leaderboard option: ${option}`)
  }

  return value
}

function parsePositiveInteger(value: string, option: string): number {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new LeaderboardCliOptionsError(`Invalid positive integer for ${option}: ${value}`)
  }

  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) {
    throw new LeaderboardCliOptionsError(`Invalid safe positive integer for ${option}: ${value}`)
  }

  return parsed
}
