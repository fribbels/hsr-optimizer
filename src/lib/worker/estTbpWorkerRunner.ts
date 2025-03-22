import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { RelicRollGrader } from 'lib/relics/relicRollGrader'
import EstTbpWorker from 'lib/worker/baseWorker.ts?worker&inline'
import { WorkerType } from 'lib/worker/workerUtils'
import { Relic } from 'types/relic'

export type EstTbpRunnerInput = {
  displayRelics: SingleRelicByPart
  weights: Record<string, number>
}

export type EstTbpRunnerOutput = {
  LinkRope: number
  PlanarSphere: number
  Feet: number
  Body: number
  Hands: number
  Head: number
}

export type EstTbpWorkerInput = {
  relic: Relic
  weights: Record<string, number>
  workerType: WorkerType
}

export type EstTbpWorkerOutput = {
  days: number
}

export async function runEstTbpWorker(
  input: EstTbpRunnerInput,
  callback: (output: EstTbpRunnerOutput) => void,
) {
  const { displayRelics, weights } = input

  const promises = [
    handleWork(displayRelics.Head, weights),
    handleWork(displayRelics.Hands, weights),
    handleWork(displayRelics.Body, weights),
    handleWork(displayRelics.Feet, weights),
    handleWork(displayRelics.PlanarSphere, weights),
    handleWork(displayRelics.LinkRope, weights),
  ]

  const results = await Promise.all(promises)
  const output: EstTbpRunnerOutput = {
    Head: results[0].days,
    Hands: results[1].days,
    Body: results[2].days,
    Feet: results[3].days,
    PlanarSphere: results[4].days,
    LinkRope: results[5].days,
  }

  callback(output)
}

const errorResult = { days: 0 }

function handleWork(relic: Relic, weights: Record<string, number>): Promise<EstTbpWorkerOutput> {
  if (!relic) return Promise.resolve(errorResult)

  return new Promise((resolve, reject) => {
    if (relic.grade != 5) {
      return resolve(errorResult)
    }

    const worker = new EstTbpWorker()

    RelicRollGrader.calculateRelicSubstatRolls(relic)
    const input: EstTbpWorkerInput = {
      relic: relic,
      weights: weights,
      workerType: WorkerType.EST_TBP,
    }

    worker.onmessage = (e) => {
      const result = e.data as EstTbpWorkerOutput
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
