import { Flex, Tag } from 'antd'
import i18next from 'i18next'
import { Constants, Parts, Stats, SubStats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { calculateCurrentlyEquippedRow } from 'lib/optimization/optimizer'
import { SortOption } from 'lib/optimization/sortOptions'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { transformOptimizerDisplayData } from 'lib/simulations/optimizerDisplayDataTransform'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { Simulation, SimulationRequest, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { setSortColumn } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { optimizerGridApi } from 'lib/utils/gridUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'types/form'
import { Relic, Stat } from 'types/relic'

// FIXME HIGH

export function saveStatSimulationBuildFromForm(startSim = true) {
  const form: Form = window.optimizerForm.getFieldsValue()
  console.log('Save statSim', form.statSim)

  const simType: StatSimTypes = window.store.getState().statSimulationDisplay

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
  const existingSimulations = (window.store.getState().statSimulations || [])
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
      Message.error(i18next.t('optimizerTab:StatSimulation.DuplicateSimMessage'))// 'Identical stat simulation already exists')
      return null
    }
  }

  existingSimulations.push(simulation)

  // Update state
  window.store.getState().setStatSimulations(existingSimulations)
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
    Message.error(i18next.t('optimizerTab:StatSimulation.MissingMainstatsMessage'))// 'Missing simulation main stats'
    return false
  }

  return true
}

export function renderDefaultSimulationName(sim: Simulation) {
  return (
    <Flex gap={5}>
      <SimSetsDisplay sim={sim}/>

      |

      <SimMainsDisplay sim={sim}/>

      |

      <Flex>
        {sim.name ? `${sim.name}` : null}
      </Flex>

      <Flex>
        {sim.name ? `|` : null}
      </Flex>

      <SimSubstatsDisplay sim={sim}/>
    </Flex>
  )
}

function SimSetsDisplay(props: { sim: Simulation }) {
  const request = props.sim.request
  const imgSize = 22
  const relicImage1 = Assets.getSetImage(request.simRelicSet1)
  const relicImage2 = Assets.getSetImage(request.simRelicSet2)
  const ornamentImage = request.simOrnamentSet ? Assets.getSetImage(request.simOrnamentSet) : Assets.getBlank()
  return (
    <Flex gap={5}>
      <Flex style={{ width: imgSize * 2 + 5 }} justify='center'>
        <img style={{ width: request.simRelicSet1 ? imgSize : 0 }} src={relicImage1}/>
        <img style={{ width: request.simRelicSet2 ? imgSize : 0 }} src={relicImage2}/>
      </Flex>

      <img style={{ width: imgSize }} src={ornamentImage}/>
    </Flex>
  )
}

function SimMainsDisplay(props: { sim: Simulation }) {
  const request = props.sim.request
  const imgSize = 22
  return (
    <Flex>
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simBody, true)}/>
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simFeet, true)}/>
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simPlanarSphere, true)}/>
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simLinkRope, true)}/>
    </Flex>
  )
}

const substatToPriority = {
  [Stats.ATK_P]: 0,
  [Stats.ATK]: 1,
  [Stats.CR]: 2,
  [Stats.CD]: 3,
  [Stats.SPD]: 4,
  [Stats.BE]: 5,
  [Stats.HP_P]: 6,
  [Stats.HP]: 7,
  [Stats.DEF_P]: 8,
  [Stats.DEF]: 9,
  [Stats.EHR]: 10,
  [Stats.RES]: 11,
}

function SimSubstatsDisplay(props: { sim: Simulation }) {
  const { t } = useTranslation('common', { keyPrefix: 'ShortStats' })
  const renderArray: { stat: SubStats; value: number }[] = []
  const substats = props.sim.request.stats
  for (const stat of Constants.SubStats) {
    const value = substats[stat]
    if (value) {
      renderArray.push({
        stat: stat,
        value: value,
      })
    }
  }

  renderArray.sort((a, b) => substatToPriority[a.stat] - substatToPriority[b.stat])

  function renderStat(x: Stat) {
    return props.sim.simType == StatSimTypes.SubstatRolls
      ? `${t([x.stat])} x ${x.value}`
      : `${t([x.stat])} ${x.value}${Utils.isFlat(x.stat) ? '' : '%'}`
  }

  return (
    <Flex gap={0}>
      {
        renderArray.map((x) => {
          return (
            <Flex key={x.stat}>
              <Tag
                style={{ paddingInline: '5px', marginInlineEnd: '5px' }}
              >
                {renderStat(x)}
              </Tag>
            </Flex>
          )
        })
      }
    </Flex>
  )
}

