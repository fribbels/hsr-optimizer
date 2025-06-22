import { Stats } from 'lib/constants/constants'
import {
  SimulationRequest,
  SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import { StatRegion } from 'lib/worker/maxima/types/substatOptimizationTypes'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

export type SimpleRegion = {
  upper: SubstatCounts,
  lower: SubstatCounts,
}

export function generateValidPointInRegion(
  request: SimulationRequest,
  region: SimpleRegion,
  start: SubstatCounts,
  validator: SubstatDistributionValidator,
): SubstatCounts | null {
  const lower = region.lower
  const upper = region.upper
  const mainStats = [
    Stats.HP,
    Stats.ATK,
    request.simBody,
    request.simFeet,
    request.simPlanarSphere,
    request.simLinkRope,
  ]

  return null
}
