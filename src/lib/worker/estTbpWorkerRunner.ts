import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
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

  console.log('EstTbpRunnerInput', displayRelics, weights)

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

function handleWork(relic: Relic, weights: Record<string, number>): Promise<EstTbpWorkerOutput> {
  if (!relic) return Promise.resolve({ days: -1 })

  return new Promise((resolve, reject) => {
    const worker = new EstTbpWorker()

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

    // Handle worker errors
    worker.onerror = (error) => {
      console.error('Worker error:', error)
      worker.terminate()
      reject(error)
    }

    // Send data to worker
    worker.postMessage(input)
  })
}
