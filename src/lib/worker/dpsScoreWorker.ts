import { scoreCharacterSimulation } from 'lib/scoring/characterScorer'
import { DpsScoreWorkerInput } from 'lib/worker/dpsScoreWorkerRunner'

export function dpsScoreWorker(e: MessageEvent<DpsScoreWorkerInput>) {
  const input = e.data

  const simScoringResult = scoreCharacterSimulation(
    input.character,
    input.displayRelics,
    input.teamSelection,
    input.showcaseTemporaryOptions,
  )

  self.postMessage({
    simScoringResult,
  })
}
