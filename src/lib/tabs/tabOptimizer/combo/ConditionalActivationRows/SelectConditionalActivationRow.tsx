import { Flex } from '@mantine/core'
import { Partition } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/Partition'
import { PartitionDivider } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/PartitionDivider'
import {
  ComboSelectConditional,
  ComboState,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ContentItem } from 'types/conditionals'

export function SelectConditionalActivationRow({ comboConditional, contentItem, actionCount, sourceKey, comboState, onComboStateChange }: {
  comboConditional: ComboSelectConditional
  contentItem: ContentItem
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  return (
    <Flex
      direction="column"
      style={{ position: 'relative' }}
    >
      <PartitionDivider />
      {comboConditional.partitions.map((partition, i) => (
        <Partition
          key={i}
          partition={partition}
          contentItem={contentItem}
          activations={partition.activations}
          partitionIndex={i}
          actionCount={actionCount}
          sourceKey={sourceKey}
          comboState={comboState}
          onComboStateChange={onComboStateChange}
        />
      ))}
      <PartitionDivider bottom />
    </Flex>
  )
}
