import { runLeaderboardPipeline } from './pipeline/leaderboardPipeline'
import { printResolvedConfig } from './pipeline/leaderboardReporting'
import {
  leaderboardCliUsage,
  readLeaderboardCliOptions,
} from './shared/cliOptions'
import {
  isMainModule,
  setExitCode,
} from './shared/nodeFacade'

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
