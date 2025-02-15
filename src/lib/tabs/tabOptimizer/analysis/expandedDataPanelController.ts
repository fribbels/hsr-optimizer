import { Stats, SubStats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import { Buff, ComputedStatsArray, ComputedStatsArrayCore } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { RelicFilters } from 'lib/relics/relicFilters'
import { originalScoringParams } from 'lib/scoring/simScoringUtils'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
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
import { OptimizerForm } from 'types/form'

export type OptimizerResultAnalysis = {
  oldRelics: SingleRelicByPart
  newRelics: SingleRelicByPart
  request: OptimizerForm
  oldX: ComputedStatsArray
  newX: ComputedStatsArray
  buffGroups: Record<BUFF_TYPE, Record<string, Buff[]>>
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

export function generateAnalysisData(currentRowData: OptimizerDisplayData, selectedRowData: OptimizerDisplayData, form: OptimizerForm): OptimizerResultAnalysis {
  const oldRelics = TsUtils.clone(OptimizerTabController.calculateRelicsFromId(currentRowData.id) as SingleRelicByPart)
  const newRelics = TsUtils.clone(OptimizerTabController.calculateRelicsFromId(selectedRowData.id) as SingleRelicByPart)
  const request = TsUtils.clone(form)

  RelicFilters.condenseSingleRelicByPartSubstatsForOptimizer(oldRelics)
  RelicFilters.condenseSingleRelicByPartSubstatsForOptimizer(newRelics)

  request.trace = true

  const oldX = calculateBuild(request, oldRelics, null, new BasicStatsArrayCore(true), new ComputedStatsArrayCore(true))
  const newX = calculateBuild(request, newRelics, null, new BasicStatsArrayCore(true), new ComputedStatsArrayCore(true))

  const buffGroups = aggregateCombatBuffs(newX, request)

  return {
    oldRelics,
    newRelics,
    request,
    oldX,
    newX,
    buffGroups,
  }
}

export function getPinnedRowData() {
  const currentPinned = window.optimizerGrid.current?.api.getGridOption('pinnedTopRowData') as OptimizerDisplayData[] ?? []
  return currentPinned && currentPinned.length ? currentPinned[0] : null
}

export function mismatchedCharacter(optimizerTabFocusCharacter?: string, form?: OptimizerForm) {
  return form?.characterId !== optimizerTabFocusCharacter
}

export function getCachedForm() {
  return optimizerFormCache[window.store.getState().optimizationId!]
}
