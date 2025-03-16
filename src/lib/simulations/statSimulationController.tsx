import { Flex, Tag } from 'antd'
import i18next from 'i18next'
import { Constants, MainStats, Parts, SetsOrnaments, SetsOrnamentsNames, SetsRelics, SetsRelicsNames, Stats, SubStats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { BasicStatsArray, BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import { ComputedStatsArray, ComputedStatsArrayCore } from 'lib/optimization/computedStatsArray'
import { calculateCurrentlyEquippedRow, formatOptimizerDisplayData } from 'lib/optimization/optimizer'
import { emptyRelic } from 'lib/optimization/optimizerUtils'
import { SortOption } from 'lib/optimization/sortOptions'
import { RelicFilters } from 'lib/relics/relicFilters'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { setSortColumn } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { Utils } from 'lib/utils/utils'
import { useTranslation } from 'react-i18next'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'
import { Relic, Stat } from 'types/relic'

// FIXME HIGH

export type Simulation = {
  name?: string
  key: string
  simType: StatSimTypes
  request: SimulationRequest
  result: SimulationResult
  penaltyMultiplier: number
}

export type SimulationRequest = {
  name?: string // This name is optionally provided from the sim form, then the parent either autogens or inherits
  simRelicSet1: string
  simRelicSet2: string
  simOrnamentSet: string
  simBody: string
  simFeet: string
  simPlanarSphere: string
  simLinkRope: string
  stats: SimulationStats
}

export type SimulationStats = {
  [key: string]: number
}

export function saveStatSimulationBuildFromForm() {
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

  return saveStatSimulationRequest(simRequest, simType, true)
}

export function saveStatSimulationRequest(simRequest: SimulationRequest, simType: StatSimTypes, startSim = false) {
  const existingSimulations = (window.store.getState().statSimulations || [])
  const key = Utils.randomId()
  const name = simRequest.name || undefined
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

  return Utils.objectHash({
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
  if (saveStatSimulationBuildFromForm() === null) return

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

  autosave()
}

export function deleteStatSimulationBuild(record: { key: React.Key; name: string }) {
  console.log('Delete sim', record)
  const statSims = window.store.getState().statSimulations
  const updatedSims: Simulation[] = Utils.clone(statSims.filter((x) => x.key != record.key))

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

export type RunSimulationsParams = {
  quality: number
  speedRollValue: number
  mainStatMultiplier: number
  substatRollsModifier: (num: number, stat: string, relics: Record<Parts, Relic>) => number
  simulationFlags: SimulationFlags
}

const cachedComputedStatsArray = new ComputedStatsArrayCore(false) as ComputedStatsArray
const cachedBasicStatsArray = new BasicStatsArrayCore(false) as BasicStatsArray

export const defaultSimulationParams: RunSimulationsParams = {
  quality: 1,
  speedRollValue: 2.6,
  mainStatMultiplier: 1,
  substatRollsModifier: (num: number) => num,
  simulationFlags: {} as SimulationFlags,
}

export function runSimulations(
  form: Form,
  context: OptimizerContext | null,
  simulations: Simulation[],
  inputParams: Partial<RunSimulationsParams> = {},
  weight: boolean = false,
): SimulationResult[] {
  const params: RunSimulationsParams = { ...defaultSimulationParams, ...inputParams }
  const forcedBasicSpd = params.simulationFlags.forceBasicSpd ? params.simulationFlags.forceBasicSpdValue : undefined

  const simulationResults: SimulationResult[] = []
  for (const sim of simulations) {
    const request = sim.request

    const head: Relic = emptyRelic()
    const hands: Relic = emptyRelic()
    const body: Relic = emptyRelic()
    const feet: Relic = emptyRelic()
    const linkRope: Relic = emptyRelic()
    const planarSphere: Relic = emptyRelic()

    head.augmentedStats!.mainStat = Constants.Stats.HP
    hands.augmentedStats!.mainStat = Constants.Stats.ATK
    body.augmentedStats!.mainStat = request.simBody
    feet.augmentedStats!.mainStat = request.simFeet
    linkRope.augmentedStats!.mainStat = request.simLinkRope
    planarSphere.augmentedStats!.mainStat = request.simPlanarSphere

    head.augmentedStats!.mainValue = 705.600// * params.mainStatMultiplier
    hands.augmentedStats!.mainValue = 352.800// * params.mainStatMultiplier
    body.augmentedStats!.mainValue = StatCalculator.getMaxedStatValue(request.simBody as MainStats) * params.mainStatMultiplier
    feet.augmentedStats!.mainValue = StatCalculator.getMaxedStatValue(request.simFeet as MainStats) * params.mainStatMultiplier
    linkRope.augmentedStats!.mainValue = StatCalculator.getMaxedStatValue(request.simLinkRope as MainStats) * params.mainStatMultiplier
    planarSphere.augmentedStats!.mainValue = StatCalculator.getMaxedStatValue(request.simPlanarSphere as MainStats) * params.mainStatMultiplier

    // Generate relic sets
    // Since the optimizer uses index based relic set identification, it can't handle an empty set
    // We have to fake rainbow sets by forcing a 2+1+1 or a 1+1+1+1 combination
    // For planar sets we can't the index be negative or NaN, so we just use two unmatched sets
    const unusedRelicSets = SetsRelicsNames.filter((x) => x != request.simRelicSet1 && x != request.simRelicSet2)

    head.set = request.simRelicSet1 as SetsRelics || unusedRelicSets[0]
    hands.set = request.simRelicSet1 as SetsRelics || unusedRelicSets[1]
    body.set = request.simRelicSet2 as SetsRelics || unusedRelicSets[2]
    feet.set = request.simRelicSet2 as SetsRelics || unusedRelicSets[3]
    linkRope.set = request.simOrnamentSet as SetsOrnaments || SetsOrnamentsNames[0]
    planarSphere.set = request.simOrnamentSet as SetsOrnaments || SetsOrnamentsNames[1]

    head.part = Parts.Head
    hands.part = Parts.Hands
    body.part = Parts.Body
    feet.part = Parts.Feet
    linkRope.part = Parts.LinkRope
    planarSphere.part = Parts.PlanarSphere

    const relicsByPart = {
      [Parts.Head]: [head],
      [Parts.Hands]: [hands],
      [Parts.Body]: [body],
      [Parts.Feet]: [feet],
      [Parts.LinkRope]: [linkRope],
      [Parts.PlanarSphere]: [planarSphere],
    }
    const relics: Record<Parts, Relic> = {
      [Parts.Head]: head,
      [Parts.Hands]: hands,
      [Parts.Body]: body,
      [Parts.Feet]: feet,
      [Parts.LinkRope]: linkRope,
      [Parts.PlanarSphere]: planarSphere,
    }

    // Convert substat rolls to value totals
    const substatValues: { stat: SubStats; value: number }[] = []

    // Convert value totals to substat objects
    for (const substat of SubStats) {
      let value = sim.request.stats[substat]

      if (sim.simType == StatSimTypes.SubstatRolls) {
        const substatValue = substat == Stats.SPD
          ? params.speedRollValue
          : StatCalculator.getMaxedSubstatValue(substat, params.quality)

        let substatCount = Utils.precisionRound((sim.request.stats[substat] || 0))
        substatCount = params.substatRollsModifier(substatCount, substat, relics)

        value = substatCount * substatValue
      }

      if (value) {
        substatValues.push({
          stat: substat,
          value: value,
        })
      }
    }

    head.substats = substatValues

    RelicFilters.condenseRelicSubstatsForOptimizer(relicsByPart)

    const basicStatsArray = form.trace ? new BasicStatsArrayCore(true) : cachedBasicStatsArray
    const computedStatsArray = form.trace ? new ComputedStatsArrayCore(true) : cachedComputedStatsArray

    const x = calculateBuild(
      form,
      relics,
      context,
      basicStatsArray,
      computedStatsArray,
      true,
      true,
      false,
      forcedBasicSpd,
      weight,
    )
    const optimizerDisplayData = formatOptimizerDisplayData(x)
    // For optimizer grid syncing with sim table
    optimizerDisplayData.statSim = {
      key: sim.key,
    }
    simulationResults.push(optimizerDisplayData)
  }

  return simulationResults
}

export function startOptimizerStatSimulation() {
  const form: Form = OptimizerTabController.getForm()
  const existingSimulations = (window.store.getState().statSimulations || [])

  if (existingSimulations.length == 0) return
  if (!OptimizerTabController.validateForm(form)) return

  console.log('Starting sims', existingSimulations)

  const simulationResults = runSimulations(form, null, existingSimulations, undefined, true)
  simulationResults.forEach((x) => x.id = x.statSim.key)

  OptimizerTabController.setRows(simulationResults)

  calculateCurrentlyEquippedRow(form)
  window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })

  const sortOption = SortOption[form.resultSort]
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
  const selectedRow = window.optimizerGrid.current!.api.getSelectedRows()[0]

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

  const request = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, 1)
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
    for (const substat of relic.substats) {
      accumulatedSubstatRolls[substat.stat] += substat.value / (substat.stat == Stats.SPD ? speedRollValue : StatCalculator.getMaxedSubstatValue(substat.stat, quality))
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
    simBody: relicsByPart[Parts.Body].main.stat,
    simFeet: relicsByPart[Parts.Feet].main.stat,
    simPlanarSphere: relicsByPart[Parts.PlanarSphere].main.stat,
    simLinkRope: relicsByPart[Parts.LinkRope].main.stat,
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
