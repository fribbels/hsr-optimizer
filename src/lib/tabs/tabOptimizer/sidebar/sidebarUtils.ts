import i18next from 'i18next'
import {
  COMPUTE_ENGINE_CPU,
  type ComputeEngine,
} from 'lib/constants/constants'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import { msToReadable } from 'lib/utils/miscUtils'

export function calculateProgressText(
  startTime: number | null,
  optimizerEndTime: number | null,
  permutations: number,
  permutationsSearched: number,
  optimizationInProgress: boolean,
  optimizerRunningEngine: ComputeEngine,
  optimizerProgress: number = 0,
) {
  if (!startTime) {
    return i18next.t('optimizerTab:Sidebar.ProgressText.Progress') // Progress
  }

  let endTime = Date.now()
  if (optimizerEndTime) {
    endTime = optimizerEndTime
  }

  const msDiff = endTime - startTime
  if (!optimizerEndTime && msDiff < 5_000 && optimizerProgress < 0.05 || !permutationsSearched) {
    return i18next.t('optimizerTab:Sidebar.ProgressText.CalculatingETA') // Progress  (calculating ETA..)
  }

  // ETA based on dispatch progress (wall-clock proportional) rather than valid-perm progress
  const msRemaining = optimizerProgress > 0
    ? Math.max(0, msDiff / optimizerProgress * (1 - optimizerProgress))
    : 0
  const perSecond = permutationsSearched / (msDiff / 1000)
  return optimizationInProgress
    ? i18next.t('optimizerTab:Sidebar.ProgressText.TimeRemaining', {
      // {{rate}} / sec — ${{timeRemaining}} left
      rate: localeNumberComma(Math.floor(perSecond)),
      timeRemaining: msToReadable(msRemaining),
    })
    : i18next.t('optimizerTab:Sidebar.ProgressText.Finished', {
      // {{rate}} / sec — Finished
      rate: localeNumberComma(Math.floor(perSecond)),
    })
}
