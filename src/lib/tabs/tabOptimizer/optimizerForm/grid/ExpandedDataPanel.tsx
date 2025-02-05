import { CustomCellRendererProps } from 'ag-grid-react'
import { Button, Flex } from 'antd'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import {
  convertRelicsToSimulation,
  ornamentSetIndexToName,
  relicSetIndexToNames,
  runSimulations,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationController'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'

export function ExpandedDataPanel(props: CustomCellRendererProps<OptimizerDisplayDataStatSim>) {
  const string = props.data?.id
  return (
    <Flex style={{ height: '100%' }}>

      <Flex vertical flex={1} style={{ alignItems: 'center' }}>
        <div>id = {string}</div>
      </Flex>

      <VerticalDivider/>

      <Flex vertical flex={1} style={{ alignItems: 'center' }}>
        <div>id = {string}</div>
      </Flex>

      <VerticalDivider/>

      <DamageUpgrades {...props}/>

      <VerticalDivider/>

      <Flex vertical flex={1} style={{ alignItems: 'center' }}>
        <div>id = {string}</div>
      </Flex>

      <VerticalDivider/>

      <Flex vertical flex={1} style={{ alignItems: 'center' }}>
        <div>id = {string}</div>
      </Flex>

      <VerticalDivider/>

      <Flex vertical flex={1} style={{ alignItems: 'center' }}>
        <div>id = {string}</div>
      </Flex>

    </Flex>
  )
}

function DamageUpgrades(props: CustomCellRendererProps<OptimizerDisplayDataStatSim>) {
  return (
    <Flex vertical flex={1} style={{ alignItems: 'center' }}>
      <HeaderText>Dmg Upgrades</HeaderText>
      <Button
        onClick={() => {
          console.log(calculateSets(props.data!.id, props.data!.ornamentSetIndex, props.data!.relicSetIndex))
        }}
      >
        id = {props.data?.id}
      </Button>
    </Flex>
  )
}

function calculateSets(id: number, ornamentIndex: number, relicIndex: number) {
  const optimizationID = window.store.getState().optimizationId
  if (!optimizationID) return null
  const form = optimizerFormCache[optimizationID]
  const context = generateContext(form)
  form.trace = true
  const simulations: { request: SimulationRequest; key: string }[] = []
  const relics: SingleRelicByPart = OptimizerTabController.calculateRelicsFromId(id)
  const relicSets = relicSetIndexToNames(relicIndex)
  const ornamentSets = ornamentSetIndexToName(ornamentIndex)
  const simulation = convertRelicsToSimulation(relics, relicSets[0], relicSets[1], ornamentSets)
  /* for (const substat of SubStats) {
    const upgradeSim = TsUtils.clone(simulation)
    if (upgradeSim.stats[substat]) {
      upgradeSim.stats[substat]++
    } else {
      upgradeSim.stats[substat] = 1
    }
    upgradeSim.name = `upgrade${substat}`
    simulations.push({ request: upgradeSim as SimulationRequest, key: upgradeSim.name })
  } */
  const currentBuild = runSimulations(
    form,
    context,
    [{ request: simulation as SimulationRequest } as Simulation],
  )
  return {
    relicSets,
    ornamentSets,
    relics,
    simulation,
    currentBuild: currentBuild[0],
    context,
    form,
  }
}
