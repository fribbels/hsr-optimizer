import { OptimizationRequest } from '../optimizationRequest'

export function serialize(request: OptimizationRequest) {
  return JSON.stringify(request)
}
