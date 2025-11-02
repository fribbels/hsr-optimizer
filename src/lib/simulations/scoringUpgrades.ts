import {
  MainStatParts,
  Parts,
  Stats,
} from 'lib/constants/constants'
import {
  applyScoringFunction,
  ScoringParams,
  SimulationFlags,
} from 'lib/scoring/simScoringUtils'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import {
  RunStatSimulationsResult,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import { partsToFilterMapping } from 'lib/simulations/utils/benchmarkUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export type SimulationStatUpgrade = {
  simulation: Simulation,
  simulationResult: RunStatSimulationsResult,
  part?: string,
  stat?: string,
  percent?: number,
}

export function generateStatImprovements(
  originalSim: Simulation,
  benchmarkRequest: SimulationRequest,
  simulationForm: Form,
  context: OptimizerContext,
  metadata: SimulationMetadata,
  flags: SimulationFlags,
  scoringParams: ScoringParams,
  baselineSimScore: number,
  benchmarkSimScore: number,
  maximumSimScore: number,
) {
  // Upgrade substats
  const substatUpgradeResults: SimulationStatUpgrade[] = []
  for (const substatType of metadata.substats) {
    const stat: string = substatType
    const originalSimClone: Simulation = TsUtils.clone(originalSim)
    originalSimClone.request.stats[stat] = (originalSimClone.request.stats[stat] ?? 0) + 1.0

    const statImprovementResult = runStatSimulations([originalSimClone], simulationForm, context, {
      ...scoringParams,
      substatRollsModifier: (num: number) => num,
    })[0]

    applyScoringFunction(statImprovementResult, metadata, true, true)
    substatUpgradeResults.push({
      stat: stat,
      simulation: originalSimClone,
      simulationResult: statImprovementResult,
    })
  }

  // Upgrade set
  const setUpgradeResults: SimulationStatUpgrade[] = []
  const originalSimClone: Simulation = TsUtils.clone(originalSim)
  originalSimClone.request.simRelicSet1 = benchmarkRequest.simRelicSet1
  originalSimClone.request.simRelicSet2 = benchmarkRequest.simRelicSet2
  originalSimClone.request.simOrnamentSet = benchmarkRequest.simOrnamentSet

  const setUpgradeResult = runStatSimulations([originalSimClone], simulationForm, context, {
    ...scoringParams,
    substatRollsModifier: (num: number) => num,
  })[0]

  applyScoringFunction(setUpgradeResult, metadata, true, true)
  setUpgradeResults.push({
    simulation: originalSimClone,
    simulationResult: setUpgradeResult,
  })

  // Upgrade mains
  const mainUpgradeResults: SimulationStatUpgrade[] = []

  function upgradeMain(part: MainStatParts) {
    for (const upgradeMainStat of metadata.parts[part]) {
      const originalSimClone: Simulation = TsUtils.clone(originalSim)
      const simMainName = partsToFilterMapping[part]
      const simMainStat: string = originalSimClone.request[simMainName]
      if (flags.forceErrRope && simMainStat == Stats.ERR) continue
      if (upgradeMainStat == simMainStat) continue
      if (upgradeMainStat == Stats.SPD) continue
      if (simMainStat == Stats.SPD) continue

      originalSimClone.request[simMainName] = upgradeMainStat
      const mainUpgradeResult = runStatSimulations([originalSimClone], simulationForm, context, {
        ...scoringParams,
        substatRollsModifier: (num: number) => num,
      })[0]

      applyScoringFunction(mainUpgradeResult, metadata, true, true)
      const simulationStatUpgrade = {
        stat: upgradeMainStat,
        part: part,
        simulation: originalSimClone,
        simulationResult: mainUpgradeResult,
      }
      mainUpgradeResults.push(simulationStatUpgrade)
    }
  }

  upgradeMain(Parts.Body)
  upgradeMain(Parts.Feet)
  upgradeMain(Parts.PlanarSphere)
  upgradeMain(Parts.LinkRope)

  for (const upgrade of [...substatUpgradeResults, ...setUpgradeResults, ...mainUpgradeResults]) {
    const upgradeSimScore = upgrade.simulationResult.simScore
    const percent = upgradeSimScore >= benchmarkSimScore
      ? 1 + (upgradeSimScore - benchmarkSimScore) / (maximumSimScore - benchmarkSimScore)
      : (upgradeSimScore - baselineSimScore) / (benchmarkSimScore - baselineSimScore)
    upgrade.percent = percent
  }

  // Sort upgrades descending
  substatUpgradeResults.sort((a, b) => b.percent! - a.percent!)
  setUpgradeResults.sort((a, b) => b.percent! - a.percent!)
  mainUpgradeResults.sort((a, b) => b.percent! - a.percent!)

  return { substatUpgradeResults, setUpgradeResults, mainUpgradeResults }
}