export function overwriteStatSimulationBuild() {
  if (saveStatSimulationBuildFromForm(false) === null) return

  const selectedSim = window.store.getState().selectedStatSimulations
  const statSims: Simulation[] = window.store.getState().statSimulations

  const updatedSims = statSims.map((x) => {
    if (x.key === selectedSim[0]) {
      return statSims.at(-1)
    } else return x
  }) as Simulation[]

  const newSim = updatedSims.pop()! // remove what would otherwise be a duplicated sim

  window.store.getState().setStatSimulations(updatedSims)
  setFormStatSimulations(updatedSims)
  window.store.getState().setSelectedStatSimulations([newSim.key])

  setTimeout(() => {
    startOptimizerStatSimulation()
  }, 0)
}

export function deleteStatSimulationBuild(record: { key: React.Key }) {
  console.log('Delete sim', record)
  const statSims = window.store.getState().statSimulations
  const updatedSims = TsUtils.clone(statSims.filter((x) => x.key != record.key))

  window.store.getState().setStatSimulations(updatedSims)
  setFormStatSimulations(updatedSims)

  autosave()
}

export function deleteAllStatSimulationBuilds() {
  window.store.getState().setStatSimulations([])
  setFormStatSimulations([])

  autosave()
}

export function setFormStatSimulations(simulations: Simulation[]) {
  window.optimizerForm.setFieldValue(['statSim', 'simulations'], simulations)
}

export function startOptimizerStatSimulation() {
  const form = OptimizerTabController.getForm()
  const existingSimulations = (window.store.getState().statSimulations || [])

  if (existingSimulations.length == 0) return
  if (!OptimizerTabController.validateForm(form)) return

  console.log('Starting sims', existingSimulations)

  const context = generateContext(form)

  const optimizerDisplayData: OptimizerDisplayData[] = []

  for (const simulation of existingSimulations) {
    const simulationResults = runStatSimulations([simulation], form, context, { stabilize: true })
    const transformedData = simulationResults.map((result) => transformOptimizerDisplayData(result.x, simulation.key))
    optimizerDisplayData.push(transformedData[0])
  }

  OptimizerTabController.setRows(optimizerDisplayData)

  calculateCurrentlyEquippedRow(form)
  optimizerGridApi().updateGridOptions({ datasource: OptimizerTabController.getDataSource() })

  const sortOption = SortOption[form.resultSort!]
  const gridSortColumn = form.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
  setSortColumn(gridSortColumn)

  autosave()
}

function autosave() {
  const form = OptimizerTabController.getForm()
  DB.addFromForm(form)
  SaveState.delayedSave()
}

