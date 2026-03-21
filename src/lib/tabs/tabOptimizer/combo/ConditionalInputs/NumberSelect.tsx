import {
  IconCircleMinus,
  IconCirclePlus,
} from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import { buttonStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { getTeammateIndex } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { locateConditional, useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import type { ComboNumberConditional } from 'lib/tabs/tabOptimizer/combo/comboDrawerTypes'
import { FormSelectWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import type { ContentItem } from 'types/conditionals'

export function NumberSelect({ contentItem, value, sourceKey, partitionIndex }: {
  contentItem: ContentItem
  value: number
  sourceKey: string
  partitionIndex: number
}) {
  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={5}>
      <FormSelectWithPopover
        {...contentItem}
        title={contentItem.text}
        teammateIndex={getTeammateIndex(sourceKey)}
        content={ColorizeNumbers(contentItem.content)}
        text={contentItem.text}
        set={sourceKey.includes('comboCharacterRelicSets')}
        onChange={(val: number) => {
          useComboDrawerStore.getState().setNumberDefault(sourceKey, contentItem.id, partitionIndex, val)
        }}
        value={value}
        removeForm={true}
        fullWidth={!sourceKey.includes('comboCharacterRelicSets')}
      />
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
            const options = (contentItem as ContentItem & { options?: Array<{ value: number }> }).options
            let newValue = options?.[0]?.value ?? 0
            for (const opt of options ?? []) {
              if (!usedValues.has(opt.value)) { newValue = opt.value; break }
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
