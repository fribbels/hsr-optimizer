import { Flex } from '@mantine/core'
import { Partition } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/Partition'
import { PartitionDivider } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/PartitionDivider'
import type { ComboNumberConditional } from 'lib/optimization/combo/comboTypes'
import type { ContentItem } from 'types/conditionals'

export function NumberConditionalActivationRow({
  comboConditional,
  contentItem,
  actionCount,
  sourceKey,
}: {
  comboConditional: ComboNumberConditional
  contentItem: ContentItem
  actionCount: number
  sourceKey: string
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
        />
      ))}
      <PartitionDivider bottom />
    </Flex>
  )
}
