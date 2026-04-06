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
) {
  if (!startTime) {
    return i18next.t('optimizerTab:Sidebar.ProgressText.Progress') // Progress
  }

  let endTime = Date.now()
  if (optimizerEndTime) {
    endTime = optimizerEndTime
  }

  const searched = optimizerRunningEngine === COMPUTE_ENGINE_CPU ? permutationsSearched : Math.max(permutationsSearched, 65536 * 512)

  const msDiff = endTime - startTime
  if (!optimizerEndTime && msDiff < 5_000 && permutationsSearched < 5_000_000 || !permutationsSearched) {
    return i18next.t('optimizerTab:Sidebar.ProgressText.CalculatingETA') // Progress  (calculating ETA..)
  }

  const msRemaining = Math.max(0, msDiff / permutationsSearched * (permutations - permutationsSearched))
  const perSecond = searched / (msDiff / 1000)
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
