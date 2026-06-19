import { runLeaderboardPipeline } from 'scripts/leaderboard/pipeline/leaderboardPipeline'
import { printResolvedConfig } from 'scripts/leaderboard/pipeline/leaderboardReporting'
import {
  leaderboardCliUsage,
  readLeaderboardCliOptions,
} from 'scripts/leaderboard/shared/cliOptions'
import {
  isMainModule,
  setExitCode,
} from 'scripts/leaderboard/shared/nodeFacade'

export async function runLeaderboard(): Promise<void> {
  const options = readLeaderboardCliOptions()
  if (options.help) {
    console.log(leaderboardCliUsage())
    return
  }
  if (options.printConfig) {
    printResolvedConfig(options)
    return
  }

  const workerScriptUrl = new URL('./workers/profileWorkerThread.js', import.meta.url)
  await runLeaderboardPipeline(options, workerScriptUrl)
}

if (isMainModule(import.meta.url)) {
  runLeaderboard().catch((error) => {
    console.error(error)
    setExitCode(1)
  })
}
