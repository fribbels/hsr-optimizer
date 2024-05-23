import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { Utils } from 'lib/utils'
import { Constants, Parts, SetsOrnamentsNames, SetsRelicsNames, Stats, StatsToShort, SubStats } from 'lib/constants'
import { emptyRelic } from 'lib/optimizer/optimizerUtils'
import { StatCalculator } from 'lib/statCalculator'
import { Relic, Stat } from 'types/Relic'
import { RelicFilters } from 'lib/relicFilters'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { calculateCurrentlyEquippedRow, renameFields } from 'lib/optimizer/optimizer'
import { Assets } from 'lib/assets'
import { Flex, Tag } from 'antd'
import { Message } from 'lib/message'
import { setSortColumn } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'
import { SortOption } from 'lib/optimizer/sortOptions'
import { SaveState } from 'lib/saveState'
import DB from 'lib/db'
import { Form } from 'types/Form'
import { SimulationResult } from 'lib/characterScorer'

export type Simulation = {
  name?: string
  key: string
  simType: string
  request: SimulationRequest
  result: any
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
    return
  }

  // Check for missing fields
  const simRequest: SimulationRequest = form.statSim[simType]
  if (!validateRequest(simRequest)) {
    console.warn('Invalid sim', form, simType)
    return
  }

  saveStatSimulationRequest(simRequest, simType, true)
}

export function saveStatSimulationRequest(simRequest: SimulationRequest, simType: StatSimTypes, startSim = false) {
  const existingSimulations: Simulation[] = window.store.getState().statSimulations || []
  const key = Utils.randomId()
  const name = simRequest.name || undefined
  const simulation: Simulation = {
    name: name,
    key: key,
    simType: simType,
    request: simRequest,
  }

  // Check for dupes
  const hash = hashSim(simulation)
  for (const sim of existingSimulations) {
    const existingHash = hashSim(sim)

    if (hash == existingHash) {
      Message.error('Identical stat simulation already exists')
      return
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
    Message.error('Missing simulation main stats')
    return false
  }

  return true
}

export function renderDefaultSimulationName(sim: Simulation) {
  return (
    <Flex gap={5}>
      <SimSetsDisplay sim={sim} />

      |

      <SimMainsDisplay sim={sim} />

      |

      <Flex>
        {sim.name ? `${sim.name}` : null}
      </Flex>

      <Flex>
        {sim.name ? `|` : null}
      </Flex>

      <SimSubstatsDisplay sim={sim} />
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
      <Flex style={{ width: imgSize * 2 + 5 }} justify="center">
        <img style={{ width: request.simRelicSet1 ? imgSize : 0 }} src={relicImage1} />
        <img style={{ width: request.simRelicSet2 ? imgSize : 0 }} src={relicImage2} />
      </Flex>

      <img style={{ width: imgSize }} src={ornamentImage} />
    </Flex>
  )
}

function SimMainsDisplay(props: { sim: Simulation }) {
  const request = props.sim.request
  const imgSize = 22
  return (
    <Flex>
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simBody, true)} />
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simFeet, true)} />
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simPlanarSphere, true)} />
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simLinkRope, true)} />
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
  const renderArray: Stat[] = []
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
      ? `${StatsToShort[x.stat]} x ${x.value}`
      : `${StatsToShort[x.stat]} ${x.value}${Utils.isFlat(x.stat) ? '' : '%'}`
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

