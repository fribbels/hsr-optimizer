import type { ComboSubNumberConditional } from 'lib/optimization/combo/comboTypes'
import { comboRowStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { BoxArray } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BoxArray'
import { NumberSelect } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/NumberSelect'
import { NumberSlider } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/NumberSlider'
import { useMemo } from 'react'
import type { ContentItem } from 'types/conditionals'

export function Partition({
  partition,
  contentItem,
  activations,
  partitionIndex,
  actionCount,
  sourceKey,
}: {
  partition: ComboSubNumberConditional,
  contentItem: ContentItem,
  activations: boolean[],
  partitionIndex: number,
  actionCount: number,
  sourceKey: string,
}) {
  const dataKeys = useMemo(
    () =>
      activations.map((_, i) =>
        JSON.stringify({
          id: contentItem.id,
          source: sourceKey,
          partitionIndex: partitionIndex,
          index: i,
        })
      ),
    [contentItem.id, sourceKey, partitionIndex, activations.length],
  )

  const numberInput = contentItem.formItem === 'slider'
    ? (
      <NumberSlider
        contentItem={contentItem as ContentItem & { min: number, max: number }}
        value={partition.value}
        sourceKey={sourceKey}
        partitionIndex={partitionIndex}
      />
    )
    : (
      <NumberSelect
        contentItem={contentItem}
        value={partition.value}
        sourceKey={sourceKey}
        partitionIndex={partitionIndex}
      />
    )

  return (
    <div style={comboRowStyle}>
      {numberInput}
      <BoxArray
        activations={activations}
        actionCount={actionCount}
        dataKeys={dataKeys}
        partition={true}
      />
    </div>
  )
}
