import { CustomCellRendererProps } from 'ag-grid-react'
import { Button, Flex } from 'antd'
import { Constants } from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { calculateOrnamentSets, calculateRelicSets, convertRelicsToSimulation } from 'lib/simulations/statSimulationController'
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
  const currentBuildRequest = calculateCombo(props.data)
  return (
    <Flex vertical flex={1} style={{ alignItems: 'center' }}>
      <HeaderText>Dmg Upgrades</HeaderText>
      <Button
        onClick={() => { console.log(currentBuildRequest) }}
      >
        id = {props.data?.id}
      </Button>
    </Flex>
  )
}

function calculateCombo(data?: OptimizerDisplayDataStatSim) {
  if (!data?.id) return null
  // Generate relics from selected row
  const relicsByPart = OptimizerTabController.calculateRelicsFromId(data.id)

  // Calculate relic sets
  const relicSetIndex = data.relicSetIndex
  const numSetsR = Object.values(Constants.SetsRelics).length
  const s1 = relicSetIndex % numSetsR
  const s2 = ((relicSetIndex - s1) / numSetsR) % numSetsR
  const s3 = ((relicSetIndex - s2 * numSetsR - s1) / (numSetsR * numSetsR)) % numSetsR
  const s4 = ((relicSetIndex - s3 * numSetsR * numSetsR - s2 * numSetsR - s1) / (numSetsR * numSetsR * numSetsR)) % numSetsR
  const relicSets = [s1, s2, s3, s4]
  const relicSetNames: string[] = calculateRelicSets(relicSets)

  // Calculate ornament sets
  const ornamentSetIndex = data.ornamentSetIndex
  const ornamentSetCount = Object.values(Constants.SetsOrnaments).length
  const os1 = ornamentSetIndex % ornamentSetCount
  const os2 = ((ornamentSetIndex - os1) / ornamentSetCount) % ornamentSetCount
  const ornamentSetName: string | undefined = calculateOrnamentSets([os1, os2], false)

  const request = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, 1)
  return request
}
