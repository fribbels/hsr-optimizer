import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { calculateCurrentlyEquippedRow } from 'lib/optimization/optimizer'
import { SortOption } from 'lib/optimization/sortOptions'
import { transformOptimizerDisplayData } from 'lib/simulations/optimizerDisplayDataTransform'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import {
  Simulation,
  SimulationRequest,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import {
  convertRelicsToSimulation,
  ornamentSetIndexToName,
  relicSetIndexToNames,
} from 'lib/simulations/statSimulationUtils'
import DB from 'lib/state/db'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { SaveState } from 'lib/state/saveState'
import { setSortColumn } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import {
  getForm,
  validateForm,
} from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { optimizerGridApi } from 'lib/utils/gridUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'
import { Form } from 'types/form'

// FIXME HIGH

export function saveStatSimulationBuildFromForm(startSim = true) {
  const storeState = useOptimizerRequestStore.getState()
  const form = { statSim: storeState.statSim } as Form

  const simType: StatSimTypes = useOptimizerDisplayStore.getState().statSimulationDisplay

  // Check for invalid button presses
  if (simType == StatSimTypes.Disabled || !form.statSim?.[simType]) {
    console.warn('Invalid sim', form, simType)
    return null
  }

  // Check for missing fields
  const simRequest: SimulationRequest = form.statSim[simType]
  if (!validateRequest(simRequest)) {
    console.warn('Invalid sim', form, simType)
    return null
  }

  return saveStatSimulationRequest(simRequest, simType, startSim)
}

export function saveStatSimulationRequest(simRequest: SimulationRequest, simType: StatSimTypes, startSim = false) {
  const existingSimulations = useOptimizerDisplayStore.getState().statSimulations || []
  const key = TsUtils.uuid()
  const name = simRequest.name ?? undefined
  const simulation = {
    name: name,
    key: key,
    simType: simType,
    request: simRequest,
  } as Simulation

  // Check for dupes
  const hash = hashSim(simulation)
  for (const sim of existingSimulations) {
    const existingHash = hashSim(sim)

    if (hash == existingHash) {
      Message.error(i18next.t('optimizerTab:StatSimulation.DuplicateSimMessage')) // 'Identical stat simulation already exists')
      return null
    }
  }

  existingSimulations.push(simulation)

  // Update state
  useOptimizerDisplayStore.getState().setStatSimulations(existingSimulations)
  setFormStatSimulations(existingSimulations)

  if (startSim) {
    startOptimizerStatSimulation()
  }

  autosave()
}

function hashSim(sim: Simulation) {
  const cleanedRequest = {}
  for (const entry of Object.entries(sim.request)) {
    if (entry[1] != null) {
      // @ts-ignore
      cleanedRequest[entry[0]] = entry[1]
    }
  }

  return TsUtils.objectHash({
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
  if (saveStatSimulationBuildFromForm(false) === null) return

  const selectedSim = useOptimizerDisplayStore.getState().selectedStatSimulations
  const statSims: Simulation[] = useOptimizerDisplayStore.getState().statSimulations

  const updatedSims = statSims.map((x) => {
    if (x.key === selectedSim[0]) {
      return statSims.at(-1)
    } else return x
  }) as Simulation[]

  const newSim = updatedSims.pop()! // remove what would otherwise be a duplicated sim

  useOptimizerDisplayStore.getState().setStatSimulations(updatedSims)
  setFormStatSimulations(updatedSims)
  useOptimizerDisplayStore.getState().setSelectedStatSimulations([newSim.key])

  setTimeout(() => {
    startOptimizerStatSimulation()
  }, 0)
}

export function deleteStatSimulationBuild(record: { key: React.Key }) {
  const statSims = useOptimizerDisplayStore.getState().statSimulations
  const updatedSims = TsUtils.clone(statSims.filter((x) => x.key != record.key))

  useOptimizerDisplayStore.getState().setStatSimulations(updatedSims)
  setFormStatSimulations(updatedSims)

  autosave()
}

export function deleteAllStatSimulationBuilds() {
  useOptimizerDisplayStore.getState().setStatSimulations([])
  setFormStatSimulations([])

  autosave()
}

export function setFormStatSimulations(simulations: Simulation[]) {
  useOptimizerRequestStore.getState().setStatSim({
    ...useOptimizerRequestStore.getState().statSim!,
    simulations,
  })
}

export function startOptimizerStatSimulation() {
  const form = getForm()
  const existingSimulations = useOptimizerDisplayStore.getState().statSimulations || []

  if (existingSimulations.length == 0) return
  if (!validateForm(form)) return

  const context = generateContext(form)

  const optimizerDisplayData: OptimizerDisplayData[] = []

  for (const simulation of existingSimulations) {
    const simulationResults = runStatSimulations([simulation], form, context, { stabilize: true })
    const transformedData = simulationResults.map((result) => transformOptimizerDisplayData(result.x, simulation.key))
    optimizerDisplayData.push(transformedData[0])
  }

  OptimizerTabController.setRows(optimizerDisplayData)

  calculateCurrentlyEquippedRow(form)
  optimizerGridApi()?.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })

  const sortOption = SortOption[form.resultSort!]
  const gridSortColumn = form.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
  setSortColumn(gridSortColumn)

  autosave()
}

function autosave() {
  const form = getForm()
  DB.addFromForm(form)
  SaveState.delayedSave()
}

export function importOptimizerBuild() {
  const selectedRow = window.optimizerGrid?.current?.api?.getSelectedRows()?.[0]
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
