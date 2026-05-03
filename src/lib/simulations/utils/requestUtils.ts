import type {
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'

export function blankSimRequest(): SimulationRequest {
  return {
    simBody: '',
    simFeet: '',
    simPlanarSphere: '',
    simLinkRope: '',
    simRelicSet1: '' as SetsRelics,
    simRelicSet2: '' as SetsRelics,
    simOrnamentSet: '' as SetsOrnaments,
    stats: {},
  }
}
