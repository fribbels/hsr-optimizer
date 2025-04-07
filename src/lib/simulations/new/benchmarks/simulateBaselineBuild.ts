import { Parts, Stats, SubStats } from 'lib/constants/constants'
import { emptyRelicWithSetAndSubstats } from 'lib/optimization/calculateBuild'
import { StatCalculator } from 'lib/relics/statCalculator'
import { SimulationSets } from 'lib/scoring/dpsScore'
import { benchmarkScoringParams, RelicBuild, ScoringParams, SimulationFlags } from 'lib/scoring/simScoringUtils'
import { simulateOriginalBuild } from 'lib/simulations/new/benchmarks/simulateOriginalBuild'
import { generateSimRelics } from 'lib/simulations/new/statSimulation'
import { SimulationState } from 'lib/simulations/new/utils/simulationState'
import { SimulationRequest } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'
import { Relic } from 'types/relic'

export function simulateBaselineBuild(
  displayRelics: RelicBuild,
  simulationForm: Form,
  context: OptimizerContext,
  simulationSets: SimulationSets,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
) {
  const relicsByPart: RelicBuild = TsUtils.clone(displayRelics)
  Object.values(Parts).forEach((part) => relicsByPart[part] = relicsByPart[part] || emptyRelicWithSetAndSubstats())
  Object.values(Parts).forEach((part) => relicsByPart[part].part = part)
  Object.values(relicsByPart).map((relic: Relic) => {
    // Remove all subs
    relic.substats = []
    if (relic.part == Parts.Head) {
      for (const substat of SubStats) {
        if (substat == Stats.SPD) continue

        relic.substats.push({
          stat: substat,
          // No substats for baseline
          value: StatCalculator.getMaxedSubstatValue(substat, scoringParams.quality) * 0,
        })
      }
    }
  })

  const {
    originalSimResult,
    originalSim,
  } = simulateOriginalBuild(relicsByPart, simulationSets, simulationForm, context, scoringParams, simulationFlags, 0, true)
  return {
    baselineSimResult: originalSimResult,
    baselineSim: originalSim,
  }
}

export function simulateBaselineBuildWithState(
  simulationState: SimulationState,
  //
  simulationForm: Form,
  context: OptimizerContext,
  simulationSets: SimulationSets,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
) {
  const baselineRequest: SimulationRequest = {}
  generateSimRelics(baselineRequest, simulationState, benchmarkScoringParams)

  Object.values(Parts).forEach((part) => relicsByPart[part] = relicsByPart[part] || emptyRelicWithSetAndSubstats())
  Object.values(Parts).forEach((part) => relicsByPart[part].part = part)
  Object.values(relicsByPart).map((relic: Relic) => {
    // Remove all subs
    relic.substats = []
    if (relic.part == Parts.Head) {
      for (const substat of SubStats) {
        if (substat == Stats.SPD) continue

        relic.substats.push({
          stat: substat,
          // No substats for baseline
          value: StatCalculator.getMaxedSubstatValue(substat, scoringParams.quality) * 0,
        })
      }
    }
  })

  const {
    originalSimResult,
    originalSim,
  } = simulateOriginalBuild(relicsByPart, simulationSets, simulationForm, context, scoringParams, simulationFlags, 0, true)
  return {
    baselineSimResult: originalSimResult,
    baselineSim: originalSim,
  }
}
