import { RelicBuild, SimulationScore } from 'lib/scoring/simScoringUtils'
import DpsScoreWorker from 'lib/worker/baseWorker.ts?worker&inline'
import { WorkerType } from 'lib/worker/workerUtils'
import { Character } from 'types/character'
import { ScoringMetadata, ShowcaseTemporaryOptions } from 'types/metadata'

export type DpsScoreRunnerInput = {
  character: Character
  displayRelics: RelicBuild
  teamSelection: string
  showcaseTemporaryOptions: ShowcaseTemporaryOptions
  defaultScoringMetadata: ScoringMetadata
  customScoringMetadata: ScoringMetadata
}

export type DpsScoreRunnerOutput = {
  simScoringResult: SimulationScore | null
}

export type DpsScoreWorkerInput = {
  character: Character
  displayRelics: RelicBuild
  teamSelection: string
  showcaseTemporaryOptions: ShowcaseTemporaryOptions
  defaultScoringMetadata: ScoringMetadata
  customScoringMetadata: ScoringMetadata
  workerType: WorkerType
}

export type DpsScoreWorkerOutput = {
  simScoringResult: SimulationScore | null
}

export async function runDpsScoreWorker(
  input: DpsScoreRunnerInput,
  callback: (output: DpsScoreRunnerOutput) => void,
) {
  const promises: Promise<DpsScoreWorkerOutput>[] = [
    handleWork(input),
  ]

  const results = await Promise.all(promises)
  const output: DpsScoreRunnerOutput = {
    simScoringResult: results[0].simScoringResult,
  }

  callback(output)
}

const errorResult = { simScoringResult: null }

function handleWork(runnerInput: DpsScoreRunnerInput): Promise<DpsScoreWorkerOutput> {
  if (!runnerInput) return Promise.resolve(errorResult)

  return new Promise((resolve, reject) => {
    const worker = new DpsScoreWorker()

    const input: DpsScoreWorkerInput = {
      ...runnerInput,
      workerType: WorkerType.DPS_SCORE,
    }

    worker.onmessage = (e) => {
      const result = e.data as DpsScoreWorkerOutput
      worker.terminate()
      resolve(result)
    }

    worker.onerror = (error) => {
      console.error('Worker error:', error)
      worker.terminate()
      resolve(errorResult)
    }

    worker.postMessage(input)
  })
}
