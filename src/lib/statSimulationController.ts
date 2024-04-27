import { StatSimulationOptions } from "components/optimizerTab/optimizerForm/DamageCalculatorDisplay";
import { Utils } from "lib/utils";
import { Constants, Parts, Stats, SubStats } from "lib/constants";
import { emptyRelic } from "lib/optimizer/optimizerUtils";
import { StatCalculator } from "lib/statCalculator";
import { Stat } from "types/Relic";
import { RelicFilters } from "lib/relicFilters";
import { calculateBuild } from "lib/optimizer/calculateBuild";
import { OptimizerTabController } from "lib/optimizerTabController";
import { renameFields } from "lib/optimizer/optimizer";

export function saveStatSimulationBuild() {
  const form = window.optimizerForm.getFieldsValue()
  console.debug(form.statSim);

  const simType = window.store.getState().statSimulationDisplay

  // Check for invalid button presses
  if (simType == StatSimulationOptions.Disabled || !form.statSim || !form.statSim[simType]) {
    console.warn('Invalid sim', form, simType)
    return
  }

  const simRequest = form.statSim[simType]
  console.debug(simRequest)
  // TODO: Validate request

  const existingSimulations = window.store.getState().statSimulations || []
  const simulation = {
    name: Math.random(),
    key: Math.random(),
    simType: simType,
    request: simRequest,
  }
  existingSimulations.push(simulation)

  const cloned = Utils.clone(existingSimulations)
  window.store.getState().setStatSimulations(cloned)
  setFormStatSimulations(cloned)
}

export function deleteStatSimulationBuild(record: {key: React.Key, name: string}) {
  console.log(record)
  const statSims = window.store.getState().statSimulations
  const updatedSims = Utils.clone(statSims.filter(x => x.key != record.key))

  window.store.getState().setStatSimulations(updatedSims)
  setFormStatSimulations(updatedSims)
}

export function setFormStatSimulations(simulations) {
  window.optimizerForm.setFieldValue(['statSim', 'simulations'], simulations)
}

export function startStatSimulation() {
  const form = OptimizerTabController.getForm()
  const existingSimulations = window.store.getState().statSimulations || []

  if (existingSimulations.length == 0) return
  if (!OptimizerTabController.validateForm(form)) return

  console.debug(existingSimulations)

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

    console.debug(c, relics)

    renameFields(c)
    c.statSim = sim
    simulationResults.push(c)
  }

  OptimizerTabController.setRows(simulationResults)
  window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })

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