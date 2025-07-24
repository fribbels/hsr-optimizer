import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { StatCalculator } from 'lib/relics/statCalculator'
import { PartialSimulationWrapper } from 'lib/scoring/simScoringUtils'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import {
  Simulation,
  SimulationRequest,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'

// Generate all main stat possibilities
export function generatePartialSimulations(
  orchestrator: BenchmarkSimulationOrchestrator,
) {
  const metadata = orchestrator.metadata
  const form = orchestrator.form!
  const simulationSets = orchestrator.simSets!

  const forceErrRope = orchestrator.flags.forceErrRope
  const ropeParts: string[] = forceErrRope ? [Stats.ERR] : metadata.parts[Parts.LinkRope]

  const { relicSet1, relicSet2, ornamentSet } = simulationSets

  const results: PartialSimulationWrapper[] = []

  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of metadata.parts[Parts.Feet]) {
      for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
        for (const linkRope of ropeParts) {
          const request: SimulationRequest = {
            simRelicSet1: relicSet1,
            simRelicSet2: relicSet2,
            simOrnamentSet: ornamentSet,
            simBody: body,
            simFeet: feet,
            simPlanarSphere: planarSphere,
            simLinkRope: linkRope,
            stats: StatCalculator.getZeroesSubstats(),
          }
          const simulation: Simulation = {
            simType: StatSimTypes.SubstatRolls,
            request: request,
          }
          const partialSimulationWrapper: PartialSimulationWrapper = {
            simulation: simulation,
            speedRollsDeduction: 0,
            effectiveSubstats: metadata.substats,
          }
          results.push(partialSimulationWrapper)
        }
      }
    }
  }

  return results
}
