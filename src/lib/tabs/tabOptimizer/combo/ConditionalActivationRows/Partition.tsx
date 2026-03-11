import { Flex } from '@mantine/core'
import { BoxArray } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BoxArray'
import { NumberSelect } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/NumberSelect'
import { NumberSlider } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/NumberSlider'
import {
  ComboState,
  ComboSubNumberConditional,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ContentItem } from 'types/conditionals'

export function Partition(props: {
  partition: ComboSubNumberConditional
  contentItem: ContentItem
  activations: boolean[]
  partitionIndex: number
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const dataKeys: string[] = []

  for (let i = 0; i < props.activations.length; i++) {
    dataKeys.push(JSON.stringify({
      id: props.contentItem.id,
      source: props.sourceKey,
      partitionIndex: props.partitionIndex,
      index: i,
    }))
  }

  const render = props.contentItem.formItem == 'slider'
    ? (
      <NumberSlider
        contentItem={props.contentItem}
        value={props.partition.value}
        sourceKey={props.sourceKey}
        partitionIndex={props.partitionIndex}
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
    )
    : (
      <NumberSelect
        contentItem={props.contentItem}
        value={props.partition.value}
        sourceKey={props.sourceKey}
        partitionIndex={props.partitionIndex}
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
    )

  return (
    <Flex key={props.partitionIndex} style={{ height: 45 }}>
      {render}
      <BoxArray
        activations={props.activations}
        actionCount={props.actionCount}
        dataKeys={dataKeys}
        partition={true}
      />
    </Flex>
  )
}