export function deleteStatSimulationBuild(record: { key: React.Key; name: string }) {
  console.log('Delete sim', record)
  const statSims: Simulation[] = window.store.getState().statSimulations
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

export function runSimulations(form: Form, simulations: Simulation[], quality = 1): SimulationResult[] {
  const simulationResults = []
  for (const sim of simulations) {
    const request = sim.request

    const head = emptyRelic()
    const hands = emptyRelic()
    const body = emptyRelic()
    const feet = emptyRelic()
    const linkRope = emptyRelic()
    const planarSphere = emptyRelic()

    head.augmentedStats.mainStat = Constants.Stats.HP
    head.augmentedStats.mainValue = 705.600

    hands.augmentedStats.mainStat = Constants.Stats.ATK
    hands.augmentedStats.mainValue = 352.800

    body.augmentedStats.mainStat = request.simBody
    body.augmentedStats.mainValue = StatCalculator.getMaxedStatValue(request.simBody)

    feet.augmentedStats.mainStat = request.simFeet
    feet.augmentedStats.mainValue = StatCalculator.getMaxedStatValue(request.simFeet)

    linkRope.augmentedStats.mainStat = request.simLinkRope
    linkRope.augmentedStats.mainValue = StatCalculator.getMaxedStatValue(request.simLinkRope)

    planarSphere.augmentedStats.mainStat = request.simPlanarSphere
    planarSphere.augmentedStats.mainValue = StatCalculator.getMaxedStatValue(request.simPlanarSphere)

    // Generate relic sets
    // Since the optimizer uses index based relic set identification, it can't handle an empty set
    // We have to fake rainbow sets by forcing a 2+1+1 or a 1+1+1+1 combination
    // For planar sets we can't the index be negative or NaN, so we just use two unmatched sets
    const unusedRelicSets = SetsRelicsNames.filter((x) => x != request.simRelicSet1 && x != request.simRelicSet2)

    head.set = request.simRelicSet1 || unusedRelicSets[0]
    hands.set = request.simRelicSet1 || unusedRelicSets[1]
    body.set = request.simRelicSet2 || unusedRelicSets[2]
    feet.set = request.simRelicSet2 || unusedRelicSets[3]
    linkRope.set = request.simOrnamentSet || SetsOrnamentsNames[0]
    planarSphere.set = request.simOrnamentSet || SetsOrnamentsNames[1]

    head.part = Parts.Head
    hands.part = Parts.Hands
    body.part = Parts.Body
    feet.part = Parts.Feet
    linkRope.part = Parts.LinkRope
    planarSphere.part = Parts.PlanarSphere

    // Convert substat rolls to value totals
    const substatValues: Stat[] = []
    const requestSubstats = Utils.clone(sim.request.stats)
    if (sim.simType == StatSimTypes.SubstatRolls) {
      for (const substat of SubStats) {
        requestSubstats[substat] = Utils.precisionRound((requestSubstats[substat] || 0) * StatCalculator.getMaxedSubstatValue(substat, quality))
      }
    }

    // Convert value totals to substat objects
    for (const substat of SubStats) {
      const value = requestSubstats[substat]
      if (value) {
        substatValues.push({
          stat: substat,
          value: value,
        })
      }
    }

    head.substats = substatValues

    const relicsByPart = {
      [Parts.Head]: [head],
      [Parts.Hands]: [hands],
      [Parts.Body]: [body],
      [Parts.Feet]: [feet],
      [Parts.LinkRope]: [linkRope],
      [Parts.PlanarSphere]: [planarSphere],
    }
    const relics = {
      [Parts.Head]: head,
      [Parts.Hands]: hands,
      [Parts.Body]: body,
      [Parts.Feet]: feet,
      [Parts.LinkRope]: linkRope,
      [Parts.PlanarSphere]: planarSphere,
    }
    RelicFilters.condenseRelicSubstatsForOptimizer(relicsByPart)

    const c = calculateBuild(form, relics)

    renameFields(c)
    c.statSim = {
      key: sim.key,
    }
    simulationResults.push(c)
  }

  return simulationResults
}

export function startOptimizerStatSimulation() {
  const form: Form = OptimizerTabController.getForm()
  const existingSimulations: Simulation[] = window.store.getState().statSimulations || []

  if (existingSimulations.length == 0) return
  if (!OptimizerTabController.validateForm(form)) return

  console.log('Starting sims', existingSimulations)

  const simulationResults = runSimulations(form, existingSimulations)

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
  SaveState.save()
}

export function importOptimizerBuild() {
  const selectedRow = window.optimizerGrid.current!.api.getSelectedRows()[0]

  if (!selectedRow) {
    Message.warning('Run the optimizer first, then select a row from the optimizer results to import')
    return
  }

  if (selectedRow.statSim) {
    Message.warning('The selected optimizer build is already a simulation')
    return
  }

  // Generate relics from optimizer row
  const relicsByPart = OptimizerTabController.calculateRelicsFromId(selectedRow.id, true)

  // Calculate relic sets
  const relicSetIndex = selectedRow.relicSetIndex
  const numSetsR = Object.values(Constants.SetsRelics).length
  const s1 = relicSetIndex % numSetsR
  const s2 = ((relicSetIndex - s1) / numSetsR) % numSetsR
  const s3 = ((relicSetIndex - s2 * numSetsR - s1) / (numSetsR * numSetsR)) % numSetsR
  const s4 = ((relicSetIndex - s3 * numSetsR * numSetsR - s2 * numSetsR - s1) / (numSetsR * numSetsR * numSetsR)) % numSetsR
  const relicSets = [s1, s2, s3, s4]
  const relicSetNames: string[] = calculateRelicSets(relicSets)

  // Calculate ornament sets
  const ornamentSetIndex = selectedRow.ornamentSetIndex
  const ornamentSetCount = Object.values(Constants.SetsOrnaments).length
  const os1 = ornamentSetIndex % ornamentSetCount
  const os2 = ((ornamentSetIndex - os1) / ornamentSetCount) % ornamentSetCount
  const ornamentSetName: string | undefined = calculateOrnamentSets([os1, os2], false)

  const request = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, 1)
  saveStatSimulationRequest(request, StatSimTypes.SubstatRolls, false)
}

export function convertRelicsToSimulation(relicsByPart, relicSet1, relicSet2, ornamentSet, quality = 1) {
  const relics: Relic[] = Object.values(relicsByPart)
  const accumulatedSubstatRolls = {}
  SubStats.map((x) => accumulatedSubstatRolls[x] = 0)

  // Sum up substat rolls
  for (const relic of relics) {
    for (const substat of relic.substats) {
      accumulatedSubstatRolls[substat.stat] += substat.value / StatCalculator.getMaxedSubstatValue(substat.stat, quality)
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

export function calculateRelicSets(relicSets, nameProvided = false) {
  const relicSetNames: string[] = []
  while (relicSets.length > 0) {
    const value = relicSets[0]
    if (relicSets.lastIndexOf(value)) {
      const setName = nameProvided ? value : Object.entries(Constants.RelicSetToIndex).find((x) => x[1] == value)![0]
      relicSetNames.push(setName)

      const otherIndex = relicSets.lastIndexOf(value)
      relicSets.splice(otherIndex, 1)
    }
    relicSets.splice(0, 1)
  }

  return relicSetNames
}

export function calculateOrnamentSets(ornamentSets, nameProvided = true) {
  if (ornamentSets[0] != null && ornamentSets[0] == ornamentSets[1]) {
    return nameProvided ? ornamentSets[1] : Object.entries(Constants.OrnamentSetToIndex).find((x) => x[1] == ornamentSets[1])![0]
  }
  return undefined
}
