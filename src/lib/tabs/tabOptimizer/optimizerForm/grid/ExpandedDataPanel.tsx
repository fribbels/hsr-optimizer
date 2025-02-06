import { CustomCellRendererProps } from 'ag-grid-react'
import { Button, Divider, Flex } from 'antd'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { Assets } from 'lib/rendering/assets'
import {
  convertRelicsToSimulation,
  ornamentSetIndexToName,
  relicSetIndexToNames,
  runSimulations,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import React from 'react'

export function ExpandedDataPanel(props: CustomCellRendererProps<OptimizerDisplayDataStatSim>) {
  return !props.data
    ? (<></>)
    : (
      <Flex style={{ height: '100%' }}>

        <Flex vertical flex={1} style={{ alignItems: 'center' }}>
          <div>id = {props.data.id}</div>
        </Flex>

        <VerticalDivider/>

        <Flex vertical flex={1} style={{ alignItems: 'center' }}>
          <div>id = {props.data.id}</div>
        </Flex>

        <VerticalDivider/>

        <DamageUpgrades
          id={props.data.id}
          ornamentIndex={props.data.ornamentSetIndex}
          relicIndex={props.data.relicSetIndex}
          combo={props.data.COMBO}
        />

        <VerticalDivider/>

        <Flex vertical flex={1} style={{ alignItems: 'center' }}>
          <div>id = {props.data.id}</div>
        </Flex>

        <VerticalDivider/>

        <Flex vertical flex={1} style={{ alignItems: 'center' }}>
          <div>id = {props.data.id}</div>
        </Flex>

      </Flex>
    )
}

function DamageUpgrades(props: { id: number; relicIndex: number; ornamentIndex: number; combo: number }) {
  const statUpgrades = calculateStatUpgrades(props.id, props.ornamentIndex, props.relicIndex)
    .filter((result) => result.COMBO > props.combo)
    .sort((a, b) => a.COMBO > b.COMBO ? -1 : 1)
    .map((result) => (
      <Flex key={Utils.randomId()} align='center' justify='space-between' style={{ width: '100%' }}>
        <img src={Assets.getStatIcon(result.statSim.key)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <StatTextSm>{`+1x ${result.statSim.key}`}</StatTextSm>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
        <StatTextSm>{`+ ${TsUtils.precisionRound(((result.COMBO / props.combo) - 1) * 100, 2).toLocaleString()}%`}</StatTextSm>
      </Flex>
    ),
    )
  return (
    <Flex vertical flex={1} style={{ alignItems: 'center' }}>
      <HeaderText>Dmg Upgrades</HeaderText>
      {statUpgrades}
      <Button
        onClick={() => {
          console.log(calculateStatUpgrades(props.id, props.ornamentIndex, props.relicIndex))
        }}
      >
        id = {props.id}
      </Button>
    </Flex>
  )
}

function calculateStatUpgrades(id: number, ornamentIndex: number, relicIndex: number) {
  // pull from cache instead of current form as the form may change since last optimizer run, and we want to match optimizer run's conditionals
  const optimizationID = window.store.getState().optimizationId!
  const form = optimizerFormCache[optimizationID] //
  const context = generateContext(form)

  const simulations: Simulation[] = []
  const relics: SingleRelicByPart = OptimizerTabController.calculateRelicsFromId(id)
  const relicSets = relicSetIndexToNames(relicIndex)
  const ornamentSets = ornamentSetIndexToName(ornamentIndex)
  const simulation = convertRelicsToSimulation(relics, relicSets[0], relicSets[1], ornamentSets)

  for (const substat of SubStats) {
    const upgradeSim = TsUtils.clone(simulation)
    if (upgradeSim.stats[substat]) {
      upgradeSim.stats[substat]++
    } else {
      upgradeSim.stats[substat] = 1
    }
    simulations.push({ request: upgradeSim as SimulationRequest, simType: StatSimTypes.SubstatRolls, key: substat } as Simulation)
  }

  return runSimulations(
    form,
    context,
    simulations,
  )
}
