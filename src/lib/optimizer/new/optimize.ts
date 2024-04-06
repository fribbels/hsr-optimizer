import { noWorker } from './opt/noWorker'
import { useWorker } from './opt/useWorker'
import { OptimizationOptions, OptimizationRequest } from './request'
import { OptimizationResult } from './result'

export async function optimize(
  request: OptimizationRequest,
  options: OptimizationOptions = {},
): Promise<OptimizationResult> {
  const numberOfBuilds = Math.floor(options.build?.size ?? 10)
  const updateProgress = options.updateProgress

  if (options.worker) {
    const numWorkers = options.worker.size ?? navigator.hardwareConcurrency
    return useWorker(request, { numWorkers, numberOfBuilds, updateProgress })
  }

  return noWorker(request, { numberOfBuilds, updateProgress })
}
