import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'

export function blankSimRequest(): SimulationRequest {
  return {
    simBody: Stats.CR,
    simFeet: Stats.ATK_P,
    simPlanarSphere: Stats.Wind_DMG,
    simLinkRope: Stats.ERR,
    simOrnamentSet: Sets.SprightlyVonwacq,
    simRelicSet1: Sets.EagleOfTwilightLine,
    simRelicSet2: Sets.EagleOfTwilightLine,
    stats: {},
  }
}
