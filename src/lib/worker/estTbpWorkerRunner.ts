import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { RelicRollGrader } from 'lib/relics/relicRollGrader'
import { hashRelic } from 'lib/relics/relicUtils'
import { objectHash } from 'lib/utils/objectUtils'
import {
  type BaseWorkerInput,
  WorkerCancelledError,
  workerPool,
} from 'lib/worker/workerPool'
import { WorkerType } from 'lib/worker/workerUtils'
import { type Relic } from 'types/relic'

export type EstTbpRunnerInput = {
  displayRelics: SingleRelicByPart,
  weights: Record<string, number>,
}

export type EstTbpRunnerOutput = {
  LinkRope: number,
  PlanarSphere: number,
  Feet: number,
  Body: number,
  Hands: number,
  Head: number,
}

export type EstTbpWorkerInput = {
  relic: Relic,
  weights: Record<string, number>,
  workerType: WorkerType.EST_TBP,
}

export type EstTbpWorkerOutput = {
  days: number,
}

export const estbpOutputCache = new Map<string, Promise<EstTbpWorkerOutput>>()

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

const errorResult = Promise.resolve({ days: 0 })

export function handleWork(relic: Relic, weights: Record<string, number>): Promise<EstTbpWorkerOutput> {
  if (!relic || relic.grade !== 5) return errorResult

  RelicRollGrader.calculateRelicSubstatRolls(relic)

  const runHash = hashRun(relic, weights)

  return estbpOutputCache.get(runHash) ?? estbpOutputCache.set(
    runHash,
    (() => {
      try {
        const input: EstTbpWorkerInput = {
          relic: relic,
          weights: weights,
          workerType: WorkerType.EST_TBP,
        }
        return workerPool.runTask<BaseWorkerInput, EstTbpWorkerOutput>(input)
      } catch (error) {
        if (error instanceof WorkerCancelledError) throw error
        console.warn('EstTbp worker error:', error)
        return errorResult
      }
    })(),
  ).get(runHash)!
}

function hashRun(relic: Relic, weights: Record<string, number>): string {
  return objectHash({ relic: hashRelic(relic), weights: objectHash(weights) })
}
