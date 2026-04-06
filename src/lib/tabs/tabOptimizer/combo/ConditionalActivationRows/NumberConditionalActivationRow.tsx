import { Partition } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/Partition'
import { PartitionDivider } from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/PartitionDivider'
import { comboColumnStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
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
    <div style={comboColumnStyle}>
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
    </div>
  )
}
