import { Flex } from '@mantine/core'
import { Partition } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/Partition'
import { PartitionDivider } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/PartitionDivider'
import type { ComboSelectConditional } from 'lib/optimization/combo/comboTypes'
import type { ContentItem } from 'types/conditionals'

export function SelectConditionalActivationRow({
  comboConditional,
  contentItem,
  actionCount,
  sourceKey,
}: {
  comboConditional: ComboSelectConditional
  contentItem: ContentItem
  actionCount: number
  sourceKey: string
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
        />
      ))}
      <PartitionDivider bottom />
    </Flex>
  )
}
