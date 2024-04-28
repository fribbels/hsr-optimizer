import { StatSimulationOptions } from "components/optimizerTab/optimizerForm/DamageCalculatorDisplay";
import { Utils } from "lib/utils";
import { Constants, Parts, Stats, StatsToShort, SubStats } from "lib/constants";
import { emptyRelic } from "lib/optimizer/optimizerUtils";
import { StatCalculator } from "lib/statCalculator";
import { Stat } from "types/Relic";
import { RelicFilters } from "lib/relicFilters";
import { calculateBuild } from "lib/optimizer/calculateBuild";
import { OptimizerTabController } from "lib/optimizerTabController";
import { renameFields } from "lib/optimizer/optimizer";
import { Assets } from "lib/assets";
import { Flex } from "antd";
import { Message } from "lib/message";
import { setSortColumn } from "components/optimizerTab/optimizerForm/RecommendedPresetsButton";
import { SortOption } from "lib/optimizer/sortOptions";
import { SaveState } from "lib/saveState";

export function saveStatSimulationBuild() {
  const form = window.optimizerForm.getFieldsValue()
  console.log('Save statSim', form.statSim)

  const simType = window.store.getState().statSimulationDisplay

  // Check for invalid button presses
  if (simType == StatSimulationOptions.Disabled || !form.statSim || !form.statSim[simType]) {
    console.warn('Invalid sim', form, simType)
    return
  }

  // Check for missing fields
  const simRequest = form.statSim[simType]
  if (!validateRequest(simRequest)) {
    console.warn('Invalid sim', form, simType)
    return
  }

  const existingSimulations = window.store.getState().statSimulations || []
  const key = Utils.randomId()
  const name = simRequest.name || undefined
  const simulation = {
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
  const cloned = Utils.clone(existingSimulations)
  window.store.getState().setStatSimulations(cloned)
  setFormStatSimulations(cloned)
  startStatSimulation()

  SaveState.save()
}

function hashSim(sim) {
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

function validateRequest(request) {
  console.debug('validateRequest', request)
  if (!request.simRelicSet1 || !request.simRelicSet2 || !request.simOrnamentSet) {
    Message.error('Missing simulation sets')
    return false
  }

  if (!request.simBody || !request.simFeet || !request.simLinkRope || !request.simPlanarSphere) {
    Message.error('Missing simulation main stats')
    return false
  }

  return true
}

export function renderDefaultSimulationName(record) {
  const request = record.request

  return (
    <Flex gap={5}>
      <SimSets request={request}/>

      {'|'}

      <SimMains request={request}/>

      {'|'}

      <SimSubstats request={request}/>
    </Flex>
  )
}

function SimSets(props: { request: any }) {
  const imgSize = 22
  return (
    <Flex gap={5}>
      <Flex>
        <img style={{width: imgSize}} src={Assets.getSetImage(props.request.simRelicSet1)}/>
        <img style={{width: imgSize}} src={Assets.getSetImage(props.request.simRelicSet2)}/>
      </Flex>

      <img style={{width: imgSize}} src={Assets.getSetImage(props.request.simOrnamentSet)}/>
    </Flex>
  )
}

function SimMains(props: { request: any }) {
  const imgSize = 22
  return (
    <Flex>
      <img style={{width: imgSize}} src={Assets.getStatIcon(props.request.simBody, true)}/>
      <img style={{width: imgSize}} src={Assets.getStatIcon(props.request.simFeet, true)}/>
      <img style={{width: imgSize}} src={Assets.getStatIcon(props.request.simLinkRope, true)}/>
      <img style={{width: imgSize}} src={Assets.getStatIcon(props.request.simPlanarSphere, true)}/>
    </Flex>
  )
}

function SimSubstats(props: { request: any }) {
  const renderArray: Stat[] = []
  const substats = inputToSubstats(props.request)
  for (const stat of Constants.SubStats) {
    const value = substats[stat]
    if (value) {
      renderArray.push({
        stat: stat,
        value: value
      })
    }
  }

  return (
    <Flex gap={5}>
      {
        renderArray.map((x) => {
          return (
            <Flex key={x.stat}>
              {`${StatsToShort[x.stat]}: ${x.value}${Utils.isFlat(x.stat) ? '' : '%'}`}
            </Flex>
          )
        })
      }
    </Flex>
  )
}

export function deleteStatSimulationBuild(record: { key: React.Key, name: string }) {
  console.log('Delete sim', record)
  const statSims = window.store.getState().statSimulations
  const updatedSims = Utils.clone(statSims.filter(x => x.key != record.key))

  window.store.getState().setStatSimulations(updatedSims)
  setFormStatSimulations(updatedSims)

  SaveState.save()
}

export function deleteAllStatSimulationBuilds() {
  window.store.getState().setStatSimulations([])
  setFormStatSimulations([])

  SaveState.save()
}

export function setFormStatSimulations(simulations) {
  window.optimizerForm.setFieldValue(['statSim', 'simulations'], simulations)
}

export function startStatSimulation() {
  const form = OptimizerTabController.getForm()
  const existingSimulations = window.store.getState().statSimulations || []

  if (existingSimulations.length == 0) return
  if (!OptimizerTabController.validateForm(form)) return

  console.log('Starting sims', existingSimulations)

  const simulationResults = []

  for (const sim of existingSimulations) {
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

    const relicSet1 = request.simRelicSet1 || -1
    const relicSet2 = request.simRelicSet2 || -1
    const ornamentSet = request.simOrnamentSet || -1

    head.set = relicSet1
    hands.set = relicSet1
    body.set = relicSet2
    feet.set = relicSet2
    linkRope.set = ornamentSet
    planarSphere.set = ornamentSet

    head.part = Parts.Head
    hands.part = Parts.Hands
    body.part = Parts.Body
    feet.part = Parts.Feet
    linkRope.part = Parts.LinkRope
    planarSphere.part = Parts.PlanarSphere

    const substatValues: Stat[] = []
    const requestSubstats = inputToSubstats(request)
    for (const substat of SubStats) {
      const value = requestSubstats[substat]
      if (value) {
        substatValues.push({
          stat: substat,
          value: value
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
    c.statSim = sim
    simulationResults.push(c)
  }

  OptimizerTabController.setRows(simulationResults)
  window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })

  const sortOption = SortOption[form.resultSort]
  const gridSortColumn = form.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
  setSortColumn(gridSortColumn)
}

function inputToSubstats(request) {
  return {
    [Stats.HP_P]: request.simHpP,
    [Stats.ATK_P]: request.simAtkP,
    [Stats.DEF_P]: request.simDefP,
    [Stats.HP]: request.simHp,
    [Stats.ATK]: request.simAtk,
    [Stats.DEF]: request.simDef,
    [Stats.SPD]: request.simSpd,
    [Stats.CR]: request.simCr,
    [Stats.CD]: request.simCd,
    [Stats.EHR]: request.simEhr,
    [Stats.RES]: request.simRes,
    [Stats.BE]: request.simBe,
  }
}