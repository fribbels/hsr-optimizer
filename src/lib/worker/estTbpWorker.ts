import { scoreTbp } from 'lib/relics/estTbp/estTbp'
import type { EstTbpWorkerInput } from 'lib/worker/estTbpWorkerRunner'

export function estTbpWorker(e: MessageEvent<EstTbpWorkerInput>) {
  const { relic, weights } = e.data

  const days = scoreTbp(relic, weights)

  self.postMessage({
    days,
  })
}
