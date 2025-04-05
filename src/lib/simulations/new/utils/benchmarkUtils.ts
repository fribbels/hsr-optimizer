import { Parts, Stats } from 'lib/constants/constants'
import { Simulation } from 'lib/simulations/statSimulationController'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'

export function isErrRopeForced(
  form: Form,
  metadata: SimulationMetadata,
  originalSim: Simulation,
) {
  return originalSim.request.simLinkRope == Stats.ERR && metadata.errRopeEidolon != null && form.characterEidolon >= metadata.errRopeEidolon
}

export const partsToFilterMapping = {
  [Parts.Body]: 'simBody',
  [Parts.Feet]: 'simFeet',
  [Parts.PlanarSphere]: 'simPlanarSphere',
  [Parts.LinkRope]: 'simLinkRope',
} as const
