import { CustomCellRendererProps } from 'ag-grid-react'
import { Button, Flex } from 'antd'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { Relic } from 'types/relic'

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
          console.log(OptimizerTabController.calculateRelicsFromId(props.data!.id))
        }}
      >
        id = {props.data?.id}
      </Button>
    </Flex>
  )
}

function calculateDmgUpgrades(build: { Head: Relic; Hands: Relic; Body: Relic; Feet: Relic; PlanarSphere: Relic; LinkRope: Relic }) {

}
