import { ElementToDamage, StatsValues, SubStats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff, ComputedStatsArray, ComputedStatsArrayCore } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { RelicFilters } from 'lib/relics/relicFilters'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { convertRelicsToSimulation, ornamentSetIndexToName, relicSetIndexToNames } from 'lib/simulations/statSimulationController'
import { Simulation, SimulationRelicByPart, SimulationRequest, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import { OptimizerForm } from 'types/form'

export type OptimizerResultAnalysis = {
  oldRowData: OptimizerDisplayData
  newRowData: OptimizerDisplayData
  oldRelics: SingleRelicByPart
  newRelics: SingleRelicByPart
  request: OptimizerForm
  oldX: ComputedStatsArray
  newX: ComputedStatsArray
  buffGroups: Record<BUFF_TYPE, Record<string, Buff[]>>
  elementalDmgValue: StatsValues
}

type StatUpgrade = {
  stat: SubStats
  simRequest: SimulationRequest
  x: ComputedStatsArray
}

export function calculateStatUpgrades(analysis: OptimizerResultAnalysis) {
  const { relicSetIndex, ornamentSetIndex } = analysis.newRowData

  const request = analysis.request
  const context = generateContext(request)

  const relicSets = relicSetIndexToNames(relicSetIndex)
  const ornamentSets = ornamentSetIndexToName(ornamentSetIndex)
  const simulationRequest = convertRelicsToSimulation(analysis.newRelics, relicSets[0], relicSets[1], ornamentSets) as SimulationRequest
  const statUpgrades: StatUpgrade[] = []

  for (const substat of SubStats) {
    const upgradeSim = TsUtils.clone(simulationRequest)
    upgradeSim.stats[substat] = (upgradeSim.stats[substat] ?? 0) + 1.0

    const simResult = runStatSimulations([{ request: upgradeSim, simType: StatSimTypes.SubstatRolls, key: substat } as Simulation], request, context)[0]
    statUpgrades.push({
      stat: substat,
      simRequest: upgradeSim,
      x: simResult.x,
    })
  }

  return statUpgrades
}

export function generateAnalysisData(currentRowData: OptimizerDisplayData, selectedRowData: OptimizerDisplayData, form: OptimizerForm): OptimizerResultAnalysis {
  const oldRelics = TsUtils.clone(OptimizerTabController.calculateRelicsFromId(currentRowData.id, form))
  const newRelics = TsUtils.clone(OptimizerTabController.calculateRelicsFromId(selectedRowData.id, form))
  const request = TsUtils.clone(form)

  RelicFilters.condenseSingleRelicByPartSubstatsForOptimizer(oldRelics)
  RelicFilters.condenseSingleRelicByPartSubstatsForOptimizer(newRelics)

  request.trace = true

  const contextOld = generateContext(request)
  const contextNew = generateContext(request)

  const oldX = simulateBuild(oldRelics as unknown as SimulationRelicByPart, contextOld, new BasicStatsArrayCore(true), new ComputedStatsArrayCore(true))
  const newX = simulateBuild(newRelics as unknown as SimulationRelicByPart, contextNew, new BasicStatsArrayCore(true), new ComputedStatsArrayCore(true))

  const buffGroups = aggregateCombatBuffs(newX, request)

  const characterMetadata = DB.getMetadata().characters[request.characterId]
  const elementalDmgValue = ElementToDamage[characterMetadata.element]

  return {
    oldRowData: currentRowData,
    newRowData: selectedRowData,
    oldRelics,
    newRelics,
    request,
    oldX,
    newX,
    buffGroups,
    elementalDmgValue,
  }
}

export function getPinnedRowData() {
  const currentPinned = window.optimizerGrid?.current?.api?.getGridOption('pinnedTopRowData') as OptimizerDisplayData[] ?? []
  return currentPinned && currentPinned.length ? currentPinned[0] : null
}

export function mismatchedCharacter(optimizerTabFocusCharacter?: CharacterId | null, form?: OptimizerForm) {
  return form?.characterId != optimizerTabFocusCharacter
}

export function getCachedForm() {
  return optimizerFormCache[window.store.getState().optimizationId!]
}
