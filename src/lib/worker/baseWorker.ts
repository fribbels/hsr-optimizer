import { estTbpWorker } from 'lib/worker/estTbpWorker'
import { optimizerWorker } from 'lib/worker/optimizerWorker'
import { WorkerType } from 'lib/worker/workerUtils'

self.onmessage = function (e: MessageEvent) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  switch (e.data.workerType) {
    case WorkerType.OPTIMIZER:
      optimizerWorker(e)
      break
    case WorkerType.EST_TBP:
      estTbpWorker(e)
      break
  }
}