export function importOptimizerBuild() {
  const selectedRow = window.optimizerGrid.current!.api.getSelectedRows()[0] as OptimizerDisplayData

  if (!selectedRow) {
    Message.warning(i18next.t('optimizerTab:StatSimulation.NothingToImport'))// 'Run the optimizer first, then select a row from the optimizer results to import'
    return
  }

  if (selectedRow.statSim) {
    Message.warning(i18next.t('optimizerTab:StatSimulation.BuildAlreadyImported'))// 'The selected optimizer build is already a simulation'
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

export function relicSetIndexToNames(relicSetIndex: number) {
  const numSetsR = Object.values(Constants.SetsRelics).length
  const s1 = relicSetIndex % numSetsR
  const s2 = ((relicSetIndex - s1) / numSetsR) % numSetsR
  const s3 = ((relicSetIndex - s2 * numSetsR - s1) / (numSetsR * numSetsR)) % numSetsR
  const s4 = ((relicSetIndex - s3 * numSetsR * numSetsR - s2 * numSetsR - s1) / (numSetsR * numSetsR * numSetsR)) % numSetsR
  const relicSets = [s1, s2, s3, s4]
  return calculateRelicSets(relicSets)
}

export function ornamentSetIndexToName(ornamentSetIndex: number) {
  const ornamentSetCount = Object.values(Constants.SetsOrnaments).length
  const os1 = ornamentSetIndex % ornamentSetCount
  const os2 = ((ornamentSetIndex - os1) / ornamentSetCount) % ornamentSetCount
  return calculateOrnamentSets([os1, os2], false)
}

export function convertRelicsToSimulation(
  relicsByPart: SingleRelicByPart,
  relicSet1: string,
  relicSet2: string,
  ornamentSet?: string,
  quality = 1,
  speedRollValue = 2.6,
) {
  const relics: Relic[] = Object.values(relicsByPart)
  const accumulatedSubstatRolls = {} as Record<SubStats, number>
  SubStats.map((x) => accumulatedSubstatRolls[x] = 0)

  // Sum up substat rolls
  for (const relic of relics) {
    if (relic && relic.substats) {
      for (const substat of relic.substats) {
        accumulatedSubstatRolls[substat.stat] += substat.value / (substat.stat == Stats.SPD ? speedRollValue : StatCalculator.getMaxedSubstatValue(substat.stat, quality))
      }
    }
  }

  // Round them to 4 precision
  SubStats.map((x) => accumulatedSubstatRolls[x] = Utils.precisionRound(accumulatedSubstatRolls[x], 4))

  // Generate the fake request and submit it
  return {
    name: '',
    simRelicSet1: relicSet1,
    simRelicSet2: relicSet2,
    simOrnamentSet: ornamentSet,
    simBody: relicsByPart[Parts.Body]?.main?.stat || null,
    simFeet: relicsByPart[Parts.Feet]?.main?.stat || null,
    simPlanarSphere: relicsByPart[Parts.PlanarSphere]?.main?.stat || null,
    simLinkRope: relicsByPart[Parts.LinkRope]?.main?.stat || null,
    stats: {
      [Stats.HP]: accumulatedSubstatRolls[Stats.HP] || null,
      [Stats.ATK]: accumulatedSubstatRolls[Stats.ATK] || null,
      [Stats.DEF]: accumulatedSubstatRolls[Stats.DEF] || null,
      [Stats.HP_P]: accumulatedSubstatRolls[Stats.HP_P] || null,
      [Stats.ATK_P]: accumulatedSubstatRolls[Stats.ATK_P] || null,
      [Stats.DEF_P]: accumulatedSubstatRolls[Stats.DEF_P] || null,
      [Stats.CR]: accumulatedSubstatRolls[Stats.CR] || null,
      [Stats.CD]: accumulatedSubstatRolls[Stats.CD] || null,
      [Stats.SPD]: accumulatedSubstatRolls[Stats.SPD] || null,
      [Stats.EHR]: accumulatedSubstatRolls[Stats.EHR] || null,
      [Stats.RES]: accumulatedSubstatRolls[Stats.RES] || null,
      [Stats.BE]: accumulatedSubstatRolls[Stats.BE] || null,
    },
  }
}

export function calculateRelicSets(relicSets: (string | number)[], nameProvided = false) {
  const relicSetNames: string[] = []
  while (relicSets.length > 0) {
    const value = relicSets[0]
    if (relicSets.lastIndexOf(value)) {
      const setName = nameProvided ? value : Object.entries(Constants.RelicSetToIndex).find((x) => x[1] == value)![0]
      relicSetNames.push(setName as string)

      const otherIndex = relicSets.lastIndexOf(value)
      relicSets.splice(otherIndex, 1)
    }
    relicSets.splice(0, 1)
  }

  return relicSetNames
}

export function calculateOrnamentSets(ornamentSets: unknown[], nameProvided = true): string | undefined {
  if (ornamentSets[0] != null && ornamentSets[0] == ornamentSets[1]) {
    return (
      nameProvided
        ? ornamentSets[1] as string
        : Object.entries(Constants.OrnamentSetToIndex).find((x) => x[1] == ornamentSets[1])![0]
    )
  }
  return undefined
}
