// TODO: why is this function used twice
import { Parts } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { calculateSetNames, SimulationSets } from 'lib/scoring/dpsScore'
import { RelicBuild, ScoringParams, SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import { convertRelicsToSimulation, runSimulations, Simulation } from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

export function simulateOriginalBuild(
  displayRelics: RelicBuild,
  simulationSets: SimulationSets,
  simulationForm: Form,
  context: OptimizerContext,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
  mainStatMultiplier = 1,
  overwriteSets = false,
): { originalSimResult: SimulationResult; originalSim: Simulation } {
  const relicsByPart = TsUtils.clone(displayRelics) as SingleRelicByPart
  Object.values(Parts).forEach((part) => relicsByPart[part].part = part)

  const { relicSetNames, ornamentSetName } = calculateSetNames(relicsByPart)

  const originalSimRequest = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, scoringParams.quality, scoringParams.speedRollValue)

  if (overwriteSets) {
    const { relicSet1, relicSet2, ornamentSet } = simulationSets

    originalSimRequest.simRelicSet1 = relicSet1
    originalSimRequest.simRelicSet2 = relicSet2
    originalSimRequest.simOrnamentSet = ornamentSet
  }

  // @ts-ignore
  const originalSim: Simulation = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: originalSimRequest,
  } as Simulation

  const originalSimResult = runSimulations(simulationForm, context, [originalSim], {
    ...scoringParams,
    substatRollsModifier: (rolls: number) => rolls,
    mainStatMultiplier: mainStatMultiplier,
    simulationFlags: simulationFlags,
  })[0]

  originalSim.result = originalSimResult
  return {
    originalSimResult,
    originalSim,
  }
}
