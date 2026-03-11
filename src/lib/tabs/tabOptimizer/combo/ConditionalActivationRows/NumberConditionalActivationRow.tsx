import { Flex } from '@mantine/core'
import { Partition } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/Partition'
import { PartitionDivider } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/PartitionDivider'
import {
  ComboNumberConditional,
  ComboState,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ReactElement } from 'types/components'
import { ContentItem } from 'types/conditionals'

export function NumberConditionalActivationRow(props: {
  comboConditional: ComboNumberConditional
  contentItem: ContentItem
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const numberComboConditional = props.comboConditional
  const displaySortWrappers: {
    display: ReactElement
    value: number
  }[] = []

  for (let i = 0; i < numberComboConditional.partitions.length; i++) {
    const x = numberComboConditional.partitions[i]

    displaySortWrappers.push({
      value: x.value,
      display: (
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
        />
      ),
    })
  }

  const sortedDisplays = displaySortWrappers
    .sort((a, b) => a.value - b.value)
    .map((x) => x.display)

  return (
    <Flex
      direction="column"
      style={{ position: 'relative' }}
    >
      <PartitionDivider />
      {sortedDisplays}
      <PartitionDivider bottom />
    </Flex>
  )
}
