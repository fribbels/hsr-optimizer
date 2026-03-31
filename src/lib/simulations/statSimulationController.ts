import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import type { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { calculateCurrentlyEquippedRow } from 'lib/optimization/optimizer'
import { SortOption } from 'lib/optimization/sortOptions'
import { transformOptimizerDisplayData } from 'lib/simulations/optimizerDisplayDataTransform'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import type {
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import {
  convertRelicsToSimulation,
  ornamentSetIndexToName,
  relicSetIndexToNames,
} from 'lib/simulations/statSimulationUtils'
import * as persistenceService from 'lib/services/persistenceService'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { SaveState } from 'lib/state/saveState'
import { gridStore, setSortColumn } from 'lib/stores/gridStore'
import {
  getForm,
  validateForm,
} from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { objectHash } from 'lib/utils/objectUtils'
import { uuid } from 'lib/utils/miscUtils'

export function saveStatSimulationBuildFromForm(startSim = true) {
  const statSim = useOptimizerRequestStore.getState().statSim
  const simType: StatSimTypes = useOptimizerDisplayStore.getState().statSimulationDisplay

  const simRequest: SimulationRequest | undefined
    = simType === StatSimTypes.SubstatRolls ? statSim?.substatRolls
    : simType === StatSimTypes.Benchmarks ? statSim?.benchmarks
    : undefined

  if (!simRequest) {
    console.warn('Invalid sim', statSim, simType)
    return null
  }

  if (!validateRequest(simRequest)) {
    console.warn('Invalid sim', statSim, simType)
    return null
  }

  return saveStatSimulationRequest(simRequest, simType, startSim)
}

function saveStatSimulationRequest(simRequest: SimulationRequest, simType: StatSimTypes, startSim = false) {
  const existingSimulations = useOptimizerDisplayStore.getState().statSimulations
  const simulation: Simulation = {
    name: simRequest.name,
    key: uuid(),
    simType: simType,
    request: simRequest,
  }

  // Check for dupes
  const hash = hashSim(simulation)
  for (const sim of existingSimulations) {
    if (hash === hashSim(sim)) {
      Message.error(i18next.t('optimizerTab:StatSimulation.DuplicateSimMessage'))
      return null
    }
  }

  useOptimizerDisplayStore.getState().addSimulation(simulation)

  if (startSim) {
    startOptimizerStatSimulation()
  }

  autosave()
}

function hashSim(sim: Simulation) {
  const cleanedRequest: Record<string, unknown> = {}
  for (const entry of Object.entries(sim.request)) {
    if (entry[1] != null) {
      cleanedRequest[entry[0]] = entry[1]
    }
  }

  return objectHash({
    simType: sim.simType,
    request: cleanedRequest,
  })
}

function validateRequest(request: SimulationRequest) {
  if (!request.simBody || !request.simFeet || !request.simLinkRope || !request.simPlanarSphere) {
    Message.error(i18next.t('optimizerTab:StatSimulation.MissingMainstatsMessage')) // 'Missing simulation main stats'
    return false
  }

  return true
}

export function overwriteStatSimulationBuild() {
  const statSim = useOptimizerRequestStore.getState().statSim
  const simType: StatSimTypes = useOptimizerDisplayStore.getState().statSimulationDisplay

  const simRequest: SimulationRequest | undefined
    = simType === StatSimTypes.SubstatRolls ? statSim?.substatRolls
    : simType === StatSimTypes.Benchmarks ? statSim?.benchmarks
    : undefined

  if (!simRequest) {
    console.warn('Invalid sim', statSim, simType)
    return
  }
  if (!validateRequest(simRequest)) return

  const selectedKey = useOptimizerDisplayStore.getState().selectedStatSimulations[0]
  if (!selectedKey) return

  const newSim: Simulation = {
    name: simRequest.name,
    key: uuid(),
    simType: simType,
    request: simRequest,
  }

  // Check for dupes, excluding the sim being overwritten
  const existingSimulations = useOptimizerDisplayStore.getState().statSimulations
  const hash = hashSim(newSim)
  for (const sim of existingSimulations) {
    if (sim.key === selectedKey) continue
    if (hash === hashSim(sim)) {
      Message.error(i18next.t('optimizerTab:StatSimulation.DuplicateSimMessage'))
      return
    }
  }

  useOptimizerDisplayStore.getState().replaceSimulation(selectedKey, newSim)
  useOptimizerDisplayStore.getState().setSelectedStatSimulations([newSim.key])

  startOptimizerStatSimulation()
  SaveState.delayedSave()
}

export function deleteStatSimulationBuild(record: { key: string }) {
  useOptimizerDisplayStore.getState().removeSimulation(record.key)
  autosave()
}

export function deleteAllStatSimulationBuilds() {
  useOptimizerDisplayStore.getState().clearSimulations()
  autosave()
}

export function startOptimizerStatSimulation() {
  const form = getForm()
  const existingSimulations = useOptimizerDisplayStore.getState().statSimulations

  if (existingSimulations.length === 0) return
  if (!validateForm(form)) return

  const context = generateContext(form)
  useOptimizerDisplayStore.getState().setContext(context)

  const optimizerDisplayData: OptimizerDisplayData[] = []

  for (const simulation of existingSimulations) {
    const simulationResults = runStatSimulations([simulation], form, context, { stabilize: true })
    const transformedData = simulationResults.map((result) => transformOptimizerDisplayData(result.x, simulation.key))
    optimizerDisplayData.push(transformedData[0])
  }

  OptimizerTabController.setRows(optimizerDisplayData)

  calculateCurrentlyEquippedRow(form)
  gridStore.optimizerGridApi()?.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })

  const sortOption = SortOption[form.resultSort!]
  const gridSortColumn = form.statDisplay === 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
  setSortColumn(gridSortColumn)

  autosave()
}

function autosave() {
  const form = getForm()
  persistenceService.upsertCharacterFromForm(form)
  SaveState.delayedSave()
}

export function importOptimizerBuild() {
  const selectedRow = gridStore.optimizerGridApi()?.getSelectedRows()?.[0]
  const t = i18next.getFixedT(null, 'optimizerTab', 'StatSimulation')

  if (!selectedRow) {
    Message.warning(t('NothingToImport')) // 'Run the optimizer first, then select a row from the optimizer results to import'
    return
  }

  if (selectedRow.statSim) {
    Message.warning(t('BuildAlreadyImported')) // 'The selected optimizer build is already a simulation'
    return
  }

  // Generate relics from optimizer row
  const relicsByPart = OptimizerTabController.calculateRelicsFromId(selectedRow.id)

  // Calculate relic sets
  const relicSetIndex: number = selectedRow.relicSetIndex
  const relicSetNames: string[] = relicSetIndexToNames(relicSetIndex)

  // Calculate ornament sets
  const ornamentSetIndex: number = selectedRow.ornamentSetIndex
  const ornamentSetName: string | undefined = ornamentSetIndexToName(ornamentSetIndex)

  const request = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, 1) as SimulationRequest
  saveStatSimulationRequest(request, StatSimTypes.SubstatRolls, false)
}
