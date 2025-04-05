import { MainStatParts, Parts, Stats } from 'lib/constants/constants'
import { ScoringFunction, ScoringParams, SimulationResult } from 'lib/scoring/simScoringUtils'
import { isErrRopeForced, partsToFilterMapping } from 'lib/simulations/new/utils/benchmarkUtils'
import { runSimulations, Simulation } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export type SimulationStatUpgrade = {
  simulation: Simulation
  simulationResult: SimulationResult
  part?: string
  stat?: string
  percent?: number
}

export function generateStatImprovements(
  originalSimResult: SimulationResult,
  originalSim: Simulation,
  benchmark: Simulation,
  simulationForm: Form,
  context: OptimizerContext,
  metadata: SimulationMetadata,
  applyScoringFunction: ScoringFunction,
  scoringParams: ScoringParams,
  baselineSimScore: number,
  benchmarkSimScore: number,
  maximumSimScore: number,
) {
  const substatUpgradeResults: SimulationStatUpgrade[] = []
  for (const substatType of metadata.substats) {
    const stat: string = substatType
    const originalSimClone: Simulation = TsUtils.clone(originalSim)
    originalSimClone.request.stats[stat] = (originalSimClone.request.stats[stat] ?? 0) + 1.0

    const statImprovementResult = runSimulations(simulationForm, context, [originalSimClone], {
      ...scoringParams,
      substatRollsModifier: (num: number) => num,
    })[0]
    applyScoringFunction(statImprovementResult)
    substatUpgradeResults.push({
      stat: stat,
      simulation: originalSimClone,
      simulationResult: statImprovementResult,
    })
  }

  // Upgrade Set
  const setUpgradeResults: SimulationStatUpgrade[] = []
  const originalSimClone: Simulation = TsUtils.clone(originalSim)
  originalSimClone.request.simRelicSet1 = benchmark.request.simRelicSet1
  originalSimClone.request.simRelicSet2 = benchmark.request.simRelicSet2
  originalSimClone.request.simOrnamentSet = benchmark.request.simOrnamentSet

  const setUpgradeResult = runSimulations(simulationForm, context, [originalSimClone], {
    ...scoringParams,
    substatRollsModifier: (num: number) => num,
  })[0]
  applyScoringFunction(setUpgradeResult)
  setUpgradeResults.push({
    simulation: originalSimClone,
    simulationResult: setUpgradeResult,
  })

  // Upgrade mains
  const mainUpgradeResults: SimulationStatUpgrade[] = []

  const forceErrRope = isErrRopeForced(simulationForm, metadata, originalSim)

  function upgradeMain(part: MainStatParts) {
    for (const upgradeMainStat of metadata.parts[part]) {
      const originalSimClone: Simulation = TsUtils.clone(originalSim)
      const simMainName = partsToFilterMapping[part]
      const simMainStat: string = originalSimClone.request[simMainName]
      if (forceErrRope && simMainStat == Stats.ERR) continue
      if (upgradeMainStat == simMainStat) continue
      if (upgradeMainStat == Stats.SPD) continue
      if (simMainStat == Stats.SPD) continue

      originalSimClone.request[simMainName] = upgradeMainStat
      const mainUpgradeResult = runSimulations(simulationForm, context, [originalSimClone], {
        ...scoringParams,
        substatRollsModifier: (num: number) => num,
      })[0]
      applyScoringFunction(mainUpgradeResult)
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

  //
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

  // console.log('Stat improvements', mainUpgradeResults)

  return { substatUpgradeResults, setUpgradeResults, mainUpgradeResults }
}
