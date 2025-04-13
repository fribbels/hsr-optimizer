import { Parts, Stats } from 'lib/constants/constants'
import { PartialSimulationWrapper } from 'lib/scoring/simScoringUtils'
import { DpsScoreBenchmarkOrchestrator } from 'lib/simulations/new/orchestrator/DpsScoreBenchmarkOrchestrator'
import { Simulation, StatSimTypes } from 'lib/simulations/new/statSimulation'
import { isErrRopeForced } from 'lib/simulations/new/utils/benchmarkUtils'
import { SimulationRequest } from 'lib/simulations/statSimulationController'

// Generate all main stat possibilities
export function generatePartialSimulations(
  orchestrator: DpsScoreBenchmarkOrchestrator,
) {
  const metadata = orchestrator.metadata
  const form = orchestrator.form!
  const originalSim = orchestrator.originalSimRequest!
  const simulationSets = orchestrator.simSets!

  const forceSpdBoots = false
  const feetParts: string[] = forceSpdBoots ? [Stats.SPD] : metadata.parts[Parts.Feet]

  const forceErrRope = isErrRopeForced(form, metadata, originalSim)
  const ropeParts: string[] = forceErrRope ? [Stats.ERR] : metadata.parts[Parts.LinkRope]

  const { relicSet1, relicSet2, ornamentSet } = simulationSets

  const results: PartialSimulationWrapper[] = []
  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of feetParts) {
      for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
        for (const linkRope of ropeParts) {
          const request: SimulationRequest = {
            name: '',
            simRelicSet1: relicSet1,
            simRelicSet2: relicSet2,
            simOrnamentSet: ornamentSet,
            simBody: body,
            simFeet: feet,
            simPlanarSphere: planarSphere,
            simLinkRope: linkRope,
            stats: {
              [Stats.HP_P]: 0,
              [Stats.ATK_P]: 0,
              [Stats.DEF_P]: 0,
              [Stats.HP]: 0,
              [Stats.ATK]: 0,
              [Stats.DEF]: 0,
              [Stats.SPD]: 0,
              [Stats.CR]: 0,
              [Stats.CD]: 0,
              [Stats.EHR]: 0,
              [Stats.RES]: 0,
              [Stats.BE]: 0,
            },
          }
          const simulation: Simulation = {
            name: '',
            key: '',
            simType: StatSimTypes.SubstatRolls,
            request: request,
          }
          const partialSimulationWrapper: PartialSimulationWrapper = {
            simulation: simulation,
            finalSpeed: 0,
            speedRollsDeduction: 0,
          }
          results.push(partialSimulationWrapper)
        }
      }
    }
  }

  return results
}
