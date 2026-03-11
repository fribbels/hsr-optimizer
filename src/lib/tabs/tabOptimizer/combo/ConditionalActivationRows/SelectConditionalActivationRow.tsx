import { Flex } from '@mantine/core'
import { Partition } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/Partition'
import { PartitionDivider } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/PartitionDivider'
import {
  ComboSelectConditional,
  ComboState,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ReactElement } from 'types/components'
import { ContentItem } from 'types/conditionals'

export function SelectConditionalActivationRow(props: {
  comboConditional: ComboSelectConditional
  contentItem: ContentItem
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const selectComboConditional = props.comboConditional
  const display: ReactElement[] = []

  for (let i = 0; i < selectComboConditional.partitions.length; i++) {
    const x = selectComboConditional.partitions[i]
    display.push(
      <Partition
        key={i}
        partition={x}
        contentItem={props.contentItem}
        activations={x.activations}
        partitionIndex={i}
        actionCount={props.actionCount}
        sourceKey={props.sourceKey}
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />,
    )
  }

  return (
    <Flex
      direction="column"
      style={{ position: 'relative' }}
    >
      <PartitionDivider />
      {display}
      <PartitionDivider bottom />
    </Flex>
  )
}
