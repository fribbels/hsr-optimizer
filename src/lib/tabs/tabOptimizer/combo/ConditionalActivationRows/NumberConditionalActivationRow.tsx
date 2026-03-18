import { Flex } from '@mantine/core'
import { Partition } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/Partition'
import { PartitionDivider } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/PartitionDivider'
import type {
  ComboNumberConditional,
  ComboState,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import type { ContentItem } from 'types/conditionals'

export function NumberConditionalActivationRow({
  comboConditional,
  contentItem,
  actionCount,
  sourceKey,
  comboState,
  onComboStateChange,
}: {
  comboConditional: ComboNumberConditional
  contentItem: ContentItem
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const sortedPartitions = comboConditional.partitions
    .map((partition, i) => ({ partition, originalIndex: i }))
    .toSorted((a, b) => a.partition.value - b.partition.value)

  return (
    <Flex
      direction="column"
      style={{ position: 'relative' }}
    >
      <PartitionDivider />
      {sortedPartitions.map(({ partition, originalIndex }) => (
        <Partition
          key={originalIndex}
          partition={partition}
          contentItem={contentItem}
          activations={partition.activations}
          partitionIndex={originalIndex}
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
