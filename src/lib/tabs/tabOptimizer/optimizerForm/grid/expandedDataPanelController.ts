import { Stats, SubStats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { originalScoringParams } from 'lib/scoring/simScoringUtils'
import {
  convertRelicsToSimulation,
  defaultSimulationParams,
  ornamentSetIndexToName,
  relicSetIndexToNames,
  runSimulations,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { TsUtils } from 'lib/utils/TsUtils'

export function updateExpandedDataPanel() {
  // let selectedRow: OptimizerDisplayDataStatSim | undefined = window.optimizerGrid.current?.api.getSelectedRows()[0]
  // // default to equipped build if no selected row
  // if (!selectedRow) selectedRow = (window.optimizerGrid.current?.api.getPinnedTopRow(0) as IRowNode<OptimizerDisplayDataStatSim> | undefined)?.data
  // if (selectedRow) {
  //   const build = OptimizerTabController.calculateRelicIdsFromId(selectedRow.id)
  //   window.store.getState().setOptimizerBuild(build)
  //   window.store.getState().setOptimizerSelectedRowData(selectedRow)
  //   handleOptimizerExpandedRowData(build)
  // }
}

export function calculateStatUpgrades(id: number, ornamentIndex: number, relicIndex: number) {
  // pull from cache instead of current form as the form may change since last optimizer run, and we want to match optimizer run's conditionals
  const optimizationID = window.store.getState().optimizationId!
  const form = optimizerFormCache[optimizationID]
  const context = generateContext(form)

  const simulations: Simulation[] = []
  const relics = OptimizerTabController.calculateRelicsFromId(id)
  if (Object.values(relics).length !== 6) return []
  const relicSets = relicSetIndexToNames(relicIndex)
  const ornamentSets = ornamentSetIndexToName(ornamentIndex)
  const simulation = convertRelicsToSimulation(relics as SingleRelicByPart, relicSets[0], relicSets[1], ornamentSets)

  for (const substat of SubStats) {
    const upgradeSim = TsUtils.clone(simulation)
    if (upgradeSim.stats[substat]) {
      upgradeSim.stats[substat] += substat === Stats.SPD
        ? originalScoringParams.speedRollValue / defaultSimulationParams.speedRollValue
        : originalScoringParams.quality
    } else { // we divide the additional speed so that it gets properly converted to a stat total during the sim
      upgradeSim.stats[substat] = substat === Stats.SPD
        ? originalScoringParams.speedRollValue / defaultSimulationParams.speedRollValue
        : originalScoringParams.quality
    }
    simulations.push({ request: upgradeSim as SimulationRequest, simType: StatSimTypes.SubstatRolls, key: substat } as Simulation)
  }

  return runSimulations(
    form,
    context,
    simulations,
  )
}
