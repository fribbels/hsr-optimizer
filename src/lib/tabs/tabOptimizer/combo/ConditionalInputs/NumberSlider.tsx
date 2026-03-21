import {
  IconCircleMinus,
  IconCirclePlus,
} from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import { buttonStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { getTeammateIndex } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { locateConditional, useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import type { ComboNumberConditional } from 'lib/tabs/tabOptimizer/combo/comboDrawerTypes'
import { FormSliderWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import type { ContentItem } from 'types/conditionals'

export function NumberSlider({ contentItem, value, sourceKey, partitionIndex }: {
  contentItem: ContentItem
  value: number
  sourceKey: string
  partitionIndex: number
}) {
  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center'>
      <Flex w={210} align='center'>
        {/* @ts-expect-error - FormSliderWithPopover spread props type mismatch */}
        <FormSliderWithPopover
          key={value + partitionIndex}
          {...contentItem}
          title={contentItem.text}
          content={ColorizeNumbers(contentItem.content)}
          teammateIndex={getTeammateIndex(sourceKey)}
          text={contentItem.text}
          onChange={(val: number) => {
            useComboDrawerStore.getState().setNumberDefault(sourceKey, contentItem.id, partitionIndex, val)
          }}
          value={value}
          removeForm={true}
        />
      </Flex>
      <Button
        variant='transparent'
        leftSection={partitionIndex === 0
          ? <IconCirclePlus style={buttonStyle} />
          : <IconCircleMinus style={buttonStyle} />}
        onClick={() => {
          if (partitionIndex === 0) {
            const state = useComboDrawerStore.getState()
            const cond = locateConditional(state, sourceKey, contentItem.id)
            const partitions = (cond as ComboNumberConditional)?.partitions ?? []
            const usedValues = new Set(partitions.map((p) => p.value))
            const min = (contentItem as ContentItem & { min?: number }).min ?? 0
            const max = (contentItem as ContentItem & { max?: number }).max ?? 10
            let newValue = min
            for (let v = min; v <= max; v++) {
              if (!usedValues.has(v)) { newValue = v; break }
            }
            state.addPartition(sourceKey, contentItem.id, partitionIndex, newValue)
          } else {
            useComboDrawerStore.getState().deletePartition(sourceKey, contentItem.id, partitionIndex)
          }
        }}
      />
    </Flex>
  )
}
