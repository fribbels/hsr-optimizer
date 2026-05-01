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
import { GlobalRegister } from 'lib/optimization/engine/config/keys'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { RelicFilters } from 'lib/relics/relicFilters'
import { teammateOrnamentOptions } from 'lib/sets/setConfigRegistry'
import { aggregatePerActionBuffs } from 'lib/simulations/combatBuffsAnalysis'
import type { PerActionBuffGroups } from 'lib/simulations/combatBuffsAnalysis'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { precisionRound } from 'lib/utils/mathUtils'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import type {
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
import { type TeammateOption } from 'types/setConfig'

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

export interface TeammateSetUpgrade {
  ids: Set<CharacterId>
  set: Set<TeammateOption['value']>
  oldSet?: TeammateOption['value']
  simScore: number
}
interface PreTeammateSetUpgrade {
  id: CharacterId
  set: TeammateOption['value']
  oldSet?: TeammateOption['value']
  simScore: number
}
interface PreGroupedTeammateSetUpgrade {
  id: CharacterId
  set: Set<TeammateOption['value']>
  oldSet?: TeammateOption['value']
  simScore: number
}

const teammateKeys = ['teammate0', 'teammate1', 'teammate2'] as const

export function calculateTeammateUpgrades(analysis: OptimizerResultAnalysis) {
  const baseRequest = analysis.request
  const relics = analysis.newRelics as SimulationRelicByPart

  const results: Array<PreTeammateSetUpgrade> = []

  teammateKeys.forEach((key) => {
    teammateOrnamentOptions.forEach((option) => {
      if (option.value === baseRequest[key].teamOrnamentSet) return
      const request = { ...baseRequest, [key]: { ...baseRequest[key], teamOrnamentSet: option.value } }
      const context = generateContext(request)
      const { x } = simulateBuild(relics, context, new BasicStatsArrayCore(true), null, true)
      results.push({
        id: baseRequest[key].characterId,
        set: option.value,
        oldSet: baseRequest[key].teamOrnamentSet,
        simScore: precisionRound(x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG), 2),
      })
    })
  })

  results.sort((a, b) => {
    // ensure results stay grouped by character
    const idDiff = a.id.localeCompare(b.id)
    if (idDiff) return idDiff
    return b.simScore - a.simScore
  })

  // group with same character, the results are already grouped by character so no need to search the array
  const preGroupedResults: Array<PreGroupedTeammateSetUpgrade> = []
  results.forEach((result) => {
    let latestGroup = preGroupedResults.at(-1)
    if (
      latestGroup
      && latestGroup.id === result.id
      && latestGroup.simScore === result.simScore
    ) {
      latestGroup.set.add(result.set)
      return
    }
    // special case needed for the "no-op" set changes
    latestGroup = preGroupedResults.at(-2)
    if (
      latestGroup
      && latestGroup.id === result.id
      && latestGroup.simScore === result.simScore
    ) {
      latestGroup.set.add(result.set)
    } else {
      preGroupedResults.push({
        ...result,
        set: new Set([result.set]),
      })
    }
  })

  preGroupedResults.sort((a, b) => b.simScore - a.simScore)

  const groupedResults: Array<TeammateSetUpgrade> = []
  preGroupedResults.forEach((group) => {
    const latestGroup = groupedResults.at(-1)
    if (
      latestGroup
      && latestGroup.oldSet === group.oldSet
      && latestGroup.set.symmetricDifference(group.set).size === 0
      && latestGroup.simScore === group.simScore
    ) {
      latestGroup.ids.add(group.id)
    } else {
      groupedResults.push({
        ...group,
        ids: new Set([group.id]),
      })
    }
  })

  return groupedResults
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

    const simResult = runStatSimulations([{ request: upgradeSim, simType: StatSimTypes.SubstatRolls, key: substat }], request, context)[0]
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

  const { x: oldX } = simulateBuild(oldRelics as SimulationRelicByPart, contextOld, null)
  const { x: newX, actionBuffSnapshots, rotationBuffSteps } = simulateBuild(
    newRelics as SimulationRelicByPart,
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
