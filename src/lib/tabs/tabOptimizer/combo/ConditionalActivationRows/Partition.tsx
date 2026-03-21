import { useMemo } from 'react'
import { Flex } from '@mantine/core'
import { BoxArray } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BoxArray'
import { NumberSelect } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/NumberSelect'
import { NumberSlider } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/NumberSlider'
import type { ComboSubNumberConditional } from 'lib/tabs/tabOptimizer/combo/comboDrawerTypes'
import type { ContentItem } from 'types/conditionals'

export function Partition({
  partition,
  contentItem,
  activations,
  partitionIndex,
  actionCount,
  sourceKey,
}: {
  partition: ComboSubNumberConditional
  contentItem: ContentItem
  activations: boolean[]
  partitionIndex: number
  actionCount: number
  sourceKey: string
}) {
  const dataKeys = useMemo(
    () => activations.map((_, i) =>
      JSON.stringify({
        id: contentItem.id,
        source: sourceKey,
        partitionIndex: partitionIndex,
        index: i,
      }),
    ),
    [contentItem.id, sourceKey, partitionIndex, activations.length],
  )

  const NumberInput = contentItem.formItem === 'slider' ? NumberSlider : NumberSelect

  return (
    <Flex h={45}>
      <NumberInput
        contentItem={contentItem}
        value={partition.value}
        sourceKey={sourceKey}
        partitionIndex={partitionIndex}
      />
      <BoxArray
        activations={activations}
        actionCount={actionCount}
        dataKeys={dataKeys}
        partition={true}
      />
    </Flex>
  )
}
