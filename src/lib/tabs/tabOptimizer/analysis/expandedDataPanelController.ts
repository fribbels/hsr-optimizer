import {
  ElementToDamage,
  PathNames,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import type { StatsValues } from 'lib/constants/constants'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import type { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { RelicFilters } from 'lib/relics/relicFilters'
import { aggregatePerActionBuffs } from 'lib/simulations/combatBuffsAnalysis'
import type { PerActionBuffGroups } from 'lib/simulations/combatBuffsAnalysis'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import type {
  Simulation,
  SimulationRelicByPart,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import {
  convertRelicsToSimulation,
  ornamentSetIndexToName,
  relicSetIndexToNames,
} from 'lib/simulations/statSimulationUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { gridStore } from 'lib/stores/gridStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { clone } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { OptimizerForm } from 'types/form'
import type { OptimizerContext } from 'types/optimizer'

export type OptimizerResultAnalysis = {
  oldRowData: OptimizerDisplayData,
  newRowData: OptimizerDisplayData,
  oldRelics: Partial<SingleRelicByPart>,
  newRelics: Partial<SingleRelicByPart>,
  request: OptimizerForm,
  oldX: ComputedStatsContainer,
  newX: ComputedStatsContainer,
  perActionBuffGroups: PerActionBuffGroups,
  context: OptimizerContext,
  elementalDmgValue: StatsValues,
  extraRows: StatsValues[],
}

type StatUpgrade = {
  stat: SubStats,
  simRequest: SimulationRequest,
  x: ComputedStatsContainer,
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
    const upgradeSim = clone(simulationRequest)
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

export function generateAnalysisData(
  currentRowData: OptimizerDisplayData,
  selectedRowData: OptimizerDisplayData,
  form: OptimizerForm,
): OptimizerResultAnalysis | null {
  const oldRelics = clone(OptimizerTabController.calculateRelicsFromId(currentRowData.id, form))
  const newRelics = clone(OptimizerTabController.calculateRelicsFromId(selectedRowData.id, form))
  const request = clone(form)

  RelicFilters.condenseSingleRelicByPartSubstatsForOptimizer(oldRelics)
  RelicFilters.condenseSingleRelicByPartSubstatsForOptimizer(newRelics)

  request.trace = true

  const contextOld = generateContext(request)
  const contextNew = generateContext(request)

  if (!contextOld.defaultActions?.length || !contextNew.defaultActions?.length) {
    return null
  }

  const { x: oldX } = simulateBuild(oldRelics as unknown as SimulationRelicByPart, contextOld, null)
  const { x: newX, actionBuffSnapshots, rotationBuffSteps } = simulateBuild(
    newRelics as unknown as SimulationRelicByPart,
    contextNew,
    new BasicStatsArrayCore(true),
    null,
    true,
  )

  const perActionBuffGroups = actionBuffSnapshots
    ? aggregatePerActionBuffs(actionBuffSnapshots, rotationBuffSteps ?? [], newX, request, contextNew.primaryAbilityKey)
    : { byAction: {}, rotationSteps: [], primaryAction: '' }

  const characterMetadata = getGameMetadata().characters[request.characterId]
  const elementalDmgValue = ElementToDamage[characterMetadata.element]

  const extraRows: StatsValues[] = []
  if (characterMetadata.path === PathNames.Elation) {
    extraRows.push(Stats.Elation)
  }

  return {
    oldRowData: currentRowData,
    newRowData: selectedRowData,
    oldRelics,
    newRelics,
    request,
    oldX,
    newX,
    perActionBuffGroups,
    context: contextNew,
    elementalDmgValue,
    extraRows,
  }
}

export function getPinnedRowData() {
  const currentPinned = gridStore.optimizerGridApi()?.getGridOption('pinnedTopRowData') ?? []
  return currentPinned && currentPinned.length ? currentPinned[0] : null
}

export function mismatchedCharacter(optimizerTabFocusCharacter?: CharacterId | null, form?: OptimizerForm) {
  return form?.characterId != optimizerTabFocusCharacter
}

export function getCachedForm() {
  return optimizerFormCache.get(useOptimizerDisplayStore.getState().optimizationId!)
}
