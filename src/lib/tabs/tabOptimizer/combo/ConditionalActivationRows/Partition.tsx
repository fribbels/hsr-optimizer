import { Flex } from '@mantine/core'
import { BoxArray } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BoxArray'
import { NumberSelect } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/NumberSelect'
import { NumberSlider } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/NumberSlider'
import {
  ComboState,
  ComboSubNumberConditional,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ContentItem } from 'types/conditionals'

export function Partition({
  partition,
  contentItem,
  activations,
  partitionIndex,
  actionCount,
  sourceKey,
  comboState,
  onComboStateChange,
}: {
  partition: ComboSubNumberConditional
  contentItem: ContentItem
  activations: boolean[]
  partitionIndex: number
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const dataKeys = activations.map((_, i) =>
    JSON.stringify({
      id: contentItem.id,
      source: sourceKey,
      partitionIndex: partitionIndex,
      index: i,
    }),
  )

  const NumberInput = contentItem.formItem === 'slider' ? NumberSlider : NumberSelect

  return (
    <Flex h={45}>
      <NumberInput
        contentItem={contentItem}
        value={partition.value}
        sourceKey={sourceKey}
        partitionIndex={partitionIndex}
        comboState={comboState}
        onComboStateChange={onComboStateChange}
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
